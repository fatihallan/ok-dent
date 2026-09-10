"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabaseClient";

const emptyHero = {
  subtitle: "",
  title: "",
  description: "",
  button_text: "",
  button_link: "",
  image_url: "",
};

const emptyHome = {
  hero_visible: true,
  hero_secondary_button_text: "",
  hero_secondary_button_link: "",
  hero_card_title: "",
  hero_card_text: "",

  stats_visible: true,
  stat_1_number: "",
  stat_1_text: "",
  stat_2_number: "",
  stat_2_text: "",
  stat_3_number: "",
  stat_3_text: "",
  stat_4_number: "",
  stat_4_text: "",

  services_visible: true,
  services_eyebrow: "",
  services_title: "",
  services_description: "",
  services_button_text: "",
  services_button_link: "",

  clinic_visible: true,
  clinic_button_text: "",
  clinic_button_link: "",

  doctors_visible: true,
  doctors_eyebrow: "",
  doctors_title: "",
  doctors_description: "",
  doctors_button_text: "",
  doctors_button_link: "",

  gallery_visible: true,
  gallery_eyebrow: "",
  gallery_title: "",
  gallery_description: "",

  testimonials_visible: true,
  testimonials_eyebrow: "",
  testimonials_title: "",
  testimonials_description: "",

  appointment_visible: true,
  appointment_eyebrow: "",
  appointment_title: "",
  appointment_description: "",
  appointment_button_text: "",
  appointment_button_link: "",

  contact_visible: true,
  contact_eyebrow: "",
  contact_title: "",
  contact_description: "",

  // HERO MİKRO METİNLER
  hero_fallback_brand_top: "",
  hero_fallback_brand_bottom: "",
  hero_fallback_text: "",
  loading_mark: "OK",
  loading_text: "OK Dent yükleniyor...",
  hero_primary_arrow_text: "→",
  hero_secondary_arrow_text: "↓",
  common_link_arrow_text: "→",
  hero_trust_icon_text: "+",

  // KLİNİK GÖRSEL MİKRO METİNLER
  clinic_image_alt_text: "OK Dent Kliniği",
  clinic_placeholder_top: "OK",
  clinic_placeholder_bottom: "DENT",

  // KLİNİK MİKRO METİNLER
  clinic_image_badge_title: "",
  clinic_image_badge_text: "",

  // DOKTOR KARTLARI
  doctor_default_specialty: "",
  doctor_default_title: "",
  doctor_card_button_text: "",
  doctor_card_button_link: "",

  // GALERİ
  gallery_default_alt_text: "",

  // İLETİŞİM BUTONLARI
  contact_primary_button_text: "",
  contact_primary_button_link: "",
  contact_phone_button_text: "",
  contact_whatsapp_button_text: "",

  // İLETİŞİM ETİKETLERİ
  contact_phone_label: "",
  contact_email_label: "",
  contact_address_label: "",
  contact_hours_label: "",

  is_active: true,
};

export default function HomeManagementPage() {
  const router = useRouter();

  const [hero, setHero] = useState(emptyHero);
  const [home, setHome] = useState(emptyHome);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  const [openSections, setOpenSections] = useState({
    hero: true,
    stats: false,
    services: false,
    clinic: false,
    doctors: false,
    gallery: false,
    testimonials: false,
    appointment: false,
    contact: false,
  });

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const [heroResult, homeResult] = await Promise.all([
      supabase
        .from("site_content")
        .select("*")
        .eq("section", "hero")
        .single(),

      supabase
        .from("homepage_settings")
        .select("*")
        .eq("setting_key", "main")
        .single(),
    ]);

    if (heroResult.error) {
      console.error("Hero yükleme hatası:", heroResult.error);
    }

    if (homeResult.error) {
      console.error("Homepage settings yükleme hatası:", homeResult.error);
    }

    if (heroResult.data) {
      setHero({
        subtitle: heroResult.data.subtitle || "",
        title: heroResult.data.title || "",
        description: heroResult.data.description || "",
        button_text: heroResult.data.button_text || "",
        button_link: heroResult.data.button_link || "",
        image_url: heroResult.data.image_url || "",
      });
    }

    if (homeResult.data) {
      setHome((prev) => ({
        ...prev,
        ...homeResult.data,
      }));
    }

    if (heroResult.error || homeResult.error) {
      setMessage(
        "⚠ Bazı ana sayfa verileri yüklenemedi. Supabase tablolarını kontrol edin."
      );
    }

    setLoading(false);
  }

  function changeHero(e) {
    const { name, value } = e.target;

    setHero((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function changeHome(e) {
    const { name, value } = e.target;

    setHome((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function toggleHome(name) {
    setHome((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  function toggleEditor(name) {
    setOpenSections((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setMessage(
        "❌ Hero fotoğrafı JPG, PNG veya WEBP formatında olmalı."
      );
      e.target.value = "";
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("❌ Fotoğraf en fazla 8 MB olabilir.");
      e.target.value = "";
      return;
    }

    setUploading(true);
    setMessage("");

    const supabase = createClient();

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const filePath = `hero/hero-${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("site-assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error(uploadError);
      setMessage("❌ Hero fotoğrafı yüklenemedi.");
      setUploading(false);
      e.target.value = "";
      return;
    }

    const { data } = supabase.storage
      .from("site-assets")
      .getPublicUrl(filePath);

    if (!data?.publicUrl) {
      setMessage("❌ Fotoğraf bağlantısı oluşturulamadı.");
      setUploading(false);
      e.target.value = "";
      return;
    }

    setHero((prev) => ({
      ...prev,
      image_url: data.publicUrl,
    }));

    setMessage(
      "✓ Fotoğraf yüklendi. Değişiklikleri kaydetmeyi unutmayın."
    );

    setUploading(false);
    e.target.value = "";
  }

  function removeImage() {
    setHero((prev) => ({
      ...prev,
      image_url: "",
    }));

    setMessage(
      "Hero fotoğrafı kaldırıldı. İşlemi tamamlamak için kaydedin."
    );
  }

  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();
    const now = new Date().toISOString();

    const heroUpdate = supabase
      .from("site_content")
      .update({
        subtitle: hero.subtitle,
        title: hero.title,
        description: hero.description,
        button_text: hero.button_text,
        button_link: hero.button_link,
        image_url: hero.image_url || null,
        updated_at: now,
      })
      .eq("section", "hero");

    const homeUpdate = supabase
      .from("homepage_settings")
      .update({
        hero_visible: home.hero_visible,

        hero_secondary_button_text:
          home.hero_secondary_button_text,
        hero_secondary_button_link:
          home.hero_secondary_button_link,
        hero_card_title: home.hero_card_title,
        hero_card_text: home.hero_card_text,

        stats_visible: home.stats_visible,

        stat_1_number: home.stat_1_number,
        stat_1_text: home.stat_1_text,
        stat_2_number: home.stat_2_number,
        stat_2_text: home.stat_2_text,
        stat_3_number: home.stat_3_number,
        stat_3_text: home.stat_3_text,
        stat_4_number: home.stat_4_number,
        stat_4_text: home.stat_4_text,

        services_visible: home.services_visible,
        services_eyebrow: home.services_eyebrow,
        services_title: home.services_title,
        services_description: home.services_description,
        services_button_text: home.services_button_text,
        services_button_link: home.services_button_link,

        clinic_visible: home.clinic_visible,
        clinic_button_text: home.clinic_button_text,
        clinic_button_link: home.clinic_button_link,

        doctors_visible: home.doctors_visible,
        doctors_eyebrow: home.doctors_eyebrow,
        doctors_title: home.doctors_title,
        doctors_description: home.doctors_description,
        doctors_button_text: home.doctors_button_text,
        doctors_button_link: home.doctors_button_link,

        gallery_visible: home.gallery_visible,
        gallery_eyebrow: home.gallery_eyebrow,
        gallery_title: home.gallery_title,
        gallery_description: home.gallery_description,

        testimonials_visible: home.testimonials_visible,
        testimonials_eyebrow: home.testimonials_eyebrow,
        testimonials_title: home.testimonials_title,
        testimonials_description:
          home.testimonials_description,

        appointment_visible: home.appointment_visible,
        appointment_eyebrow: home.appointment_eyebrow,
        appointment_title: home.appointment_title,
        appointment_description:
          home.appointment_description,
        appointment_button_text:
          home.appointment_button_text,
        appointment_button_link:
          home.appointment_button_link,

        contact_visible: home.contact_visible,
        contact_eyebrow: home.contact_eyebrow,
        contact_title: home.contact_title,
        contact_description: home.contact_description,

        hero_fallback_brand_top: home.hero_fallback_brand_top,
        hero_fallback_brand_bottom: home.hero_fallback_brand_bottom,
        hero_fallback_text: home.hero_fallback_text,
        loading_mark: home.loading_mark,
        loading_text: home.loading_text,
        hero_primary_arrow_text: home.hero_primary_arrow_text,
        hero_secondary_arrow_text: home.hero_secondary_arrow_text,
        common_link_arrow_text: home.common_link_arrow_text,

        clinic_image_alt_text: home.clinic_image_alt_text,
        clinic_placeholder_top: home.clinic_placeholder_top,
        clinic_placeholder_bottom: home.clinic_placeholder_bottom,

        clinic_image_badge_title: home.clinic_image_badge_title,
        clinic_image_badge_text: home.clinic_image_badge_text,

        doctor_default_specialty: home.doctor_default_specialty,
        doctor_default_title: home.doctor_default_title,
        doctor_card_button_text: home.doctor_card_button_text,
        doctor_card_button_link: home.doctor_card_button_link,

        gallery_default_alt_text: home.gallery_default_alt_text,

        contact_primary_button_text: home.contact_primary_button_text,
        contact_primary_button_link: home.contact_primary_button_link,
        contact_phone_button_text: home.contact_phone_button_text,
        contact_whatsapp_button_text: home.contact_whatsapp_button_text,

        contact_phone_label: home.contact_phone_label,
        contact_email_label: home.contact_email_label,
        contact_address_label: home.contact_address_label,
        contact_hours_label: home.contact_hours_label,

        is_active: home.is_active,
        updated_at: now,
      })
      .eq("setting_key", "main");

    const [heroResult, homeResult] = await Promise.all([
      heroUpdate,
      homeUpdate,
    ]);

    if (heroResult.error || homeResult.error) {
      console.error(
        "Hero:",
        heroResult.error,
        "Homepage:",
        homeResult.error
      );

      setMessage(
        "❌ Kaydetme sırasında hata oluştu. Konsolu kontrol edin."
      );
    } else {
      setMessage(
        "✓ Ana sayfa ayarlarının tamamı başarıyla kaydedildi."
      );
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loader" />
        <p>Ana sayfa yönetimi yükleniyor...</p>

        <style jsx global>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .loading {
            min-height: 100vh;
            display: grid;
            place-content: center;
            gap: 14px;
            text-align: center;
            background: #f7f5f2;
            color: #6f665d;
            font-family: Arial, sans-serif;
          }

          .loader {
            width: 38px;
            height: 38px;
            margin: auto;
            border: 3px solid #e5ddd4;
            border-top-color: #30302f;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main className="page">
      <div className="top">
        <div>
          <button
            type="button"
            className="backButton"
            onClick={() => router.push("/admin/dashboard")}
          >
            ← Yönetim Paneli
          </button>

          <span className="pageEyebrow">
            OK DENT / ANA SAYFA CMS
          </span>

          <h1>Ana Sayfa Yönetimi</h1>

          <p>
            Ana sayfada ziyaretçinin gördüğü içerikleri tek
            merkezden yönetin.
          </p>
        </div>

        <div className="topActions">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="viewButton"
          >
            Siteyi Görüntüle ↗
          </a>

          <button
            className="mainSave"
            type="button"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving
              ? "Kaydediliyor..."
              : "Tümünü Kaydet"}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`message ${
            message.startsWith("✓")
              ? "success"
              : message.startsWith("❌")
              ? "error"
              : "info"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="workspace">
        {/* HERO */}

        <EditorSection
          title="Hero Alanı"
          description="Ana sayfanın ilk açılış alanı"
          open={openSections.hero}
          onToggle={() => toggleEditor("hero")}
          visible={home.hero_visible}
          onVisible={() => toggleHome("hero_visible")}
        >
          <div className="imageArea">
            <div className="sectionMiniTitle">
              HERO FOTOĞRAFI
            </div>

            {hero.image_url ? (
              <div className="imagePreview">
                <img
                  src={hero.image_url}
                  alt="Hero önizleme"
                />
                <div className="imageShade" />
              </div>
            ) : (
              <div className="imageEmpty">
                <span>＋</span>
                <strong>Hero fotoğrafı yok</strong>
                <small>
                  JPG, PNG veya WEBP · Maksimum 8 MB
                </small>
              </div>
            )}

            <div className="imageButtons">
              <label className="uploadButton">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />

                {uploading
                  ? "Yükleniyor..."
                  : hero.image_url
                  ? "Fotoğrafı Değiştir"
                  : "Fotoğraf Yükle"}
              </label>

              {hero.image_url && (
                <>
                  <a
                    className="lightButton"
                    href={hero.image_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Görseli Aç ↗
                  </a>

                  <button
                    type="button"
                    className="dangerButton"
                    onClick={removeImage}
                  >
                    Kaldır
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="divider" />

          <Field
            label="Üst Başlık"
            name="subtitle"
            value={hero.subtitle}
            onChange={changeHero}
          />

          <Field
            label="Ana Başlık"
            name="title"
            value={hero.title}
            onChange={changeHero}
            textarea
          />

          <Field
            label="Açıklama"
            name="description"
            value={hero.description}
            onChange={changeHero}
            textarea
          />

          <div className="twoColumns">
            <Field
              label="Ana Buton Yazısı"
              name="button_text"
              value={hero.button_text}
              onChange={changeHero}
            />

            <Field
              label="Ana Buton Linki"
              name="button_link"
              value={hero.button_link}
              onChange={changeHero}
            />
          </div>

          <div className="twoColumns">
            <Field
              label="İkinci Buton Yazısı"
              name="hero_secondary_button_text"
              value={home.hero_secondary_button_text}
              onChange={changeHome}
            />

            <Field
              label="İkinci Buton Linki"
              name="hero_secondary_button_link"
              value={home.hero_secondary_button_link}
              onChange={changeHome}
            />
          </div>

          <div className="twoColumns">
            <Field
              label="Fotoğraf Kartı Başlığı"
              name="hero_card_title"
              value={home.hero_card_title}
              onChange={changeHome}
            />

            <Field
              label="Fotoğraf Kartı Açıklaması"
              name="hero_card_text"
              value={home.hero_card_text}
              onChange={changeHome}
            />
          </div>
        </EditorSection>

        {/* İSTATİSTİKLER */}

        <EditorSection
          title="İstatistikler"
          description="Hero altındaki sayısal bilgiler"
          open={openSections.stats}
          onToggle={() => toggleEditor("stats")}
          visible={home.stats_visible}
          onVisible={() => toggleHome("stats_visible")}
        >
          <div className="statsEditor">
            {[1, 2, 3, 4].map((number) => (
              <div className="statBox" key={number}>
                <span>İSTATİSTİK {number}</span>

                <Field
                  label="Sayı / Değer"
                  name={`stat_${number}_number`}
                  value={home[`stat_${number}_number`]}
                  onChange={changeHome}
                />

                <Field
                  label="Açıklama"
                  name={`stat_${number}_text`}
                  value={home[`stat_${number}_text`]}
                  onChange={changeHome}
                />
              </div>
            ))}
          </div>
        </EditorSection>

        {/* HİZMETLER */}

        <EditorSection
          title="Hizmetler Bölümü"
          description="Hizmet kartlarının üstündeki bölüm metinleri"
          open={openSections.services}
          onToggle={() => toggleEditor("services")}
          visible={home.services_visible}
          onVisible={() => toggleHome("services_visible")}
        >
          <Field
            label="Küçük Üst Başlık"
            name="services_eyebrow"
            value={home.services_eyebrow}
            onChange={changeHome}
          />

          <Field
            label="Başlık"
            name="services_title"
            value={home.services_title}
            onChange={changeHome}
          />

          <Field
            label="Açıklama"
            name="services_description"
            value={home.services_description}
            onChange={changeHome}
            textarea
          />

          <div className="twoColumns">
            <Field
              label="Buton Yazısı"
              name="services_button_text"
              value={home.services_button_text}
              onChange={changeHome}
            />

            <Field
              label="Buton Linki"
              name="services_button_link"
              value={home.services_button_link}
              onChange={changeHome}
            />
          </div>
        </EditorSection>

        {/* KLİNİK */}

        <EditorSection
          title="Klinik Bölümü"
          description="Klinik içeriğinin ana sayfadaki buton ayarları"
          open={openSections.clinic}
          onToggle={() => toggleEditor("clinic")}
          visible={home.clinic_visible}
          onVisible={() => toggleHome("clinic_visible")}
        >
          <div className="notice">
            Klinik başlığı, açıklaması, özellikleri ve fotoğrafı
            mevcut <strong>Klinik Yönetimi</strong> sayfasından
            düzenlenmeye devam eder. Burada ana sayfaya özel butonu
            yönetiyoruz.
          </div>

          <div className="twoColumns">
            <Field
              label="Buton Yazısı"
              name="clinic_button_text"
              value={home.clinic_button_text}
              onChange={changeHome}
            />

            <Field
              label="Buton Linki"
              name="clinic_button_link"
              value={home.clinic_button_link}
              onChange={changeHome}
            />
          </div>
        </EditorSection>

        {/* DOKTORLAR */}

        <EditorSection
          title="Doktorlar Bölümü"
          description="Doktor kartlarının üstündeki ana sayfa metinleri"
          open={openSections.doctors}
          onToggle={() => toggleEditor("doctors")}
          visible={home.doctors_visible}
          onVisible={() => toggleHome("doctors_visible")}
        >
          <Field
            label="Küçük Üst Başlık"
            name="doctors_eyebrow"
            value={home.doctors_eyebrow}
            onChange={changeHome}
          />

          <Field
            label="Başlık"
            name="doctors_title"
            value={home.doctors_title}
            onChange={changeHome}
          />

          <Field
            label="Açıklama"
            name="doctors_description"
            value={home.doctors_description}
            onChange={changeHome}
            textarea
          />

          <div className="twoColumns">
            <Field
              label="Buton Yazısı"
              name="doctors_button_text"
              value={home.doctors_button_text}
              onChange={changeHome}
            />

            <Field
              label="Buton Linki"
              name="doctors_button_link"
              value={home.doctors_button_link}
              onChange={changeHome}
            />
          </div>
        </EditorSection>

        {/* GALERİ */}

        <EditorSection
          title="Galeri Bölümü"
          description="Galeri alanının başlık ve açıklamaları"
          open={openSections.gallery}
          onToggle={() => toggleEditor("gallery")}
          visible={home.gallery_visible}
          onVisible={() => toggleHome("gallery_visible")}
        >
          <Field
            label="Küçük Üst Başlık"
            name="gallery_eyebrow"
            value={home.gallery_eyebrow}
            onChange={changeHome}
          />

          <Field
            label="Başlık"
            name="gallery_title"
            value={home.gallery_title}
            onChange={changeHome}
          />

          <Field
            label="Açıklama"
            name="gallery_description"
            value={home.gallery_description}
            onChange={changeHome}
            textarea
          />
        </EditorSection>

        {/* YORUMLAR */}

        <EditorSection
          title="Hasta Yorumları Bölümü"
          description="Yorum kartlarının bölüm başlığı"
          open={openSections.testimonials}
          onToggle={() => toggleEditor("testimonials")}
          visible={home.testimonials_visible}
          onVisible={() =>
            toggleHome("testimonials_visible")
          }
        >
          <Field
            label="Küçük Üst Başlık"
            name="testimonials_eyebrow"
            value={home.testimonials_eyebrow}
            onChange={changeHome}
          />

          <Field
            label="Başlık"
            name="testimonials_title"
            value={home.testimonials_title}
            onChange={changeHome}
          />

          <Field
            label="Açıklama"
            name="testimonials_description"
            value={home.testimonials_description}
            onChange={changeHome}
            textarea
          />
        </EditorSection>

        {/* RANDEVU */}

        <EditorSection
          title="Randevu CTA"
          description="Ana sayfanın randevu çağrı alanı"
          open={openSections.appointment}
          onToggle={() => toggleEditor("appointment")}
          visible={home.appointment_visible}
          onVisible={() =>
            toggleHome("appointment_visible")
          }
        >
          <Field
            label="Küçük Üst Başlık"
            name="appointment_eyebrow"
            value={home.appointment_eyebrow}
            onChange={changeHome}
          />

          <Field
            label="Başlık"
            name="appointment_title"
            value={home.appointment_title}
            onChange={changeHome}
          />

          <Field
            label="Açıklama"
            name="appointment_description"
            value={home.appointment_description}
            onChange={changeHome}
            textarea
          />

          <div className="twoColumns">
            <Field
              label="Buton Yazısı"
              name="appointment_button_text"
              value={home.appointment_button_text}
              onChange={changeHome}
            />

            <Field
              label="Buton Linki"
              name="appointment_button_link"
              value={home.appointment_button_link}
              onChange={changeHome}
            />
          </div>
        </EditorSection>

        {/* İLETİŞİM */}

        <EditorSection
          title="İletişim Bölümü"
          description="Ana sayfadaki iletişim bölümünün başlıkları"
          open={openSections.contact}
          onToggle={() => toggleEditor("contact")}
          visible={home.contact_visible}
          onVisible={() => toggleHome("contact_visible")}
        >
          <Field
            label="Küçük Üst Başlık"
            name="contact_eyebrow"
            value={home.contact_eyebrow}
            onChange={changeHome}
          />

          <Field
            label="Başlık"
            name="contact_title"
            value={home.contact_title}
            onChange={changeHome}
          />

          <Field
            label="Açıklama"
            name="contact_description"
            value={home.contact_description}
            onChange={changeHome}
            textarea
          />

          <div className="divider" />
          <div className="sectionMiniTitle">HERO YEDEK GÖRSEL METİNLERİ</div>
          <div style={{ height: "15px" }} />

          <div className="twoColumns">
            <Field label="Hero Yedek Marka Üst" name="hero_fallback_brand_top" value={home.hero_fallback_brand_top} onChange={changeHome} />
            <Field label="Hero Yedek Marka Alt" name="hero_fallback_brand_bottom" value={home.hero_fallback_brand_bottom} onChange={changeHome} />
          </div>

          <Field label="Hero Fotoğraf Yoksa Açıklama" name="hero_fallback_text" value={home.hero_fallback_text} onChange={changeHome} textarea />

          <div className="grid2">
            <Field label="Yükleme İşareti" name="loading_mark" value={home.loading_mark} onChange={changeHome} />
            <Field label="Yükleme Yazısı" name="loading_text" value={home.loading_text} onChange={changeHome} />
          </div>

          <div className="grid3">
            <Field label="Ana Hero Buton İşareti" name="hero_primary_arrow_text" value={home.hero_primary_arrow_text} onChange={changeHome} />
            <Field label="İkinci Hero Buton İşareti" name="hero_secondary_arrow_text" value={home.hero_secondary_arrow_text} onChange={changeHome} />
            <Field label="Genel Link Ok İşareti" name="common_link_arrow_text" value={home.common_link_arrow_text} onChange={changeHome} />
            <Field label="Hero Güven İşareti" name="hero_trust_icon_text" value={home.hero_trust_icon_text} onChange={changeHome} />
          </div>

          <div className="grid3">
            <Field label="Klinik Görsel Alt Metni" name="clinic_image_alt_text" value={home.clinic_image_alt_text} onChange={changeHome} />
            <Field label="Klinik Placeholder Üst" name="clinic_placeholder_top" value={home.clinic_placeholder_top} onChange={changeHome} />
            <Field label="Klinik Placeholder Alt" name="clinic_placeholder_bottom" value={home.clinic_placeholder_bottom} onChange={changeHome} />
          </div>

          <div className="divider" />
          <div className="sectionMiniTitle">KLİNİK GÖRSEL ROZETİ</div>
          <div style={{ height: "15px" }} />

          <div className="twoColumns">
            <Field label="Klinik Rozet Başlığı" name="clinic_image_badge_title" value={home.clinic_image_badge_title} onChange={changeHome} />
            <Field label="Klinik Rozet Alt Yazısı" name="clinic_image_badge_text" value={home.clinic_image_badge_text} onChange={changeHome} />
          </div>

          <div className="divider" />
          <div className="sectionMiniTitle">DOKTOR KARTLARI</div>
          <div style={{ height: "15px" }} />

          <div className="twoColumns">
            <Field label="Varsayılan Uzmanlık" name="doctor_default_specialty" value={home.doctor_default_specialty} onChange={changeHome} />
            <Field label="Varsayılan Unvan" name="doctor_default_title" value={home.doctor_default_title} onChange={changeHome} />
          </div>

          <div className="twoColumns">
            <Field label="Doktor Kartı Buton Yazısı" name="doctor_card_button_text" value={home.doctor_card_button_text} onChange={changeHome} />
            <Field label="Doktor Kartı Buton Linki" name="doctor_card_button_link" value={home.doctor_card_button_link} onChange={changeHome} />
          </div>

          <div className="divider" />
          <div className="sectionMiniTitle">GALERİ MİKRO AYARLARI</div>
          <div style={{ height: "15px" }} />

          <Field label="Galeri Varsayılan Görsel Açıklaması (ALT)" name="gallery_default_alt_text" value={home.gallery_default_alt_text} onChange={changeHome} />

          <div className="divider" />
          <div className="sectionMiniTitle">İLETİŞİM BUTONLARI</div>
          <div style={{ height: "15px" }} />

          <div className="twoColumns">
            <Field label="Ana Buton Yazısı" name="contact_primary_button_text" value={home.contact_primary_button_text} onChange={changeHome} />
            <Field label="Ana Buton Linki" name="contact_primary_button_link" value={home.contact_primary_button_link} onChange={changeHome} />
          </div>

          <div className="twoColumns">
            <Field label="Telefon Butonu Yazısı" name="contact_phone_button_text" value={home.contact_phone_button_text} onChange={changeHome} />
            <Field label="WhatsApp Butonu Yazısı" name="contact_whatsapp_button_text" value={home.contact_whatsapp_button_text} onChange={changeHome} />
          </div>

          <div className="divider" />
          <div className="sectionMiniTitle">İLETİŞİM BİLGİ ETİKETLERİ</div>
          <div style={{ height: "15px" }} />

          <div className="twoColumns">
            <Field label="Telefon Etiketi" name="contact_phone_label" value={home.contact_phone_label} onChange={changeHome} />
            <Field label="E-posta Etiketi" name="contact_email_label" value={home.contact_email_label} onChange={changeHome} />
          </div>

          <div className="twoColumns">
            <Field label="Adres Etiketi" name="contact_address_label" value={home.contact_address_label} onChange={changeHome} />
            <Field label="Çalışma Saatleri Etiketi" name="contact_hours_label" value={home.contact_hours_label} onChange={changeHome} />
          </div>
        </EditorSection>

        <div className="bottomSave">
          <div>
            <strong>Ana sayfa ayarları</strong>
            <span>
              Değişiklikler ancak kaydettiğinizde yayınlanır.
            </span>
          </div>

          <button
            type="submit"
            disabled={saving || uploading}
          >
            {saving
              ? "Kaydediliyor..."
              : uploading
              ? "Fotoğraf Yükleniyor..."
              : "Tüm Değişiklikleri Kaydet"}
          </button>
        </div>
      </form>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f7f5f2;
        }

        button,
        input,
        textarea {
          font-family: inherit;
        }

        .page {
          min-height: 100vh;
          padding: 42px 5%;
          background: #f7f5f2;
          color: #30302f;
          font-family: Inter, Arial, sans-serif;
        }

        .top {
          max-width: 1250px;
          margin: 0 auto 28px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
        }

        .backButton {
          margin: 0 0 25px;
          padding: 0;
          border: 0;
          background: transparent;
          color: #9a7854;
          font-size: 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .pageEyebrow,
        .sectionMiniTitle {
          color: #9a7854;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .top h1 {
          margin: 8px 0;
          font-size: 38px;
          letter-spacing: -1.5px;
        }

        .top p {
          margin: 0;
          color: #817970;
          font-size: 13px;
        }

        .topActions {
          display: flex;
          gap: 10px;
        }

        .viewButton,
        .mainSave {
          padding: 12px 17px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
        }

        .viewButton {
          border: 1px solid #ded5ca;
          background: white;
          color: #30302f;
        }

        .mainSave {
          border: 1px solid #30302f;
          background: #30302f;
          color: white;
        }

        .mainSave:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        .workspace {
          max-width: 1250px;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .message {
          max-width: 1250px;
          margin: 0 auto 18px;
          padding: 13px 16px;
          border-radius: 11px;
          font-size: 12px;
          line-height: 1.5;
        }

        .success {
          background: #eee5d9;
          color: #725637;
        }

        .error {
          background: #fff0f0;
          color: #a84444;
        }

        .info {
          background: #eeeae5;
          color: #75695e;
        }

        .editorSection {
          overflow: hidden;
          border: 1px solid #e4dbd1;
          border-radius: 17px;
          background: white;
          box-shadow: 0 12px 35px rgba(45, 40, 35, 0.035);
        }

        .editorSectionHeader {
          width: 100%;
          padding: 19px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .editorSectionHeaderLeft {
          flex: 1;
          cursor: pointer;
        }

        .editorSectionHeaderLeft strong {
          display: block;
          font-size: 15px;
        }

        .editorSectionHeaderLeft span {
          display: block;
          margin-top: 4px;
          color: #968c82;
          font-size: 10px;
        }

        .headerControls {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .visibilityButton {
          min-width: 83px;
          padding: 7px 10px;
          border: 0;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .visibilityButton.on {
          background: #eee3d5;
          color: #795b3b;
        }

        .visibilityButton.off {
          background: #eee;
          color: #7c7c7c;
        }

        .expandButton {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border: 1px solid #e1d8cd;
          border-radius: 9px;
          background: #faf8f5;
          color: #5c534b;
          cursor: pointer;
        }

        .editorSectionBody {
          padding: 25px 22px 5px;
          border-top: 1px solid #eee8e1;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          margin-bottom: 7px;
          font-size: 11px;
          font-weight: 850;
        }

        .field input,
        .field textarea {
          width: 100%;
          padding: 12px 13px;
          border: 1px solid #dfd6cc;
          border-radius: 10px;
          outline: none;
          resize: vertical;
          background: #fcfbf9;
          color: #30302f;
          font-size: 12px;
          transition: 0.2s;
        }

        .field input:focus,
        .field textarea:focus {
          border-color: #b79772;
          background: white;
          box-shadow: 0 0 0 3px rgba(183, 151, 114, 0.09);
        }

        .twoColumns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .statsEditor {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .statBox {
          padding: 16px;
          border: 1px solid #e7dfd5;
          border-radius: 13px;
          background: #faf8f5;
        }

        .statBox > span {
          display: block;
          margin-bottom: 15px;
          color: #a27f59;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .imageArea {
          margin-bottom: 25px;
        }

        .imagePreview {
          position: relative;
          height: 350px;
          margin-top: 12px;
          overflow: hidden;
          border-radius: 16px;
          background: #ddd4c8;
        }

        .imagePreview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .imageShade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(35, 33, 30, 0.25),
            transparent 50%
          );
        }

        .imageEmpty {
          min-height: 190px;
          margin-top: 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 7px;
          border: 1px dashed #d9ccbd;
          border-radius: 15px;
          background: #faf7f3;
          color: #76695d;
        }

        .imageEmpty > span {
          font-size: 25px;
          color: #a88460;
        }

        .imageEmpty strong {
          font-size: 12px;
        }

        .imageEmpty small {
          color: #998d81;
          font-size: 9px;
        }

        .imageButtons {
          margin-top: 11px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .uploadButton input {
          display: none;
        }

        .uploadButton,
        .lightButton,
        .dangerButton {
          padding: 9px 12px;
          border-radius: 9px;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
          text-decoration: none;
        }

        .uploadButton {
          border: 0;
          background: #30302f;
          color: white;
        }

        .lightButton {
          border: 1px solid #ddd2c5;
          background: white;
          color: #755d44;
        }

        .dangerButton {
          border: 0;
          background: #f4e3e0;
          color: #964c45;
        }

        .divider {
          height: 1px;
          margin: 0 0 25px;
          background: #eee8e1;
        }

        .notice {
          margin-bottom: 20px;
          padding: 14px 15px;
          border-left: 3px solid #c2a17b;
          border-radius: 8px;
          background: #f8f4ef;
          color: #756a60;
          font-size: 10px;
          line-height: 1.7;
        }

        .bottomSave {
          margin-top: 8px;
          padding: 20px 22px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-radius: 16px;
          background: #30302f;
          color: white;
        }

        .bottomSave strong {
          display: block;
          font-size: 13px;
        }

        .bottomSave span {
          display: block;
          margin-top: 4px;
          color: #bdb7af;
          font-size: 9px;
        }

        .bottomSave button {
          padding: 12px 17px;
          border: 0;
          border-radius: 9px;
          background: #c2a17b;
          color: #252422;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .bottomSave button:disabled {
          opacity: 0.55;
          cursor: wait;
        }

        @media (max-width: 900px) {
          .statsEditor {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 25px 15px;
          }

          .top {
            align-items: flex-start;
            flex-direction: column;
          }

          .topActions {
            width: 100%;
          }

          .viewButton,
          .mainSave {
            flex: 1;
            text-align: center;
          }

          .twoColumns,
          .statsEditor {
            grid-template-columns: 1fr;
          }

          .editorSectionHeader {
            padding: 16px;
          }

          .editorSectionBody {
            padding: 20px 16px 3px;
          }

          .editorSectionHeaderLeft span {
            display: none;
          }

          .bottomSave {
            align-items: stretch;
            flex-direction: column;
          }

          .bottomSave button {
            width: 100%;
          }

          .imagePreview {
            height: 260px;
          }
        }
      `}</style>
    </main>
  );
}

function EditorSection({
  title,
  description,
  open,
  onToggle,
  visible,
  onVisible,
  children,
}) {
  return (
    <section className="editorSection">
      <div className="editorSectionHeader">
        <div
          className="editorSectionHeaderLeft"
          onClick={onToggle}
        >
          <strong>{title}</strong>
          <span>{description}</span>
        </div>

        <div className="headerControls">
          <button
            type="button"
            className={`visibilityButton ${
              visible ? "on" : "off"
            }`}
            onClick={onVisible}
          >
            {visible ? "● YAYINDA" : "○ GİZLİ"}
          </button>

          <button
            type="button"
            className="expandButton"
            onClick={onToggle}
            aria-label={open ? "Bölümü kapat" : "Bölümü aç"}
          >
            {open ? "−" : "+"}
          </button>
        </div>
      </div>

      {open && (
        <div className="editorSectionBody">
          {children}
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  textarea = false,
}) {
  return (
    <div className="field">
      <label htmlFor={name}>{label}</label>

      {textarea ? (
        <textarea
          id={name}
          name={name}
          value={value || ""}
          onChange={onChange}
          rows={4}
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value || ""}
          onChange={onChange}
        />
      )}
    </div>
  );
}