"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabaseClient";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function RandevuPage() {
  const [doctors, setDoctors] = useState([]);
  const [settings, setSettings] = useState(null);
  const [pageSettings, setPageSettings] = useState(null);

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    doctor_id: "",
    treatment: "",
    appointment_date: "",
    appointment_time: "",
    note: "",
    website: "",
  });

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    const supabase = createClient();

    try {
      const [doctorsResult, settingsResult, pageSettingsResult] = await Promise.all([
        supabase
          .from("doctors")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("site_settings")
          .select("*")
          .eq("setting_key", "main")
          .single(),

        supabase
          .from("appointment_page_settings")
          .select("*")
          .eq("setting_key", "main")
          .single(),
      ]);

      if (doctorsResult.error) {
        console.error(doctorsResult.error);
      }

      if (settingsResult.error) {
        console.error(settingsResult.error);
      }

      setDoctors(doctorsResult.data || []);
      setSettings(settingsResult.data || null);
      if (pageSettingsResult?.error) console.error(pageSettingsResult.error);
      setPageSettings(pageSettingsResult?.data || null);
    } catch (error) {
      console.error("Randevu sayfası yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  }

  function text(key) {
    const value = pageSettings?.[key];
    return typeof value === "string" ? value : "";
  }

  const treatmentOptions = Array.isArray(pageSettings?.treatments)
    ? pageSettings.treatments
    : [];

  const timeOptions = Array.isArray(pageSettings?.time_options)
    ? pageSettings.time_options
    : [];

  const noteMaxLength =
    Number(pageSettings?.note_max_length) > 0
      ? Number(pageSettings.note_max_length)
      : null;

  const today = useMemo(() => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrorMessage("");
  }

  function formatPhone(value) {
    let numbers = value.replace(/\D/g, "");

    if (numbers.startsWith("90")) {
      numbers = numbers.substring(2);
    }

    if (numbers.startsWith("0")) {
      numbers = numbers.substring(1);
    }

    numbers = numbers.slice(0, 10);

    let result = "";

    if (numbers.length > 0) {
      result += `0${numbers.slice(0, 3)}`;
    }

    if (numbers.length > 3) {
      result += ` ${numbers.slice(3, 6)}`;
    }

    if (numbers.length > 6) {
      result += ` ${numbers.slice(6, 8)}`;
    }

    if (numbers.length > 8) {
      result += ` ${numbers.slice(8, 10)}`;
    }

    return result;
  }

  function handlePhoneChange(event) {
    const formatted = formatPhone(event.target.value);

    setForm((current) => ({
      ...current,
      phone: formatted,
    }));

    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccess(false);

    if (!form.full_name.trim()) {
      setErrorMessage(text("error_full_name"));
      return;
    }

    if (!form.phone.trim()) {
      setErrorMessage(text("error_phone_empty"));
      return;
    }

    const phoneNumbers = form.phone.replace(/\D/g, "");

    if (phoneNumbers.length < 10) {
      setErrorMessage(text("error_phone_invalid"));
      return;
    }

    if (!form.doctor_id) {
      setErrorMessage(text("error_doctor"));
      return;
    }

    if (!form.appointment_date) {
      setErrorMessage(text("error_date"));
      return;
    }

    if (!form.appointment_time) {
      setErrorMessage(text("error_time"));
      return;
    }

    if (form.appointment_date < today) {
      setErrorMessage(text("error_past_date"));
      return;
    }

    setSending(true);

    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          doctor_id: Number(form.doctor_id),
          treatment: form.treatment,
          appointment_date: form.appointment_date,
          appointment_time: form.appointment_time,
          note: form.note.trim(),
          website: form.website,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result?.ok) {
        throw new Error(result?.code || "APPOINTMENT_SUBMIT_FAILED");
      }

      setSuccess(true);

      setForm({
        full_name: "",
        phone: "",
        email: "",
        doctor_id: "",
        treatment: "",
        appointment_date: "",
        appointment_time: "",
        note: "",
        website: "",
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Randevu oluşturulamadı:", error);
      setErrorMessage(text("error_submit"));
    } finally {
      setSending(false);
    }
  }


  function phoneHref(phone) {
    if (!phone) return "#";

    return `tel:${phone.replace(/[^\d+]/g, "")}`;
  }

  function whatsappHref(phone) {
    if (!phone) return "#";

    let clean = phone.replace(/\D/g, "");

    if (clean.startsWith("0")) {
      clean = `90${clean.substring(1)}`;
    }

    return `https://wa.me/${clean}`;
  }

  if (loading) {
    return (
      <main className="loading">
        <div className="loadingMark">{text("loading_mark")}</div>
        <span>{text("loading_text")}</span>

        <style jsx>{`
          .loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            gap: 14px;
            align-items: center;
            justify-content: center;
            background: var(--theme-background);
            color: var(--theme-primary);
            font-family: Arial, Helvetica, sans-serif;
          }

          .loadingMark {
            width: 60px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--theme-radius);
            background: var(--theme-primary);
            color: var(--theme-accent);
            font-weight: 900;
          }

          .loading span {
            color: var(--theme-muted);
            font-size: 12px;
          }
        `}</style>
      </main>
    );
  }

  if (pageSettings && pageSettings.is_active === false) {
    return (
      <main>
        <SiteHeader />
        <section className="inactivePage">
          <div className="container">
            <div className="inactiveCard">
              <div className="inactiveMark">{text("hidden_mark")}</div>
              <span className="eyebrow">{text("hidden_eyebrow")}</span>
              <h1>{text("hidden_title")}</h1>
              <p>{text("hidden_description")}</p>
              <div className="inactiveActions">
                <a href={text("hidden_home_button_link")}>{text("hidden_home_button_text")}</a>
                {settings?.phone && <a href={phoneHref(settings.phone)}>{text("hidden_phone_button_text")}</a>}
                {settings?.whatsapp && <a href={whatsappHref(settings.whatsapp)} target="_blank" rel="noreferrer">{text("hidden_whatsapp_button_text")}</a>}
              </div>
            </div>
          </div>
        </section>
        <SiteFooter />
        <style jsx>{`
          :global(*){box-sizing:border-box} :global(body){margin:0;background:color-mix(in srgb, var(--theme-background) 82%, white);font-family:Arial,Helvetica,sans-serif;color:var(--theme-primary)}
          .container{width:min(1100px,calc(100% - 40px));margin:0 auto}.inactivePage{min-height:65vh;padding:90px 0;display:flex;align-items:center}
          .inactiveCard{max-width:760px;margin:auto;text-align:center}.inactiveMark{width:64px;height:64px;margin:0 auto 22px;border-radius:var(--theme-radius);background:var(--theme-primary);color:var(--theme-accent);display:flex;align-items:center;justify-content:center;font-weight:900}
          .eyebrow{color:color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));font-size:9px;font-weight:900;letter-spacing:2px}.inactiveCard h1{font-size:clamp(34px,5vw,58px);letter-spacing:-2px;margin:15px 0}.inactiveCard p{color:#777067;line-height:1.8}
          .inactiveActions{display:flex;justify-content:center;flex-wrap:wrap;gap:10px;margin-top:28px}.inactiveActions a{padding:14px 18px;border-radius:10px;background:var(--theme-primary);color:white;text-decoration:none;font-size:10px;font-weight:900}
        `}</style>
      </main>
    );
  }

  return (
    <main>
      {/* ORTAK SITE HEADER */}
      <SiteHeader />

      {/* HERO */}

      <section className="pageHero">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">{text("breadcrumb_home_text")}</a>
            <span>/</span>
            <strong>{text("breadcrumb_current_text")}</strong>
          </div>

          <div className="heroGrid">
            <div>
              <span className="eyebrow">{text("hero_eyebrow")}</span>

              <h1>
                {text("hero_title_first")}<br /><em>{text("hero_title_emphasis")}</em>{" "}{text("hero_title_last")}
              </h1>
            </div>

            <div className="heroInfo">
              <div className="heroInfoNumber">{text("hero_number")}</div>

              <p>
                {text("hero_description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SUCCESS */}

      {success && (
        <section className="successSection">
          <div className="container">
            <div className="successCard">
              <div className="successIcon">{text("success_icon")}</div>

              <div>
                <span>{text("success_eyebrow")}</span>

                <h2>{text("success_title")}</h2>

                <p>
                  {text("success_description")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSuccess(false)}
              >
                {text("success_new_button_text")}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* FORM AREA */}

      <section className="appointmentSection">
        <div className="container appointmentGrid">
          <div className="appointmentFormCard">
            <div className="formTop">
              <div>
                <span className="sectionEyebrow">{text("form_eyebrow")}</span>
                <h2>{text("form_title")}</h2>
              </div>

              <div className="formBadge">
                <span>{text("form_badge_top")}</span>
                <small>{text("form_badge_bottom")}</small>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="hpField" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  value={form.website}
                  onChange={handleChange}
                  autoComplete="off"
                  tabIndex={-1}
                />
              </div>
              <div className="formSection">
                <div className="formSectionTitle">
                  <span>{text("section_1_number")}</span>

                  <div>
                    <strong>{text("section_1_title")}</strong>
                    <small>{text("section_1_description")}</small>
                  </div>
                </div>

                <div className="formGrid">
                  <div className="field fullField">
                    <label htmlFor="full_name">
                      {text("full_name_label")} <span>*</span>
                    </label>

                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      value={form.full_name}
                      onChange={handleChange}
                      placeholder={text("full_name_placeholder")}
                      autoComplete="name"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="phone">
                      {text("phone_label")} <span>*</span>
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handlePhoneChange}
                      placeholder={text("phone_placeholder")}
                      autoComplete="tel"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="email">{text("email_label")}</label>

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder={text("email_placeholder")}
                      autoComplete="email"
                    />
                  </div>
                </div>
              </div>

              <div className="formDivider" />

              <div className="formSection">
                <div className="formSectionTitle">
                  <span>{text("section_2_number")}</span>

                  <div>
                    <strong>{text("section_2_title")}</strong>
                    <small>{text("section_2_description")}</small>
                  </div>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label htmlFor="treatment">{text("treatment_label")}</label>

                    <select
                      id="treatment"
                      name="treatment"
                      value={form.treatment}
                      onChange={handleChange}
                    >
                      <option value="">{text("treatment_placeholder")}</option>

                      {treatmentOptions.map((treatment) => (
                        <option key={treatment} value={treatment}>
                          {treatment}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="doctor_id">
                      {text("doctor_label")} <span>*</span>
                    </label>

                    <select
                      id="doctor_id"
                      name="doctor_id"
                      value={form.doctor_id}
                      onChange={handleChange}
                    >
                      <option value="">{text("doctor_placeholder")}</option>

                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.full_name}
                          {doctor.specialty
                            ? ` — ${doctor.specialty}`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="formDivider" />

              <div className="formSection">
                <div className="formSectionTitle">
                  <span>{text("section_3_number")}</span>

                  <div>
                    <strong>{text("section_3_title")}</strong>
                    <small>{text("section_3_description")}</small>
                  </div>
                </div>

                <div className="formGrid">
                  <div className="field">
                    <label htmlFor="appointment_date">
                      {text("appointment_date_label")} <span>*</span>
                    </label>

                    <input
                      id="appointment_date"
                      name="appointment_date"
                      type="date"
                      min={today}
                      value={form.appointment_date}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="appointment_time">
                      {text("appointment_time_label")} <span>*</span>
                    </label>

                    <select
                      id="appointment_time"
                      name="appointment_time"
                      value={form.appointment_time}
                      onChange={handleChange}
                    >
                      <option value="">{text("appointment_time_placeholder")}</option>

                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="formDivider" />

              <div className="formSection">
                <div className="formSectionTitle">
                  <span>{text("section_4_number")}</span>

                  <div>
                    <strong>{text("section_4_title")}</strong>
                    <small>{text("section_4_description")}</small>
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="note">{text("note_label")}</label>

                  <textarea
                    id="note"
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    rows={5}
                    maxLength={noteMaxLength || undefined}
                    placeholder={text("note_placeholder")}
                  />

                  {noteMaxLength ? (
                    <div className="characterCount">
                      {form.note.length}/{noteMaxLength}
                    </div>
                  ) : null}
                </div>
              </div>

              {errorMessage && (
                <div className="errorBox">
                  <span>{text("error_icon")}</span>
                  {errorMessage}
                </div>
              )}

              <button
                className="submitButton"
                type="submit"
                disabled={sending}
              >
                <div>
                  <strong>
                    {sending
                      ? text("submit_sending_text")
                      : text("submit_button_text")}
                  </strong>

                  <small>
                    {text("submit_button_description")}
                  </small>
                </div>

                <span>{sending ? text("submit_sending_mark") : text("submit_arrow")}</span>
              </button>

              <p className="formNote">
                {text("form_note")}
              </p>
            </form>
          </div>

          {/* RIGHT SIDE */}

          <aside className="appointmentSidebar">
            <div className="sidebarCard darkCard">
              <span className="sidebarEyebrow">{text("process_eyebrow")}</span>

              <h3>
                {text("process_title_first")}
                <br />
                {text("process_title_second")}
              </h3>

              <div className="processList">
                <div className="processItem">
                  <span>{text("process_1_number")}</span>

                  <div>
                    <strong>{text("process_1_title")}</strong>
                    <p>
                      {text("process_1_description")}
                    </p>
                  </div>
                </div>

                <div className="processItem">
                  <span>{text("process_2_number")}</span>

                  <div>
                    <strong>{text("process_2_title")}</strong>
                    <p>
                      {text("process_2_description")}
                    </p>
                  </div>
                </div>

                <div className="processItem">
                  <span>{text("process_3_number")}</span>

                  <div>
                    <strong>{text("process_3_title")}</strong>
                    <p>
                      {text("process_3_description")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="sidebarCard">
              <span className="sidebarEyebrow beigeEyebrow">
                {text("contact_eyebrow")}
              </span>

              <h3>{text("contact_title")}</h3>

              <p className="contactIntro">
                {text("contact_description")}
              </p>

              <div className="contactList">
                {settings?.phone && (
                  <a href={phoneHref(settings.phone)}>
                    <div className="contactIcon">{text("contact_phone_icon")}</div>

                    <div>
                      <small>{text("contact_phone_label")}</small>
                      <strong>{settings.phone}</strong>
                    </div>

                    <span>{text("contact_phone_arrow")}</span>
                  </a>
                )}

                {settings?.whatsapp && (
                  <a
                    href={whatsappHref(settings.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <div className="contactIcon">{text("contact_whatsapp_icon")}</div>

                    <div>
                      <small>{text("contact_whatsapp_label")}</small>
                      <strong>{settings.whatsapp}</strong>
                    </div>

                    <span>{text("contact_whatsapp_arrow")}</span>
                  </a>
                )}

                {settings?.email && (
                  <a href={`mailto:${settings.email}`}>
                    <div className="contactIcon">{text("contact_email_icon")}</div>

                    <div>
                      <small>{text("contact_email_label")}</small>
                      <strong>{settings.email}</strong>
                    </div>

                    <span>{text("contact_email_arrow")}</span>
                  </a>
                )}
              </div>
            </div>

            {settings?.working_hours && (
              <div className="workingHours">
                <span>{text("working_hours_label")}</span>
                <strong>{settings.working_hours}</strong>
              </div>
            )}
          </aside>
        </div>
      </section>
      {/* ORTAK SITE FOOTER */}
      <SiteFooter />

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(html) {
          scroll-behavior: smooth;
        }

        :global(body) {
          margin: 0;
          background: color-mix(in srgb, var(--theme-background) 82%, white);
          color: var(--theme-primary);
          font-family: Arial, Helvetica, sans-serif;
        }

        main {
          min-height: 100vh;
        }

        .container {
          width: min(1240px, calc(100% - 50px));
          margin: 0 auto;
        }

        /* HEADER */

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 88px;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #e9e2d9;
          background: rgba(250, 249, 246, 0.97);
          backdrop-filter: blur(18px);
        }

        .headerInner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--theme-primary);
          text-decoration: none;
        }

        .brandLogo {
          height: 61px;
          width: auto;
          max-width: 175px;
          object-fit: contain;
        }

        .brandMark {
          width: 49px;
          height: 49px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--theme-radius);
          background: var(--theme-primary);
          color: var(--theme-accent);
          font-weight: 900;
        }

        .brandText {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .brandText strong {
          font-size: 16px;
        }

        .brandText span {
          color: #8b8176;
          font-size: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 21px;
        }

        .nav > a,
        .dropdownButton {
          color: #69645f;
          text-decoration: none;
          font-family: inherit;
          font-size: 10px;
          font-weight: 800;
        }

        .nav > a:hover,
        .dropdownButton:hover {
          color: #a17d55;
        }

        .dropdown {
          position: relative;
          padding: 20px 0;
        }

        .dropdownButton {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .dropdownButton span {
          color: #b08c64;
        }

        .dropdownMenu {
          position: absolute;
          top: 54px;
          left: 50%;
          width: 300px;
          padding: 10px;
          opacity: 0;
          visibility: hidden;
          transform: translate(-50%, 8px);
          border: 1px solid var(--theme-border);
          border-radius: var(--theme-radius);
          background: white;
          box-shadow: 0 25px 65px rgba(38, 34, 30, 0.14);
          transition: 0.2s;
        }

        .dropdown:hover .dropdownMenu {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 0);
        }

        .dropdownMenu > a {
          padding: 13px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 11px;
          color: var(--theme-primary);
          text-decoration: none;
        }

        .dropdownMenu > a:hover {
          background: color-mix(in srgb, var(--theme-background) 88%, var(--theme-accent));
        }

        .menuNumber {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: color-mix(in srgb, var(--theme-accent) 25%, var(--theme-background));
          color: #8a6846;
          font-size: 8px;
          font-weight: 900;
        }

        .dropdownMenu div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .dropdownMenu strong {
          font-size: 11px;
        }

        .dropdownMenu small {
          color: #968a7e;
          font-size: 8px;
        }

        .headerButton {
          padding: 13px 18px;
          display: flex;
          gap: 15px;
          border-radius: 10px;
          background: var(--theme-primary);
          color: white;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
        }

        .headerButton span {
          color: color-mix(in srgb, var(--theme-accent) 82%, white);
        }

        .activeHeaderButton {
          box-shadow: 0 10px 30px rgba(48, 48, 47, 0.14);
        }

        /* PAGE HERO */

        .pageHero {
          padding: 80px 0 90px;
          background: var(--theme-border);
        }

        .breadcrumb {
          margin-bottom: 55px;
          display: flex;
          gap: 10px;
          align-items: center;
          color: #94897f;
          font-size: 9px;
          font-weight: 700;
        }

        .breadcrumb a {
          color: #94897f;
          text-decoration: none;
        }

        .breadcrumb > span {
          color: var(--theme-accent);
        }

        .breadcrumb strong {
          color: #615b55;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 90px;
          align-items: end;
        }

        .eyebrow,
        .sectionEyebrow,
        .sidebarEyebrow {
          display: inline-block;
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2.2px;
        }

        .pageHero h1 {
          margin: 17px 0 0;
          color: var(--theme-primary);
          font-size: clamp(52px, 6vw, 80px);
          line-height: 0.98;
          letter-spacing: -4px;
        }

        .pageHero h1 em {
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
          font-family: Georgia, serif;
          font-weight: 400;
        }

        .heroInfo {
          display: flex;
          gap: 22px;
          align-items: flex-start;
        }

        .heroInfoNumber {
          width: 54px;
          height: 54px;
          min-width: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: var(--theme-primary);
          color: #cbae89;
          font-size: 11px;
          font-weight: 900;
        }

        .heroInfo p {
          margin: 0;
          color: #726b64;
          font-size: 13px;
          line-height: 1.85;
        }

        /* SUCCESS */

        .successSection {
          padding-top: 40px;
          background: color-mix(in srgb, var(--theme-background) 82%, white);
        }

        .successCard {
          padding: 25px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 20px;
          align-items: center;
          border: 1px solid #ddcfbd;
          border-radius: 17px;
          background: #f1e7da;
        }

        .successIcon {
          width: 53px;
          height: 53px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: var(--theme-primary);
          color: #d2b38d;
          font-size: 20px;
          font-weight: 900;
        }

        .successCard span {
          color: #92714e;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .successCard h2 {
          margin: 4px 0;
          font-size: 20px;
        }

        .successCard p {
          margin: 0;
          color: #786f66;
          font-size: 11px;
          line-height: 1.6;
        }

        .successCard button {
          padding: 11px 15px;
          border: 0;
          border-radius: 9px;
          background: var(--theme-primary);
          color: white;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
        }

        /* FORM AREA */

        .appointmentSection {
          padding: 80px 0 110px;
          background: color-mix(in srgb, var(--theme-background) 82%, white);
        }

        .appointmentGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.45fr) minmax(310px, 0.55fr);
          gap: 28px;
          align-items: start;
        }

        .appointmentFormCard {
          padding: 38px;
          border: 1px solid #e6ded4;
          border-radius: var(--theme-radius);
          background: white;
          box-shadow: 0 25px 60px rgba(45, 40, 35, 0.05);
        }

        .formTop {
          margin-bottom: 42px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 25px;
        }

        .formTop h2 {
          margin: 10px 0 0;
          color: var(--theme-primary);
          font-size: 34px;
          letter-spacing: -1.5px;
        }

        .formBadge {
          width: 68px;
          height: 68px;
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--theme-radius);
          background: var(--theme-primary);
        }

        .formBadge span {
          color: #c8a47c;
          font-size: 21px;
          font-weight: 900;
        }

        .formBadge small {
          color: #c9c0b7;
          font-size: 6px;
          letter-spacing: 2px;
        }

        .hpField {
          position: absolute;
          left: -10000px;
          top: auto;
          width: 1px;
          height: 1px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
        }

        .formSectionTitle {
          margin-bottom: 22px;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .formSectionTitle > span {
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: #ede0d0;
          color: #8d6b48;
          font-size: 8px;
          font-weight: 900;
        }

        .formSectionTitle > div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .formSectionTitle strong {
          font-size: 12px;
        }

        .formSectionTitle small {
          color: #9a9188;
          font-size: 8px;
        }

        .formGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 17px;
        }

        .fullField {
          grid-column: 1 / -1;
        }

        .field {
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .field label {
          color: #5f5953;
          font-size: 9px;
          font-weight: 900;
        }

        .field label span {
          color: #b38454;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          border: 1px solid #ded6cc;
          outline: none;
          border-radius: 10px;
          background: #fdfcf9;
          color: var(--theme-primary);
          font-family: inherit;
          font-size: 11px;
          transition: 0.2s;
        }

        .field input,
        .field select {
          height: 50px;
          padding: 0 15px;
        }

        .field textarea {
          padding: 15px;
          resize: vertical;
          line-height: 1.6;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #c4a37e;
          background: white;
          box-shadow: 0 0 0 3px rgba(194, 161, 123, 0.1);
        }

        .field input::placeholder,
        .field textarea::placeholder {
          color: #afa79f;
        }

        .characterCount {
          position: absolute;
          right: 10px;
          bottom: 8px;
          color: #aaa198;
          font-size: 7px;
        }

        .formDivider {
          height: 1px;
          margin: 34px 0;
          background: #eee8e1;
        }

        .errorBox {
          margin-top: 25px;
          padding: 13px 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #e3c5b9;
          border-radius: 9px;
          background: #fbefeb;
          color: #925d4a;
          font-size: 10px;
          font-weight: 700;
        }

        .errorBox span {
          width: 23px;
          height: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #925d4a;
          color: white;
          font-weight: 900;
        }

        .submitButton {
          width: 100%;
          min-height: 67px;
          margin-top: 26px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border: 0;
          border-radius: var(--theme-radius);
          background: var(--theme-primary);
          color: white;
          cursor: pointer;
          text-align: left;
          transition: 0.2s;
        }

        .submitButton:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 16px 35px rgba(48, 48, 47, 0.16);
        }

        .submitButton:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .submitButton > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .submitButton strong {
          font-size: 11px;
        }

        .submitButton small {
          color: #a9a198;
          font-size: 8px;
        }

        .submitButton > span {
          color: #d4b38d;
          font-size: 20px;
        }

        .formNote {
          max-width: 620px;
          margin: 15px auto 0;
          color: #9a9188;
          text-align: center;
          font-size: 8px;
          line-height: 1.6;
        }

        /* SIDEBAR */

        .appointmentSidebar {
          position: sticky;
          top: 112px;
          display: flex;
          flex-direction: column;
          gap: 17px;
        }

        .sidebarCard {
          padding: 28px;
          border: 1px solid #e4dcd2;
          border-radius: var(--theme-radius);
          background: white;
        }

        .darkCard {
          border-color: var(--theme-primary);
          background: var(--theme-primary);
          color: white;
        }

        .darkCard .sidebarEyebrow {
          color: #ceaa82;
        }

        .sidebarCard h3 {
          margin: 12px 0 22px;
          font-size: 25px;
          line-height: 1.08;
          letter-spacing: -1px;
        }

        .processList {
          display: flex;
          flex-direction: column;
        }

        .processItem {
          padding: 17px 0;
          display: flex;
          align-items: flex-start;
          gap: 13px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .processItem > span {
          color: #c7a37c;
          font-size: 8px;
          font-weight: 900;
        }

        .processItem > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .processItem strong {
          font-size: 10px;
        }

        .processItem p {
          margin: 0;
          color: color-mix(in srgb, var(--theme-muted) 72%, white);
          font-size: 8px;
          line-height: 1.6;
        }

        .beigeEyebrow {
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
        }

        .contactIntro {
          color: #827a72;
          font-size: 10px;
          line-height: 1.7;
        }

        .contactList {
          margin-top: 20px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .contactList > a {
          padding: 11px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 10px;
          align-items: center;
          border-radius: 10px;
          background: #f5f0e9;
          color: var(--theme-primary);
          text-decoration: none;
        }

        .contactIcon {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #e4d4c1;
          color: #825f3e;
          font-size: 10px;
          font-weight: 900;
        }

        .contactList > a > div:nth-child(2) {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .contactList small {
          color: #9b8266;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .contactList strong {
          overflow: hidden;
          font-size: 9px;
          text-overflow: ellipsis;
        }

        .contactList > a > span {
          color: #a48360;
        }

        .workingHours {
          padding: 20px 23px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-radius: 15px;
          background: #e8dccd;
        }

        .workingHours span {
          color: #987452;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .workingHours strong {
          color: #4d4843;
          font-size: 10px;
          line-height: 1.5;
        }

        /* FOOTER */

        .footer {
          padding: 55px 0 27px;
          background: var(--theme-text);
          color: white;
        }

        .footerInner {
          padding-bottom: 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 30px;
        }

        .footerBrand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .footerBrand img {
          height: 54px;
          width: auto;
          max-width: 170px;
          object-fit: contain;
          border-radius: 7px;
          background: white;
        }

        .footerMark {
          width: 47px;
          height: 47px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #c4a17a;
          color: #292928;
          font-weight: 900;
        }

        .footerBrand > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footerBrand strong {
          font-size: 14px;
        }

        .footerBrand span {
          color: color-mix(in srgb, var(--theme-muted) 72%, white);
          font-size: 8px;
        }

        .footerLinks {
          display: flex;
          gap: 20px;
        }

        .footerLinks a {
          color: color-mix(in srgb, var(--theme-muted) 72%, white);
          text-decoration: none;
          font-size: 9px;
        }

        .footerLinks a:hover {
          color: #c9aa85;
        }

        .footerBottom {
          padding-top: 24px;
          display: flex;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: #88817a;
          font-size: 8px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .nav {
            display: none;
          }

          .heroGrid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .appointmentGrid {
            grid-template-columns: 1fr;
          }

          .appointmentSidebar {
            position: static;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .workingHours {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 720px) {
          .container {
            width: min(100% - 30px, 1240px);
          }

          .header {
            height: 72px;
          }

          .brandText {
            display: none;
          }

          .brandLogo {
            height: 47px;
          }

          .pageHero {
            padding: 55px 0 65px;
          }

          .breadcrumb {
            margin-bottom: 38px;
          }

          .pageHero h1 {
            font-size: 48px;
            letter-spacing: -2.5px;
          }

          .successCard {
            grid-template-columns: auto 1fr;
          }

          .successCard button {
            grid-column: 1 / -1;
          }

          .appointmentSection {
            padding: 55px 0 75px;
          }

          .appointmentFormCard {
            padding: 25px;
          }

          .formTop h2 {
            font-size: 27px;
          }

          .formGrid {
            grid-template-columns: 1fr;
          }

          .fullField {
            grid-column: auto;
          }

          .appointmentSidebar {
            grid-template-columns: 1fr;
          }

          .workingHours {
            grid-column: auto;
          }

          .footerInner {
            align-items: flex-start;
            flex-direction: column;
          }

          .footerLinks {
            flex-wrap: wrap;
          }

          .footerBottom {
            flex-direction: column;
            gap: 7px;
          }
        }

        @media (max-width: 430px) {
          .pageHero h1 {
            font-size: 41px;
          }

          .headerButton {
            padding: 12px 14px;
          }

          .headerButton span {
            display: none;
          }

          .appointmentFormCard {
            padding: 20px;
            border-radius: var(--theme-radius);
          }

          .formBadge {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}