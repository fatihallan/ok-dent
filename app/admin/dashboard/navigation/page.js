"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabaseClient";

const defaultForm = {
  show_logo: true,

  home_text: "Ana Sayfa",
  home_link: "/",
  home_visible: true,
  home_sort: 1,

  services_text: "Hizmetler",
  services_link: "/#hizmetler",
  services_visible: true,
  services_sort: 2,

  doctors_text: "Doktorlarımız",
  doctors_link: "/doktorlar",
  doctors_visible: true,
  doctors_sort: 3,

  corporate_text: "Kurumsal",
  corporate_visible: true,
  corporate_sort: 4,

  about_text: "Hakkımızda",
  about_description: "OK Dent'i yakından tanıyın",
  about_link: "/kurumsal/hakkimizda",
  about_visible: true,
  about_sort: 1,

  vision_mission_text: "Vizyon & Misyon",
  vision_mission_description: "Değerlerimiz ve hedeflerimiz",
  vision_mission_link: "/kurumsal/vizyon-misyon",
  vision_mission_visible: true,
  vision_mission_sort: 2,

  contact_text: "İletişim",
  contact_link: "/#iletisim",
  contact_visible: true,
  contact_sort: 5,

  appointment_text: "Randevu Al",
  appointment_link: "/randevu",
  appointment_arrow_text: "→",
  appointment_visible: true,

  header_sticky: true,
  is_active: true,
};

export default function NavigationAdminPage() {
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadNavigation();
  }, []);

  async function loadNavigation() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("navigation_settings")
      .select("*")
      .eq("setting_key", "main")
      .single();

    if (error) {
      console.error(error);
      setMessage("Menü ayarları yüklenemedi.");
    } else if (data) {
      setForm({
        show_logo: data.show_logo ?? true,

        home_text: data.home_text || "",
        home_link: data.home_link || "/",
        home_visible: data.home_visible ?? true,
        home_sort: data.home_sort ?? 1,

        services_text: data.services_text || "",
        services_link: data.services_link || "/#hizmetler",
        services_visible: data.services_visible ?? true,
        services_sort: data.services_sort ?? 2,

        doctors_text: data.doctors_text || "",
        doctors_link: data.doctors_link || "/doktorlar",
        doctors_visible: data.doctors_visible ?? true,
        doctors_sort: data.doctors_sort ?? 3,

        corporate_text: data.corporate_text || "",
        corporate_visible: data.corporate_visible ?? true,
        corporate_sort: data.corporate_sort ?? 4,

        about_text: data.about_text || "",
        about_description: data.about_description || "",
        about_link: data.about_link || "/kurumsal/hakkimizda",
        about_visible: data.about_visible ?? true,
        about_sort: data.about_sort ?? 1,

        vision_mission_text: data.vision_mission_text || "",
        vision_mission_description:
          data.vision_mission_description || "",
        vision_mission_link:
          data.vision_mission_link || "/kurumsal/vizyon-misyon",
        vision_mission_visible:
          data.vision_mission_visible ?? true,
        vision_mission_sort:
          data.vision_mission_sort ?? 2,

        contact_text: data.contact_text || "",
        contact_link: data.contact_link || "/#iletisim",
        contact_visible: data.contact_visible ?? true,
        contact_sort: data.contact_sort ?? 5,

        appointment_text: data.appointment_text || "",
        appointment_link: data.appointment_link || "/randevu",
        appointment_arrow_text: data.appointment_arrow_text ?? "→",
        appointment_visible:
          data.appointment_visible ?? true,

        header_sticky: data.header_sticky ?? true,
        is_active: data.is_active ?? true,
      });
    }

    setLoading(false);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
          ? Number(value)
          : value,
    }));
  }

  async function handleSave(e) {
    if (e) e.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("navigation_settings")
      .update({
        show_logo: form.show_logo,

        home_text: form.home_text.trim(),
        home_link: form.home_link.trim() || "/",
        home_visible: form.home_visible,
        home_sort: Number(form.home_sort) || 1,

        services_text: form.services_text.trim(),
        services_link:
          form.services_link.trim() || "/#hizmetler",
        services_visible: form.services_visible,
        services_sort: Number(form.services_sort) || 2,

        doctors_text: form.doctors_text.trim(),
        doctors_link:
          form.doctors_link.trim() || "/doktorlar",
        doctors_visible: form.doctors_visible,
        doctors_sort: Number(form.doctors_sort) || 3,

        corporate_text: form.corporate_text.trim(),
        corporate_visible: form.corporate_visible,
        corporate_sort: Number(form.corporate_sort) || 4,

        about_text: form.about_text.trim(),
        about_description: form.about_description.trim(),
        about_link:
          form.about_link.trim() || "/kurumsal/hakkimizda",
        about_visible: form.about_visible,
        about_sort: Number(form.about_sort) || 1,

        vision_mission_text:
          form.vision_mission_text.trim(),
        vision_mission_description:
          form.vision_mission_description.trim(),
        vision_mission_link:
          form.vision_mission_link.trim() ||
          "/kurumsal/vizyon-misyon",
        vision_mission_visible:
          form.vision_mission_visible,
        vision_mission_sort:
          Number(form.vision_mission_sort) || 2,

        contact_text: form.contact_text.trim(),
        contact_link:
          form.contact_link.trim() || "/#iletisim",
        contact_visible: form.contact_visible,
        contact_sort: Number(form.contact_sort) || 5,

        appointment_text:
          form.appointment_text.trim(),
        appointment_link:
          form.appointment_link.trim() || "/randevu",
        appointment_arrow_text: form.appointment_arrow_text,
        appointment_visible:
          form.appointment_visible,

        header_sticky: form.header_sticky,
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", "main");

    if (error) {
      console.error(error);
      setMessage("Kaydetme sırasında hata oluştu.");
    } else {
      setMessage("Menü ve Header ayarları başarıyla kaydedildi.");
    }

    setSaving(false);
  }

  const mainMenuPreview = [
    {
      key: "home",
      text: form.home_text,
      visible: form.home_visible,
      sort: form.home_sort,
    },
    {
      key: "services",
      text: form.services_text,
      visible: form.services_visible,
      sort: form.services_sort,
    },
    {
      key: "doctors",
      text: form.doctors_text,
      visible: form.doctors_visible,
      sort: form.doctors_sort,
    },
    {
      key: "corporate",
      text: form.corporate_text,
      visible: form.corporate_visible,
      sort: form.corporate_sort,
    },
    {
      key: "contact",
      text: form.contact_text,
      visible: form.contact_visible,
      sort: form.contact_sort,
    },
  ]
    .filter((item) => item.visible)
    .sort((a, b) => Number(a.sort) - Number(b.sort));

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loader"></div>
        <p>Menü ayarları yükleniyor...</p>

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: grid;
            place-items: center;
            align-content: center;
            gap: 14px;
            background: #f8f6f2;
            color: #30302f;
            font-family: Arial, sans-serif;
          }

          .loader {
            width: 36px;
            height: 36px;
            border: 3px solid #e8ded2;
            border-top-color: #c2a17b;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="top">
        <div>
          <a href="/admin/dashboard" className="back">
            ← Yönetim Paneli
          </a>

          <span className="eyebrow">
            OK DENT / GENEL AYARLAR
          </span>

          <h1>Menü & Header</h1>

          <p className="intro">
            Sitenin üst menüsündeki yazıları, bağlantıları,
            sıralamayı ve görünürlük ayarlarını yönetin.
          </p>
        </div>

        <div className="topActions">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="previewButton"
          >
            Siteyi Gör ↗
          </a>

          <button
            type="button"
            className="saveTop"
            onClick={handleSave}
            disabled={saving}
          >
            {saving
              ? "Kaydediliyor..."
              : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="layout">
          <div className="content">
            <Section
              number="01"
              title="Header Genel Ayarları"
              text="Sitenin üst bölümünün genel davranışını yönetin."
            >
              <Toggle
                title="Logo"
                description="Header içerisinde site logosunu göster."
                name="show_logo"
                checked={form.show_logo}
                onChange={handleChange}
              />

              <Toggle
                title="Sabit Header"
                description="Sayfa aşağı kaydırıldığında üst menü ekranda kalsın."
                name="header_sticky"
                checked={form.header_sticky}
                onChange={handleChange}
              />

              <Toggle
                title="Header Sistemi Aktif"
                description="Yönetilebilir menü sistemini aktif tut."
                name="is_active"
                checked={form.is_active}
                onChange={handleChange}
              />
            </Section>

            <Section
              number="02"
              title="Ana Menü"
              text="Header üzerinde doğrudan görünen ana bağlantıları düzenleyin."
            >
              <MenuItem
                title="Ana Sayfa"
                prefix="home"
                form={form}
                onChange={handleChange}
              />

              <MenuItem
                title="Hizmetler"
                prefix="services"
                form={form}
                onChange={handleChange}
              />

              <MenuItem
                title="Doktorlarımız"
                prefix="doctors"
                form={form}
                onChange={handleChange}
              />

              <MenuItem
                title="İletişim"
                prefix="contact"
                form={form}
                onChange={handleChange}
              />
            </Section>

            <Section
              number="03"
              title="Kurumsal Menüsü"
              text="Kurumsal açılır menüsünün ana başlığını ve sırasını düzenleyin."
            >
              <div className="threeColumns">
                <Field label="Menü Yazısı">
                  <input
                    name="corporate_text"
                    value={form.corporate_text}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Menü Sırası">
                  <input
                    type="number"
                    min="1"
                    name="corporate_sort"
                    value={form.corporate_sort}
                    onChange={handleChange}
                  />
                </Field>

                <div className="visibleBox">
                  <span>Görünürlük</span>

                  <label>
                    <input
                      type="checkbox"
                      name="corporate_visible"
                      checked={form.corporate_visible}
                      onChange={handleChange}
                    />

                    <strong>
                      {form.corporate_visible
                        ? "Göster"
                        : "Gizli"}
                    </strong>
                  </label>
                </div>
              </div>
            </Section>

            <Section
              number="04"
              title="Kurumsal Alt Menü"
              text="Kurumsal menüsünün altında açılan sayfaları ve açıklamalarını yönetin."
            >
              <SubMenuItem
                number="01"
                title="Hakkımızda"
                prefix="about"
                form={form}
                onChange={handleChange}
              />

              <SubMenuItem
                number="02"
                title="Vizyon & Misyon"
                prefix="vision_mission"
                form={form}
                onChange={handleChange}
              />
            </Section>

            <Section
              number="05"
              title="Randevu Butonu"
              text="Header'ın sağ tarafındaki ana aksiyon butonunu yönetin."
            >
              <div className="twoColumns">
                <Field label="Buton Yazısı">
                  <input
                    name="appointment_text"
                    value={form.appointment_text}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Buton Bağlantısı">
                  <input
                    name="appointment_link"
                    value={form.appointment_link}
                    onChange={handleChange}
                  />
                </Field>
              </div>

              <Field label="Mobil Buton Ok / İşaret">
                <input
                  name="appointment_arrow_text"
                  value={form.appointment_arrow_text}
                  onChange={handleChange}
                  placeholder="→"
                />
              </Field>

              <Toggle
                title="Randevu Butonunu Göster"
                description="Header'ın sağ tarafındaki randevu butonunun görünürlüğü."
                name="appointment_visible"
                checked={form.appointment_visible}
                onChange={handleChange}
              />
            </Section>
          </div>

          <aside>
            <div className="sidePanel">
              <span className="eyebrow">
                CANLI ÖNİZLEME
              </span>

              <h2>Header Görünümü</h2>

              <div className="headerPreview">
                <div className="previewHeaderTop">
                  {form.show_logo ? (
                    <div className="fakeLogo">
                      <strong>OK DENT</strong>
                      <small>AĞIZ VE DİŞ SAĞLIĞI</small>
                    </div>
                  ) : (
                    <span className="logoHidden">
                      Logo gizli
                    </span>
                  )}

                  {form.appointment_visible && (
                    <span className="fakeAppointment">
                      {form.appointment_text ||
                        "Randevu Al"}
                    </span>
                  )}
                </div>

                <div className="previewNav">
                  {mainMenuPreview.map((item) => (
                    <span
                      key={item.key}
                      className={
                        item.key === "corporate"
                          ? "corporatePreview"
                          : ""
                      }
                    >
                      {item.text || "Menü"}

                      {item.key === "corporate" && " ⌄"}
                    </span>
                  ))}
                </div>

                {form.corporate_visible && (
                  <div className="dropdownPreview">
                    <small>
                      KURUMSAL ALT MENÜ
                    </small>

                    {form.about_visible && (
                      <div>
                        <strong>
                          {form.about_text ||
                            "Hakkımızda"}
                        </strong>

                        <span>
                          {form.about_description ||
                            "Alt menü açıklaması"}
                        </span>
                      </div>
                    )}

                    {form.vision_mission_visible && (
                      <div>
                        <strong>
                          {form.vision_mission_text ||
                            "Vizyon & Misyon"}
                        </strong>

                        <span>
                          {form.vision_mission_description ||
                            "Alt menü açıklaması"}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="infoBox">
                <strong>Şimdilik güvenli aşamadayız.</strong>

                <p>
                  Bu ekran verileri Supabase'e kaydeder.
                  Ziyaretçi sayfalarının mevcut header kodlarına
                  henüz dokunmuyoruz.
                </p>
              </div>

              <button
                type="submit"
                className="saveSide"
                disabled={saving}
              >
                {saving
                  ? "Kaydediliyor..."
                  : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </aside>
        </div>
      </form>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(body) {
          margin: 0;
          background: #f8f6f2;
        }

        .page {
          min-height: 100vh;
          padding: 45px 5%;
          background: #f8f6f2;
          color: #30302f;
          font-family: Inter, Arial, Helvetica, sans-serif;
        }

        .top,
        .layout,
        .message {
          max-width: 1450px;
          margin-left: auto;
          margin-right: auto;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
          margin-bottom: 30px;
        }

        .back {
          display: block;
          width: fit-content;
          margin-bottom: 25px;
          color: #8a6846;
          text-decoration: none;
          font-size: 12px;
          font-weight: 800;
        }

        .eyebrow {
          display: block;
          color: #9b7955;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.8px;
        }

        h1 {
          margin: 8px 0;
          font-size: 38px;
          letter-spacing: -1.5px;
        }

        .intro {
          margin: 0;
          color: #837b73;
          font-size: 13px;
        }

        .topActions {
          display: flex;
          gap: 10px;
        }

        .previewButton,
        .saveTop {
          padding: 12px 17px;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .previewButton {
          background: white;
          color: #30302f;
          border: 1px solid #e1d9cf;
        }

        .saveTop {
          background: #30302f;
          color: white;
          border: 1px solid #30302f;
        }

        .saveTop:disabled,
        .saveSide:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .message {
          margin-bottom: 20px;
          padding: 13px 16px;
          background: #f2e9dd;
          color: #765b3f;
          border: 1px solid #dec9ae;
          border-radius: 10px;
          font-size: 12px;
          font-weight: 700;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 350px;
          gap: 20px;
          align-items: start;
        }

        .content {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .twoColumns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .threeColumns {
          display: grid;
          grid-template-columns: 1.3fr 0.5fr 0.7fr;
          gap: 12px;
          align-items: end;
        }

        .visibleBox > span {
          display: block;
          margin-bottom: 7px;
          color: #665f58;
          font-size: 10px;
          font-weight: 800;
        }

        .visibleBox label {
          min-height: 42px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #faf8f5;
          border: 1px solid #ded7cf;
          border-radius: 10px;
        }

        .visibleBox input {
          width: 17px;
          height: 17px;
          accent-color: #c2a17b;
        }

        .visibleBox strong {
          font-size: 10px;
        }

        .sidePanel {
          position: sticky;
          top: 20px;
          padding: 25px;
          background: white;
          border: 1px solid #e7dfd5;
          border-radius: 17px;
        }

        .sidePanel h2 {
          margin: 7px 0 20px;
          font-size: 18px;
        }

        .headerPreview {
          padding: 15px;
          background: #f8f6f2;
          border: 1px solid #e8e0d6;
          border-radius: 13px;
        }

        .previewHeaderTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding-bottom: 12px;
          border-bottom: 1px solid #e7ded3;
        }

        .fakeLogo {
          display: flex;
          flex-direction: column;
        }

        .fakeLogo strong {
          font-size: 12px;
          letter-spacing: 1px;
        }

        .fakeLogo small {
          margin-top: 2px;
          color: #968a7e;
          font-size: 5px;
        }

        .logoHidden {
          color: #9b9289;
          font-size: 8px;
        }

        .fakeAppointment {
          padding: 7px 9px;
          background: #30302f;
          color: white;
          border-radius: 6px;
          font-size: 7px;
          font-weight: 800;
        }

        .previewNav {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          padding-top: 12px;
        }

        .previewNav span {
          padding: 6px 7px;
          background: white;
          color: #615950;
          border: 1px solid #e7dfd5;
          border-radius: 6px;
          font-size: 7px;
          font-weight: 800;
        }

        .corporatePreview {
          color: #946f49 !important;
          border-color: #d9c2a7 !important;
        }

        .dropdownPreview {
          margin-top: 12px;
          padding: 11px;
          background: white;
          border: 1px solid #e5ddd3;
          border-radius: 9px;
        }

        .dropdownPreview > small {
          display: block;
          margin-bottom: 7px;
          color: #a17e59;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .dropdownPreview > div {
          padding: 8px;
          background: #faf8f5;
          border-radius: 7px;
        }

        .dropdownPreview > div + div {
          margin-top: 5px;
        }

        .dropdownPreview strong {
          display: block;
          font-size: 8px;
        }

        .dropdownPreview span {
          display: block;
          margin-top: 2px;
          color: #91877d;
          font-size: 6px;
        }

        .infoBox {
          margin-top: 15px;
          padding: 13px;
          background: #f4eee7;
          border-radius: 10px;
        }

        .infoBox strong {
          display: block;
          color: #765a3e;
          font-size: 9px;
        }

        .infoBox p {
          margin: 5px 0 0;
          color: #8a7e72;
          font-size: 8px;
          line-height: 1.6;
        }

        .saveSide {
          width: 100%;
          margin-top: 16px;
          padding: 12px;
          background: #c2a17b;
          color: #242423;
          border: 0;
          border-radius: 9px;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        @media (max-width: 1050px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .sidePanel {
            position: static;
          }
        }

        @media (max-width: 750px) {
          .twoColumns,
          .threeColumns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 25px 16px;
          }

          .top {
            flex-direction: column;
            align-items: flex-start;
          }

          .topActions {
            width: 100%;
          }

          .previewButton,
          .saveTop {
            flex: 1;
            text-align: center;
          }

          h1 {
            font-size: 31px;
          }
        }
      `}</style>
    </main>
  );
}

function Section({ number, title, text, children }) {
  return (
    <section className="sectionPanel">
      <div className="sectionHeading">
        <div className="number">{number}</div>

        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
      </div>

      {children}

      <style jsx>{`
        .sectionPanel {
          padding: 25px;
          background: white;
          border: 1px solid #e7dfd5;
          border-radius: 17px;
        }

        .sectionHeading {
          display: flex;
          align-items: center;
          gap: 14px;
          padding-bottom: 20px;
          margin-bottom: 22px;
          border-bottom: 1px solid #eee8e0;
        }

        .number {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          display: grid;
          place-items: center;
          background: #eee4d7;
          color: #8a6846;
          border-radius: 11px;
          font-size: 10px;
          font-weight: 900;
        }

        h2 {
          margin: 0 0 4px;
          color: #30302f;
          font-size: 17px;
        }

        p {
          margin: 0;
          color: #91877e;
          font-size: 10px;
          line-height: 1.5;
        }
      `}</style>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}

      <style jsx>{`
        .field {
          margin-bottom: 17px;
        }

        .field:last-child {
          margin-bottom: 0;
        }

        label {
          display: block;
          margin-bottom: 7px;
          color: #665f58;
          font-size: 10px;
          font-weight: 800;
        }

        .field :global(input),
        .field :global(textarea) {
          width: 100%;
          padding: 12px 13px;
          background: #fdfcfb;
          color: #30302f;
          border: 1px solid #ded7cf;
          border-radius: 10px;
          outline: none;
          font: inherit;
          font-size: 12px;
        }

        .field :global(input:focus),
        .field :global(textarea:focus) {
          border-color: #c2a17b;
          box-shadow: 0 0 0 3px rgba(194, 161, 123, 0.1);
        }
      `}</style>
    </div>
  );
}

function Toggle({
  title,
  description,
  name,
  checked,
  onChange,
}) {
  return (
    <label className="toggle">
      <div>
        <strong>{title}</strong>
        <span>{description}</span>
      </div>

      <div className="toggleRight">
        <small>
          {checked ? "Aktif" : "Pasif"}
        </small>

        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
        />
      </div>

      <style jsx>{`
        .toggle {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          padding: 14px;
          margin-bottom: 9px;
          background: #faf8f5;
          border: 1px solid #eee6dc;
          border-radius: 11px;
          cursor: pointer;
        }

        .toggle:last-child {
          margin-bottom: 0;
        }

        strong {
          display: block;
          color: #49433d;
          font-size: 11px;
        }

        span {
          display: block;
          margin-top: 4px;
          color: #91877e;
          font-size: 9px;
        }

        .toggleRight {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        small {
          color: #9a7957;
          font-size: 8px;
          font-weight: 800;
        }

        input {
          width: 18px;
          height: 18px;
          accent-color: #c2a17b;
        }
      `}</style>
    </label>
  );
}

function MenuItem({
  title,
  prefix,
  form,
  onChange,
}) {
  return (
    <div className="menuItem">
      <div className="menuTitle">
        <strong>{title}</strong>

        <span>
          {form[`${prefix}_visible`]
            ? "Görünüyor"
            : "Gizli"}
        </span>
      </div>

      <div className="menuFields">
        <Field label="Menü Yazısı">
          <input
            name={`${prefix}_text`}
            value={form[`${prefix}_text`]}
            onChange={onChange}
          />
        </Field>

        <Field label="Bağlantı">
          <input
            name={`${prefix}_link`}
            value={form[`${prefix}_link`]}
            onChange={onChange}
          />
        </Field>

        <Field label="Sıra">
          <input
            type="number"
            min="1"
            name={`${prefix}_sort`}
            value={form[`${prefix}_sort`]}
            onChange={onChange}
          />
        </Field>
      </div>

      <label className="visibility">
        <input
          type="checkbox"
          name={`${prefix}_visible`}
          checked={form[`${prefix}_visible`]}
          onChange={onChange}
        />

        Bu menü öğesini göster
      </label>

      <style jsx>{`
        .menuItem {
          padding: 17px;
          margin-bottom: 11px;
          background: #faf8f5;
          border: 1px solid #eee6dc;
          border-radius: 13px;
        }

        .menuItem:last-child {
          margin-bottom: 0;
        }

        .menuTitle {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 15px;
        }

        .menuTitle strong {
          font-size: 12px;
        }

        .menuTitle span {
          color: #9a7957;
          font-size: 8px;
          font-weight: 800;
        }

        .menuFields {
          display: grid;
          grid-template-columns: 1fr 1.2fr 90px;
          gap: 10px;
        }

        .visibility {
          display: flex;
          align-items: center;
          gap: 7px;
          width: fit-content;
          color: #6e665e;
          font-size: 9px;
          font-weight: 750;
          cursor: pointer;
        }

        .visibility input {
          width: 16px;
          height: 16px;
          accent-color: #c2a17b;
        }

        @media (max-width: 750px) {
          .menuFields {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function SubMenuItem({
  number,
  title,
  prefix,
  form,
  onChange,
}) {
  return (
    <div className="subMenu">
      <div className="subHead">
        <span>{number}</span>
        <strong>{title}</strong>
      </div>

      <div className="two">
        <Field label="Alt Menü Başlığı">
          <input
            name={`${prefix}_text`}
            value={form[`${prefix}_text`]}
            onChange={onChange}
          />
        </Field>

        <Field label="Sıra">
          <input
            type="number"
            min="1"
            name={`${prefix}_sort`}
            value={form[`${prefix}_sort`]}
            onChange={onChange}
          />
        </Field>
      </div>

      <Field label="Kısa Açıklama">
        <input
          name={`${prefix}_description`}
          value={form[`${prefix}_description`]}
          onChange={onChange}
        />
      </Field>

      <Field label="Bağlantı">
        <input
          name={`${prefix}_link`}
          value={form[`${prefix}_link`]}
          onChange={onChange}
        />
      </Field>

      <label className="visibility">
        <input
          type="checkbox"
          name={`${prefix}_visible`}
          checked={form[`${prefix}_visible`]}
          onChange={onChange}
        />

        Bu alt menü öğesini göster
      </label>

      <style jsx>{`
        .subMenu {
          padding: 17px;
          margin-bottom: 11px;
          background: #faf8f5;
          border: 1px solid #eee6dc;
          border-radius: 13px;
        }

        .subMenu:last-child {
          margin-bottom: 0;
        }

        .subHead {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 15px;
        }

        .subHead span {
          color: #aa865e;
          font-size: 8px;
          font-weight: 900;
        }

        .subHead strong {
          font-size: 12px;
        }

        .two {
          display: grid;
          grid-template-columns: 1fr 100px;
          gap: 10px;
        }

        .visibility {
          display: flex;
          align-items: center;
          gap: 7px;
          width: fit-content;
          color: #6e665e;
          font-size: 9px;
          font-weight: 750;
          cursor: pointer;
        }

        .visibility input {
          width: 16px;
          height: 16px;
          accent-color: #c2a17b;
        }

        @media (max-width: 650px) {
          .two {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}