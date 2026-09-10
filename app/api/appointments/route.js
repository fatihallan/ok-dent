import { createHash, createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}

function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");

  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "local-or-unknown"
  );
}

function istanbulToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function cleanString(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function isValidEmail(value) {
  if (!value) return true;
  if (value.length > 160) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTime(value) {
  return /^\d{2}:\d{2}$/.test(value);
}

export async function POST(request) {
  const supabaseUrl =
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !secretKey) {
    console.error("Appointment API env eksik.");
    return json({ ok: false, code: "SERVER_CONFIG" }, 500);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ ok: false, code: "INVALID_JSON" }, 400);
  }

  // Honeypot: gerçek kullanıcı bu alanı görmez/doldurmaz.
  if (cleanString(body?.website, 200)) {
    // Bota başarılı gibi görünür ama veri kaydedilmez.
    return json({ ok: true });
  }

  const fullName = cleanString(body?.full_name, 120);
  const phone = cleanString(body?.phone, 40);
  const email = cleanString(body?.email, 160);
  const treatment = cleanString(body?.treatment, 160);
  const appointmentDate = cleanString(body?.appointment_date, 10);
  const appointmentTime = cleanString(body?.appointment_time, 5);
  const note = cleanString(body?.note, 2000);
  const doctorId = Number(body?.doctor_id);

  const phoneNumbers = phone.replace(/\D/g, "");

  if (fullName.length < 2 || fullName.length > 120) {
    return json({ ok: false, code: "INVALID_NAME" }, 400);
  }

  if (phoneNumbers.length < 10 || phoneNumbers.length > 15) {
    return json({ ok: false, code: "INVALID_PHONE" }, 400);
  }

  if (!isValidEmail(email)) {
    return json({ ok: false, code: "INVALID_EMAIL" }, 400);
  }

  if (!Number.isInteger(doctorId) || doctorId <= 0) {
    return json({ ok: false, code: "INVALID_DOCTOR" }, 400);
  }

  if (!isValidDate(appointmentDate) || appointmentDate < istanbulToday()) {
    return json({ ok: false, code: "INVALID_DATE" }, 400);
  }

  if (!isValidTime(appointmentTime)) {
    return json({ ok: false, code: "INVALID_TIME" }, 400);
  }

  const supabaseAdmin = createClient(supabaseUrl, secretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  try {
    const clientIp = getClientIp(request);
    const ipHash = createHmac("sha256", secretKey)
      .update(clientIp)
      .digest("hex");

    const { data: rateAllowed, error: rateError } = await supabaseAdmin.rpc(
      "check_appointment_rate_limit",
      {
        p_ip_hash: ipHash,
        p_limit: RATE_LIMIT_MAX,
        p_window_minutes: RATE_LIMIT_WINDOW_MINUTES,
      }
    );

    if (rateError) {
      console.error("Rate limit RPC hatası:", rateError);
      return json({ ok: false, code: "RATE_LIMIT_CHECK_FAILED" }, 500);
    }

    if (rateAllowed !== true) {
      return json({ ok: false, code: "RATE_LIMITED" }, 429);
    }

    const [{ data: doctor, error: doctorError }, { data: pageSettings, error: pageError }] =
      await Promise.all([
        supabaseAdmin
          .from("doctors")
          .select("id, full_name, is_active")
          .eq("id", doctorId)
          .eq("is_active", true)
          .maybeSingle(),

        supabaseAdmin
          .from("appointment_page_settings")
          .select("treatments, time_options, note_max_length")
          .eq("setting_key", "main")
          .maybeSingle(),
      ]);

    if (doctorError || !doctor) {
      if (doctorError) console.error("Doktor doğrulama hatası:", doctorError);
      return json({ ok: false, code: "INVALID_DOCTOR" }, 400);
    }

    if (pageError) {
      console.error("Randevu ayarları doğrulama hatası:", pageError);
      return json({ ok: false, code: "PAGE_SETTINGS_FAILED" }, 500);
    }

    const allowedTreatments = Array.isArray(pageSettings?.treatments)
      ? pageSettings.treatments
      : [];

    const allowedTimes = Array.isArray(pageSettings?.time_options)
      ? pageSettings.time_options
      : [];

    if (treatment && allowedTreatments.length > 0 && !allowedTreatments.includes(treatment)) {
      return json({ ok: false, code: "INVALID_TREATMENT" }, 400);
    }

    if (allowedTimes.length > 0 && !allowedTimes.includes(appointmentTime)) {
      return json({ ok: false, code: "INVALID_TIME" }, 400);
    }

    const noteMaxLength = Number(pageSettings?.note_max_length);
    if (Number.isFinite(noteMaxLength) && noteMaxLength > 0 && note.length > noteMaxLength) {
      return json({ ok: false, code: "NOTE_TOO_LONG" }, 400);
    }

    const { error: insertError } = await supabaseAdmin
      .from("appointments")
      .insert({
        full_name: fullName,
        phone,
        email: email || null,
        doctor_id: doctorId,
        doctor_name: doctor.full_name || null,
        treatment: treatment || null,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        note: note || null,
        status: "new",
      });

    if (insertError) {
      console.error("Randevu insert hatası:", insertError);
      return json({ ok: false, code: "INSERT_FAILED" }, 500);
    }

    return json({ ok: true }, 201);
  } catch (error) {
    console.error("Appointment API beklenmeyen hata:", error);
    return json({ ok: false, code: "SERVER_ERROR" }, 500);
  }
}
