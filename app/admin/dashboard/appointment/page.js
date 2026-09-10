"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabaseClient";

const DEFAULTS = {
  setting_key: "main",
  breadcrumb_home_text: "Ana Sayfa",
  breadcrumb_current_text: "Randevu Al",
  hero_eyebrow: "ONLINE RANDEVU",
  hero_title_first: "Gülüşünüz için",
  hero_title_emphasis: "ilk adımı",
  hero_title_last: "atın.",
  hero_number: "01",
  hero_description:
    "Size uygun hekimi, tarihi ve saati seçerek randevu talebinizi oluşturun. Talebiniz kliniğimize ulaştığında ekibimiz sizinle iletişime geçecektir.",

  success_icon: "✓",
  success_eyebrow: "RANDEVU TALEBİNİZ ALINDI",
  success_title: "Teşekkür ederiz.",
  success_description:
    "Randevu talebiniz OK Dent sistemine kaydedildi. Ekibimiz randevunuzu değerlendirdikten sonra sizinle iletişime geçecektir.",
  success_new_button_text: "Yeni Randevu",

  form_eyebrow: "RANDEVU FORMU",
  form_title: "Randevunuzu planlayın.",
  form_badge_top: "OK",
  form_badge_bottom: "DENT",

  section_1_number: "01",
  section_1_title: "Kişisel Bilgiler",
  section_1_description: "Size ulaşabilmemiz için",
  full_name_label: "Ad Soyad",
  full_name_placeholder: "Adınız ve soyadınız",
  phone_label: "Telefon",
  phone_placeholder: "05__ ___ __ __",
  email_label: "E-posta",
  email_placeholder: "ornek@email.com",

  section_2_number: "02",
  section_2_title: "Tedavi ve Hekim",
  section_2_description: "Tercihinizi belirleyin",
  treatment_label: "Tedavi / Hizmet",
  treatment_placeholder: "Tedavi seçin",
  doctor_label: "Doktor",
  doctor_placeholder: "Doktor seçin",
  treatments: [
    "Genel Muayene",
    "Diş Beyazlatma",
    "İmplant Tedavisi",
    "Ortodonti",
    "Estetik Diş Hekimliği",
    "Kanal Tedavisi",
    "Dolgu",
    "Diş Çekimi",
    "Diş Taşı Temizliği",
    "Çocuk Diş Hekimliği",
    "Protez Diş",
    "Diğer",
  ],

  section_3_number: "03",
  section_3_title: "Tarih ve Saat",
  section_3_description: "Size uygun zamanı seçin",
  appointment_date_label: "Randevu Tarihi",
  appointment_time_label: "Randevu Saati",
  appointment_time_placeholder: "Saat seçin",
  time_options: [
    "09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30",
    "13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
    "17:00","17:30","18:00",
  ],

  section_4_number: "04",
  section_4_title: "Ek Bilgi",
  section_4_description: "Bize iletmek istediğiniz not",
  note_label: "Notunuz",
  note_placeholder:
    "Şikayetiniz, tedavi geçmişiniz veya eklemek istediğiniz bir bilgi varsa yazabilirsiniz...",
  note_max_length: 600,

  submit_button_text: "Randevu Talebi Oluştur",
  submit_sending_text: "Randevu gönderiliyor...",
  submit_button_description: "Bilgilerinizi kontrol ederek gönderin",
  submit_arrow: "→",
  submit_sending_mark: "...",
  form_note:
    "Bu form bir randevu talebi oluşturur. Kesin randevu, klinik ekibimizin sizinle iletişim kurmasının ardından onaylanır.",

  error_icon: "!",
  error_full_name: "Lütfen adınızı ve soyadınızı girin.",
  error_phone_empty: "Lütfen telefon numaranızı girin.",
  error_phone_invalid: "Telefon numaranızı kontrol edin.",
  error_doctor: "Lütfen bir doktor seçin.",
  error_date: "Lütfen randevu tarihi seçin.",
  error_time: "Lütfen randevu saati seçin.",
  error_past_date: "Geçmiş bir tarih için randevu oluşturamazsınız.",
  error_submit: "Randevu talebiniz gönderilemedi. Lütfen tekrar deneyin.",

  process_eyebrow: "OK DENT",
  process_title_first: "Randevu süreci",
  process_title_second: "nasıl işliyor?",
  process_1_number: "01",
  process_1_title: "Formu doldurun",
  process_1_description:
    "Hekiminizi, tarihi ve saati seçerek talebinizi gönderin.",
  process_2_number: "02",
  process_2_title: "Talebinizi inceleyelim",
  process_2_description:
    "Klinik ekibimiz randevu bilgilerinizi kontrol etsin.",
  process_3_number: "03",
  process_3_title: "Sizi arayalım",
  process_3_description:
    "Randevunuzun kesinleşmesi için sizinle iletişime geçelim.",

  contact_eyebrow: "İLETİŞİM",
  contact_title: "Doğrudan bize ulaşın.",
  contact_description:
    "Randevunuzu telefon veya WhatsApp üzerinden de oluşturabilirsiniz.",
  contact_phone_icon: "☎",
  contact_phone_label: "TELEFON",
  contact_phone_arrow: "→",
  contact_whatsapp_icon: "W",
  contact_whatsapp_label: "WHATSAPP",
  contact_whatsapp_arrow: "↗",
  contact_email_icon: "@",
  contact_email_label: "E-POSTA",
  contact_email_arrow: "→",
  working_hours_label: "ÇALIŞMA SAATLERİ",

  loading_mark: "OK",
  loading_text: "Randevu sistemi hazırlanıyor...",

  hidden_mark: "OK",
  hidden_eyebrow: "OK DENT",
  hidden_title: "Online randevu sayfamız şu anda kullanılamıyor.",
  hidden_description:
    "Randevu oluşturmak için kliniğimizle telefon veya WhatsApp üzerinden iletişime geçebilirsiniz.",
  hidden_home_button_text: "Ana Sayfaya Dön",
  hidden_home_button_link: "/",
  hidden_phone_button_text: "Telefonla Ara",
  hidden_whatsapp_button_text: "WhatsApp",
  is_active: true,
};

const TABS = [
  { key: "hero", label: "Üst Alan", icon: "✦" },
  { key: "form", label: "Form Alanları", icon: "▤" },
  { key: "options", label: "Tedavi & Saatler", icon: "◷" },
  { key: "messages", label: "Mesajlar", icon: "✓" },
  { key: "sidebar", label: "Sağ Panel", icon: "◫" },
  { key: "system", label: "Sistem", icon: "⚙" },
];

export default function AppointmentPageAdmin() {
  const [settings, setSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("hero");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("appointment_page_settings")
        .select("*")
        .eq("setting_key", "main")
        .single();

      if (error) throw error;

      setSettings({ ...DEFAULTS, ...(data || {}) });
    } catch (error) {
      console.error("Randevu sayfası ayarları yüklenemedi:", error);
      setMessage("Randevu sayfası ayarları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  }

  function updateField(field, value) {
    setSettings((current) => ({ ...current, [field]: value }));
  }

  async function saveSettings() {
    setSaving(true);
    setMessage("");

    try {
      const supabase = createClient();
      const payload = {
        ...settings,
        setting_key: "main",
        updated_at: new Date().toISOString(),
      };

      delete payload.id;

      const { data, error } = await supabase
        .from("appointment_page_settings")
        .upsert(payload, { onConflict: "setting_key" })
        .select()
        .single();

      if (error) throw error;

      setSettings({ ...DEFAULTS, ...(data || {}) });
      setMessage("Randevu sayfası ayarları kaydedildi.");
    } catch (error) {
      console.error("Ayarlar kaydedilemedi:", error);
      setMessage("Randevu sayfası ayarları kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  function Field({ label, field, textarea = false, type = "text", hint = "" }) {
    const value = settings?.[field] ?? "";

    return (
      <label className="field">
        <span>{label}</span>
        {hint && <small>{hint}</small>}
        {textarea ? (
          <textarea
            rows={4}
            value={value}
            onChange={(event) => updateField(field, event.target.value)}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(event) =>
              updateField(
                field,
                type === "number"
                  ? Number(event.target.value)
                  : event.target.value
              )
            }
          />
        )}
      </label>
    );
  }

  function Panel({ eyebrow, title, description, children }) {
    return (
      <section className="panel">
        <div className="panelHead">
          <div>
            <span>{eyebrow}</span>
            <h2>{title}</h2>
            {description && <p>{description}</p>}
          </div>
        </div>
        <div className="panelBody">{children}</div>
      </section>
    );
  }

  function ListEditor({ field, title, description, placeholder }) {
    const list = Array.isArray(settings?.[field]) ? settings[field] : [];

    return (
      <div className="listEditor">
        <div className="listHead">
          <div>
            <strong>{title}</strong>
            <span>{description}</span>
          </div>
          <button
            type="button"
            onClick={() => updateField(field, [...list, ""])}
          >
            + Yeni Ekle
          </button>
        </div>

        <div className="listRows">
          {list.map((item, index) => (
            <div className="listRow" key={`${field}-${index}`}>
              <div className="rowIndex">{String(index + 1).padStart(2, "0")}</div>
              <input
                value={item}
                placeholder={placeholder}
                onChange={(event) => {
                  const next = [...list];
                  next[index] = event.target.value;
                  updateField(field, next);
                }}
              />
              <button
                type="button"
                className="removeButton"
                onClick={() =>
                  updateField(
                    field,
                    list.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
              >
                Sil
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const activeTabInfo = useMemo(
    () => TABS.find((item) => item.key === activeTab),
    [activeTab]
  );

  if (loading) {
    return (
      <div className="loadingScreen">
        <div>OK</div>
        <strong>Randevu sayfası ayarları hazırlanıyor...</strong>
        <style jsx>{`
          .loadingScreen {
            min-height: 70vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            color: #30302f;
            font-family: Arial, Helvetica, sans-serif;
          }
          .loadingScreen div {
            width: 58px;
            height: 58px;
            display: grid;
            place-items: center;
            border-radius: 15px;
            background: #30302f;
            color: #c6a47d;
            font-weight: 900;
          }
          .loadingScreen strong {
            font-size: 11px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <main>
      <div className="pageHeader">
        <div>
          <span className="eyebrow">OK DENT / İÇERİK YÖNETİMİ</span>
          <h1>Randevu Sayfası</h1>
          <p>
            Ziyaretçilerin gördüğü online randevu sayfasını buradan düzenleyin.
            Gelen randevu talepleri bu bölümden tamamen ayrıdır.
          </p>
        </div>

        <div className="headerActions">
          <a href="/randevu" target="_blank" rel="noreferrer">
            Sayfayı Gör ↗
          </a>
          <label className="publishSwitch">
            <input
              type="checkbox"
              checked={settings.is_active !== false}
              onChange={(event) => updateField("is_active", event.target.checked)}
            />
            <span>
              <b>{settings.is_active !== false ? "Yayında" : "Kapalı"}</b>
              <small>Online randevu sayfası</small>
            </span>
          </label>
        </div>
      </div>

      {message && <div className="messageBox">{message}</div>}

      <div className="workspace">
        <aside className="tabMenu">
          <div className="menuTitle">
            <span>DÜZENLEME ALANLARI</span>
            <strong>Sayfa İçeriği</strong>
          </div>

          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.key}
              className={activeTab === tab.key ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tabIcon">{tab.icon}</span>
              <span>{tab.label}</span>
              <b>›</b>
            </button>
          ))}

          <div className="tipCard">
            <strong>İpucu</strong>
            <p>
              Değişiklikleri yaptıktan sonra sağ alttaki kaydet butonuna basın.
            </p>
          </div>
        </aside>

        <div className="editor">
          <div className="editorTitle">
            <div>
              <span>{activeTabInfo?.icon}</span>
              <div>
                <small>DÜZENLENEN BÖLÜM</small>
                <strong>{activeTabInfo?.label}</strong>
              </div>
            </div>
          </div>

          {activeTab === "hero" && (
            <>
              <Panel
                eyebrow="01 / NAVİGASYON"
                title="Breadcrumb"
                description="Sayfanın üst kısmındaki gezinme yolunu düzenleyin."
              >
                <div className="grid two">
                  <Field label="Ana Sayfa yazısı" field="breadcrumb_home_text" />
                  <Field label="Mevcut sayfa yazısı" field="breadcrumb_current_text" />
                </div>
              </Panel>

              <Panel
                eyebrow="02 / HERO"
                title="Sayfa Üst Alanı"
                description="Randevu sayfasının ilk görünen başlık ve açıklama alanı."
              >
                <div className="grid three">
                  <Field label="Üst başlık" field="hero_eyebrow" />
                  <Field label="Başlık başlangıcı" field="hero_title_first" />
                  <Field label="Vurgulu başlık" field="hero_title_emphasis" />
                  <Field label="Başlık sonu" field="hero_title_last" />
                  <Field label="Bilgi numarası" field="hero_number" />
                </div>
                <div className="singleField">
                  <Field
                    label="Hero açıklaması"
                    field="hero_description"
                    textarea
                  />
                </div>
              </Panel>
            </>
          )}

          {activeTab === "form" && (
            <>
              <Panel eyebrow="01 / FORM" title="Form Başlığı">
                <div className="grid four">
                  <Field label="Üst başlık" field="form_eyebrow" />
                  <Field label="Ana başlık" field="form_title" />
                  <Field label="Rozet üst" field="form_badge_top" />
                  <Field label="Rozet alt" field="form_badge_bottom" />
                </div>
              </Panel>

              <Panel eyebrow="02 / KİŞİSEL BİLGİLER" title="Kişisel Bilgiler Bölümü">
                <div className="sectionMini">
                  <Field label="Bölüm no" field="section_1_number" />
                  <Field label="Bölüm başlığı" field="section_1_title" />
                  <Field label="Bölüm açıklaması" field="section_1_description" />
                </div>
                <div className="grid two">
                  <Field label="Ad Soyad etiketi" field="full_name_label" />
                  <Field label="Ad Soyad placeholder" field="full_name_placeholder" />
                  <Field label="Telefon etiketi" field="phone_label" />
                  <Field label="Telefon placeholder" field="phone_placeholder" />
                  <Field label="E-posta etiketi" field="email_label" />
                  <Field label="E-posta placeholder" field="email_placeholder" />
                </div>
              </Panel>

              <Panel eyebrow="03 / TEDAVİ & HEKİM" title="Tedavi ve Hekim Bölümü">
                <div className="sectionMini">
                  <Field label="Bölüm no" field="section_2_number" />
                  <Field label="Bölüm başlığı" field="section_2_title" />
                  <Field label="Bölüm açıklaması" field="section_2_description" />
                </div>
                <div className="grid two">
                  <Field label="Tedavi etiketi" field="treatment_label" />
                  <Field label="Tedavi seçim yazısı" field="treatment_placeholder" />
                  <Field label="Doktor etiketi" field="doctor_label" />
                  <Field label="Doktor seçim yazısı" field="doctor_placeholder" />
                </div>
              </Panel>

              <Panel eyebrow="04 / TARİH & SAAT" title="Tarih ve Saat Bölümü">
                <div className="sectionMini">
                  <Field label="Bölüm no" field="section_3_number" />
                  <Field label="Bölüm başlığı" field="section_3_title" />
                  <Field label="Bölüm açıklaması" field="section_3_description" />
                </div>
                <div className="grid three">
                  <Field label="Tarih etiketi" field="appointment_date_label" />
                  <Field label="Saat etiketi" field="appointment_time_label" />
                  <Field label="Saat seçim yazısı" field="appointment_time_placeholder" />
                </div>
              </Panel>

              <Panel eyebrow="05 / EK BİLGİ" title="Not Alanı">
                <div className="sectionMini">
                  <Field label="Bölüm no" field="section_4_number" />
                  <Field label="Bölüm başlığı" field="section_4_title" />
                  <Field label="Bölüm açıklaması" field="section_4_description" />
                </div>
                <div className="grid two">
                  <Field label="Not etiketi" field="note_label" />
                  <Field
                    label="Karakter sınırı"
                    field="note_max_length"
                    type="number"
                  />
                </div>
                <Field label="Not placeholder" field="note_placeholder" textarea />
              </Panel>
            </>
          )}

          {activeTab === "options" && (
            <>
              <Panel
                eyebrow="01 / TEDAVİLER"
                title="Tedavi Seçenekleri"
                description="Hastaların formda seçebileceği tedavi ve hizmetleri yönetin."
              >
                <ListEditor
                  field="treatments"
                  title="Tedavi listesi"
                  description={`${settings.treatments?.length || 0} seçenek`}
                  placeholder="Tedavi / hizmet adı"
                />
              </Panel>

              <Panel
                eyebrow="02 / SAATLER"
                title="Randevu Saatleri"
                description="Formdaki saat seçim listesini yönetin."
              >
                <ListEditor
                  field="time_options"
                  title="Saat listesi"
                  description={`${settings.time_options?.length || 0} saat`}
                  placeholder="Örn. 09:30"
                />
              </Panel>
            </>
          )}

          {activeTab === "messages" && (
            <>
              <Panel eyebrow="01 / BAŞARI" title="Başarılı Gönderim Ekranı">
                <div className="grid three">
                  <Field label="İkon" field="success_icon" />
                  <Field label="Üst başlık" field="success_eyebrow" />
                  <Field label="Ana başlık" field="success_title" />
                </div>
                <Field label="Açıklama" field="success_description" textarea />
                <div className="grid two">
                  <Field label="Yeni randevu butonu" field="success_new_button_text" />
                </div>
              </Panel>

              <Panel eyebrow="02 / GÖNDER BUTONU" title="Form Gönderim Alanı">
                <div className="grid three">
                  <Field label="Buton yazısı" field="submit_button_text" />
                  <Field label="Gönderiliyor yazısı" field="submit_sending_text" />
                  <Field label="Alt açıklama" field="submit_button_description" />
                  <Field label="Normal ikon" field="submit_arrow" />
                  <Field label="Yükleme ikonu" field="submit_sending_mark" />
                </div>
                <Field label="Form alt bilgilendirmesi" field="form_note" textarea />
              </Panel>

              <Panel eyebrow="03 / HATALAR" title="Doğrulama ve Hata Mesajları">
                <div className="grid two">
                  <Field label="Hata ikonu" field="error_icon" />
                  <Field label="Ad Soyad hatası" field="error_full_name" />
                  <Field label="Telefon boş hatası" field="error_phone_empty" />
                  <Field label="Geçersiz telefon hatası" field="error_phone_invalid" />
                  <Field label="Doktor seçimi hatası" field="error_doctor" />
                  <Field label="Tarih seçimi hatası" field="error_date" />
                  <Field label="Saat seçimi hatası" field="error_time" />
                  <Field label="Geçmiş tarih hatası" field="error_past_date" />
                </div>
                <Field label="Gönderim hatası" field="error_submit" textarea />
              </Panel>
            </>
          )}

          {activeTab === "sidebar" && (
            <>
              <Panel eyebrow="01 / SÜREÇ" title="Randevu Süreci Kartı">
                <div className="grid three">
                  <Field label="Üst başlık" field="process_eyebrow" />
                  <Field label="Başlık 1" field="process_title_first" />
                  <Field label="Başlık 2" field="process_title_second" />
                </div>

                <div className="stepCards">
                  {[1, 2, 3].map((number) => (
                    <div className="stepCard" key={number}>
                      <div className="stepNumber">{number}</div>
                      <Field label="Adım no" field={`process_${number}_number`} />
                      <Field label="Başlık" field={`process_${number}_title`} />
                      <Field
                        label="Açıklama"
                        field={`process_${number}_description`}
                        textarea
                      />
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel eyebrow="02 / İLETİŞİM" title="İletişim Kartı">
                <div className="grid three">
                  <Field label="Üst başlık" field="contact_eyebrow" />
                  <Field label="Başlık" field="contact_title" />
                  <Field label="Çalışma saatleri etiketi" field="working_hours_label" />
                </div>
                <Field label="Açıklama" field="contact_description" textarea />

                <div className="contactConfig">
                  <div className="contactRow">
                    <strong>Telefon</strong>
                    <Field label="İkon" field="contact_phone_icon" />
                    <Field label="Etiket" field="contact_phone_label" />
                    <Field label="Ok" field="contact_phone_arrow" />
                  </div>
                  <div className="contactRow">
                    <strong>WhatsApp</strong>
                    <Field label="İkon" field="contact_whatsapp_icon" />
                    <Field label="Etiket" field="contact_whatsapp_label" />
                    <Field label="Ok" field="contact_whatsapp_arrow" />
                  </div>
                  <div className="contactRow">
                    <strong>E-posta</strong>
                    <Field label="İkon" field="contact_email_icon" />
                    <Field label="Etiket" field="contact_email_label" />
                    <Field label="Ok" field="contact_email_arrow" />
                  </div>
                </div>
              </Panel>
            </>
          )}

          {activeTab === "system" && (
            <>
              <Panel eyebrow="01 / YÜKLEME" title="Yükleme Ekranı">
                <div className="grid two">
                  <Field label="Yükleme işareti" field="loading_mark" />
                  <Field label="Yükleme yazısı" field="loading_text" />
                </div>
              </Panel>

              <Panel
                eyebrow="02 / SAYFA KAPALI"
                title="Sayfa Yayında Değilken"
                description="Online randevu sayfasını kapattığınızda ziyaretçilerin göreceği içerik."
              >
                <div className="grid three">
                  <Field label="İşaret" field="hidden_mark" />
                  <Field label="Üst başlık" field="hidden_eyebrow" />
                  <Field label="Ana sayfa butonu" field="hidden_home_button_text" />
                  <Field label="Ana sayfa linki" field="hidden_home_button_link" />
                  <Field label="Telefon butonu" field="hidden_phone_button_text" />
                  <Field label="WhatsApp butonu" field="hidden_whatsapp_button_text" />
                </div>
                <Field label="Başlık" field="hidden_title" />
                <Field label="Açıklama" field="hidden_description" textarea />
              </Panel>
            </>
          )}
        </div>
      </div>

      <div className="saveBar">
        <div>
          <span>{message || "Değişiklikler kaydedilene kadar yalnızca bu ekranda kalır."}</span>
        </div>
        <button type="button" onClick={saveSettings} disabled={saving}>
          {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          <b>{saving ? "…" : "✓"}</b>
        </button>
      </div>

      <style jsx>{`
        :global(*) { box-sizing: border-box; }
        :global(body) {
          margin: 0;
          background: #f8f6f2;
        }
        :global(input),
        :global(textarea),
        :global(button) {
          font-family: inherit;
        }
        main {
          min-height: 100vh;
          padding-bottom: 100px;
          color: #30302f;
          font-family: Arial, Helvetica, sans-serif;
        }
        .pageHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
          margin-bottom: 27px;
        }
        .eyebrow {
          color: #9b7955;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }
        .pageHeader h1 {
          margin: 8px 0 8px;
          font-size: 34px;
          letter-spacing: -1.4px;
        }
        .pageHeader p {
          max-width: 650px;
          margin: 0;
          color: #827a72;
          font-size: 11px;
          line-height: 1.7;
        }
        .headerActions {
          display: flex;
          align-items: stretch;
          gap: 9px;
        }
        .headerActions > a {
          display: flex;
          align-items: center;
          padding: 0 16px;
          border: 1px solid #ddd4ca;
          border-radius: 11px;
          background: white;
          color: #514b46;
          text-decoration: none;
          font-size: 9px;
          font-weight: 900;
        }
        .publishSwitch {
          min-width: 180px;
          padding: 10px 14px;
          display: flex;
          align-items: center;
          gap: 11px;
          border: 1px solid #ddd4ca;
          border-radius: 11px;
          background: white;
          cursor: pointer;
        }
        .publishSwitch input {
          width: 17px;
          height: 17px;
          accent-color: #30302f;
        }
        .publishSwitch span {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .publishSwitch b {
          font-size: 9px;
        }
        .publishSwitch small {
          color: #9b9289;
          font-size: 7px;
        }
        .messageBox {
          margin-bottom: 16px;
          padding: 12px 15px;
          border: 1px solid #decdb8;
          border-radius: 10px;
          background: #f3e9dc;
          color: #806142;
          font-size: 9px;
          font-weight: 800;
        }
        .workspace {
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }
        .tabMenu {
          position: sticky;
          top: 18px;
          overflow: hidden;
          border: 1px solid #e1d9cf;
          border-radius: 16px;
          background: #30302f;
          box-shadow: 0 15px 45px rgba(48, 48, 47, 0.08);
        }
        .menuTitle {
          padding: 21px 18px 16px;
          border-bottom: 1px solid rgba(255,255,255,.08);
        }
        .menuTitle span {
          display: block;
          margin-bottom: 5px;
          color: #c6a47d;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }
        .menuTitle strong {
          color: white;
          font-size: 14px;
        }
        .tab {
          width: 100%;
          min-height: 49px;
          padding: 0 14px;
          display: grid;
          grid-template-columns: 27px 1fr auto;
          align-items: center;
          gap: 8px;
          border: 0;
          border-bottom: 1px solid rgba(255,255,255,.055);
          background: transparent;
          color: #beb6ae;
          cursor: pointer;
          text-align: left;
          font-size: 9px;
          font-weight: 800;
        }
        .tab:hover {
          color: white;
          background: rgba(255,255,255,.045);
        }
        .tab.active {
          background: #c6a47d;
          color: #242423;
        }
        .tabIcon {
          font-size: 13px;
          text-align: center;
        }
        .tab b {
          font-size: 15px;
        }
        .tipCard {
          margin: 14px;
          padding: 14px;
          border-radius: 10px;
          background: rgba(255,255,255,.06);
        }
        .tipCard strong {
          color: #d6b58d;
          font-size: 8px;
        }
        .tipCard p {
          margin: 5px 0 0;
          color: #a9a099;
          font-size: 7px;
          line-height: 1.6;
        }
        .editor {
          min-width: 0;
        }
        .editorTitle {
          margin-bottom: 12px;
          padding: 13px 17px;
          border: 1px solid #e3dbd1;
          border-radius: 12px;
          background: white;
        }
        .editorTitle > div {
          display: flex;
          align-items: center;
          gap: 11px;
        }
        .editorTitle > div > span {
          width: 34px;
          height: 34px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #eee4d7;
          color: #8c6947;
          font-size: 14px;
        }
        .editorTitle small {
          display: block;
          margin-bottom: 3px;
          color: #9b8064;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1px;
        }
        .editorTitle strong {
          font-size: 12px;
        }
        .panel {
          margin-bottom: 13px;
          overflow: hidden;
          border: 1px solid #e3dbd1;
          border-radius: 15px;
          background: white;
        }
        .panelHead {
          padding: 18px 20px;
          border-bottom: 1px solid #eee8e1;
          background: #fcfbf9;
        }
        .panelHead span {
          display: block;
          margin-bottom: 5px;
          color: #9e7b54;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }
        .panelHead h2 {
          margin: 0;
          font-size: 15px;
        }
        .panelHead p {
          margin: 6px 0 0;
          color: #918880;
          font-size: 8px;
          line-height: 1.5;
        }
        .panelBody {
          padding: 20px;
        }
        :global(.grid) {
          display: grid;
          gap: 12px;
        }
        :global(.grid.two) { grid-template-columns: repeat(2, 1fr); }
        :global(.grid.three) { grid-template-columns: repeat(3, 1fr); }
        :global(.grid.four) { grid-template-columns: repeat(4, 1fr); }
        :global(.field) {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        :global(.field > span) {
          color: #615b55;
          font-size: 8px;
          font-weight: 900;
        }
        :global(.field > small) {
          color: #9d958d;
          font-size: 7px;
        }
        :global(.field input),
        :global(.field textarea) {
          width: 100%;
          min-height: 41px;
          padding: 10px 11px;
          border: 1px solid #ded6cd;
          outline: none;
          border-radius: 9px;
          background: #faf8f5;
          color: #30302f;
          font-size: 9px;
          transition: .15s;
        }
        :global(.field textarea) {
          resize: vertical;
          line-height: 1.6;
        }
        :global(.field input:focus),
        :global(.field textarea:focus) {
          border-color: #b38c63;
          background: white;
          box-shadow: 0 0 0 3px rgba(198,164,125,.12);
        }
        :global(.singleField) {
          margin-top: 12px;
        }
        :global(.sectionMini) {
          margin-bottom: 16px;
          padding: 14px;
          display: grid;
          grid-template-columns: 90px 1fr 1.4fr;
          gap: 10px;
          border-radius: 11px;
          background: #f4eee7;
        }
        :global(.listEditor) {
          border: 1px solid #e5ddd4;
          border-radius: 12px;
          overflow: hidden;
        }
        :global(.listHead) {
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          background: #f8f5f1;
        }
        :global(.listHead strong) {
          display: block;
          font-size: 10px;
        }
        :global(.listHead span) {
          display: block;
          margin-top: 3px;
          color: #958c84;
          font-size: 7px;
        }
        :global(.listHead button) {
          padding: 9px 12px;
          border: 0;
          border-radius: 8px;
          background: #30302f;
          color: white;
          cursor: pointer;
          font-size: 8px;
          font-weight: 900;
        }
        :global(.listRows) {
          padding: 8px 13px 13px;
        }
        :global(.listRow) {
          padding: 7px 0;
          display: grid;
          grid-template-columns: 36px 1fr 55px;
          align-items: center;
          gap: 8px;
          border-bottom: 1px solid #eee7df;
        }
        :global(.listRow:last-child) {
          border-bottom: 0;
        }
        :global(.rowIndex) {
          width: 30px;
          height: 30px;
          display: grid;
          place-items: center;
          border-radius: 7px;
          background: #eee4d7;
          color: #8c6847;
          font-size: 7px;
          font-weight: 900;
        }
        :global(.listRow input) {
          width: 100%;
          height: 36px;
          padding: 0 10px;
          border: 1px solid #ddd5cc;
          outline: none;
          border-radius: 8px;
          background: #fbfaf8;
          color: #403c38;
          font-size: 9px;
        }
        :global(.removeButton) {
          height: 34px;
          border: 1px solid #ead9d4;
          border-radius: 8px;
          background: #fff8f6;
          color: #9a5d52;
          cursor: pointer;
          font-size: 8px;
          font-weight: 900;
        }
        :global(.stepCards) {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }
        :global(.stepCard) {
          position: relative;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border: 1px solid #e5ddd4;
          border-radius: 12px;
          background: #faf8f5;
        }
        :global(.stepNumber) {
          position: absolute;
          right: 13px;
          top: 10px;
          color: #e1d4c5;
          font-size: 26px;
          font-weight: 900;
        }
        :global(.contactConfig) {
          margin-top: 15px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        :global(.contactRow) {
          padding: 12px;
          display: grid;
          grid-template-columns: 90px 90px 1fr 90px;
          align-items: end;
          gap: 10px;
          border: 1px solid #e7dfd6;
          border-radius: 10px;
          background: #faf8f5;
        }
        :global(.contactRow > strong) {
          align-self: center;
          font-size: 9px;
        }
        .saveBar {
          position: fixed;
          left: 270px;
          right: 0;
          bottom: 0;
          z-index: 50;
          padding: 12px 35px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid #ddd5cc;
          background: rgba(248,246,242,.94);
          backdrop-filter: blur(12px);
          box-shadow: 0 -10px 30px rgba(48,48,47,.06);
        }
        .saveBar span {
          color: #847b73;
          font-size: 8px;
        }
        .saveBar button {
          min-width: 210px;
          height: 44px;
          padding: 0 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border: 0;
          border-radius: 10px;
          background: #30302f;
          color: white;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
        }
        .saveBar button b {
          color: #c6a47d;
          font-size: 13px;
        }
        .saveBar button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }
        @media (max-width: 1100px) {
          :global(.grid.four) { grid-template-columns: repeat(2, 1fr); }
          :global(.stepCards) { grid-template-columns: 1fr; }
          :global(.contactRow) { grid-template-columns: 80px 80px 1fr 70px; }
        }
        @media (max-width: 900px) {
          .workspace { grid-template-columns: 1fr; }
          .tabMenu {
            position: static;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
          }
          .menuTitle, .tipCard { display: none; }
          .tab {
            border-right: 1px solid rgba(255,255,255,.06);
          }
          .saveBar { left: 220px; }
        }
        @media (max-width: 720px) {
          .pageHeader {
            align-items: flex-start;
            flex-direction: column;
          }
          .headerActions {
            width: 100%;
            flex-direction: column;
          }
          .headerActions > a, .publishSwitch {
            min-height: 46px;
            width: 100%;
          }
          .tabMenu { grid-template-columns: repeat(2, 1fr); }
          :global(.grid.two),
          :global(.grid.three),
          :global(.grid.four),
          :global(.sectionMini),
          :global(.contactRow) {
            grid-template-columns: 1fr;
          }
          .saveBar {
            left: 0;
            padding: 10px 18px;
          }
          .saveBar > div { display: none; }
          .saveBar button { width: 100%; }
        }
      `}</style>
    </main>
  );
}
