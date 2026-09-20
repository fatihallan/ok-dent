"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabaseClient";

export default function SettingsPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    clinic_name: "",
    clinic_subtitle: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    map_address: "",
    working_hours: "",
    instagram_url: "",
    facebook_url: "",
    youtube_url: "",
    tiktok_url: "",
    logo_url: "",
    favicon_url: "",
    seo_title: "OK Dent | Modern Diş Kliniği",
    seo_description: "OK Dent modern diş kliniği web sitesi",
    header_button_text: "",
    header_button_link: "",
    footer_text: "",
    footer_note: "",
    footer_quick_links_title: "HIZLI ERİŞİM",
    footer_corporate_title: "KURUMSAL",
    footer_contact_title: "İLETİŞİM",
    footer_copyright_prefix: "©",
    instagram_label: "Instagram",
    facebook_label: "Facebook",
    youtube_label: "YouTube",
    tiktok_label: "TikTok",
    social_external_mark: " ↗",
    theme_primary_color: "#30302f",
    theme_accent_color: "#c2a17b",
    theme_background_color: "#f8f6f2",
    theme_surface_color: "#ffffff",
    theme_text_color: "#242423",
    theme_muted_text_color: "#746f68",
    theme_border_color: "#e8dfd5",
    theme_radius: 18,
    is_active: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("setting_key", "main")
        .single();

      if (error) {
        console.error(error);
        setMessage("Site ayarları yüklenemedi.");
        setLoading(false);
        return;
      }

      if (data) {
        setForm({
          clinic_name: data.clinic_name || "",
          clinic_subtitle: data.clinic_subtitle || "",
          phone: data.phone || "",
          whatsapp: data.whatsapp || "",
          email: data.email || "",
          address: data.address || "",
          map_address: data.map_address || "",
          working_hours: data.working_hours || "",
          instagram_url: data.instagram_url || "",
          facebook_url: data.facebook_url || "",
          youtube_url: data.youtube_url || "",
          tiktok_url: data.tiktok_url || "",
          logo_url: data.logo_url || "",
          favicon_url: data.favicon_url || "",
          seo_title: data.seo_title ?? "",
          seo_description: data.seo_description ?? "",
          header_button_text: data.header_button_text || "",
          header_button_link: data.header_button_link || "",
          footer_text: data.footer_text || "",
          footer_note: data.footer_note || "",
          footer_quick_links_title: data.footer_quick_links_title ?? "HIZLI ERİŞİM",
          footer_corporate_title: data.footer_corporate_title ?? "KURUMSAL",
          footer_contact_title: data.footer_contact_title ?? "İLETİŞİM",
          footer_copyright_prefix: data.footer_copyright_prefix ?? "©",
          instagram_label: data.instagram_label ?? "Instagram",
          facebook_label: data.facebook_label ?? "Facebook",
          youtube_label: data.youtube_label ?? "YouTube",
          tiktok_label: data.tiktok_label ?? "TikTok",
          social_external_mark: data.social_external_mark ?? " ↗",
          theme_primary_color: data.theme_primary_color || "#30302f",
          theme_accent_color: data.theme_accent_color || "#c2a17b",
          theme_background_color: data.theme_background_color || "#f8f6f2",
          theme_surface_color: data.theme_surface_color || "#ffffff",
          theme_text_color: data.theme_text_color || "#242423",
          theme_muted_text_color: data.theme_muted_text_color || "#746f68",
          theme_border_color: data.theme_border_color || "#e8dfd5",
          theme_radius:
            typeof data.theme_radius === "number" ? data.theme_radius : 18,
          is_active: data.is_active ?? true,
        });
      }

      setLoading(false);
    }

    loadSettings();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "theme_radius"
          ? Number(value)
          : value,
    }));
  }

  async function uploadLogo(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Lütfen bir görsel dosyası seç.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Logo dosyası en fazla 5 MB olabilir.");
      return;
    }

    setUploadingLogo(true);
    setMessage("Logo yükleniyor...");

    const supabase = createClient();

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "png";

      const safeFileName = `logo-${Date.now()}.${extension}`;
      const filePath = `branding/${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        setMessage(
          "Logo yüklenemedi. Storage izinlerini ve site-assets bucketını kontrol et."
        );
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        setMessage("Logo URL'si oluşturulamadı.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        logo_url: publicUrl,
      }));

      setMessage(
        "✓ Logo Storage'a yüklendi. Şimdi Tüm Ayarları Kaydet butonuna bas."
      );
    } catch (error) {
      console.error(error);
      setMessage("Logo yüklenirken beklenmeyen bir hata oluştu.");
    } finally {
      setUploadingLogo(false);

      // Aynı dosyanın tekrar seçilebilmesini sağlar.
      e.target.value = "";
    }
  }

  function removeLogoFromForm() {
    setForm((prev) => ({
      ...prev,
      logo_url: "",
    }));

    setMessage(
      "Logo kaldırılmak üzere işaretlendi. Değişikliği uygulamak için kaydet."
    );
  }

  async function saveSettings(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("site_settings")
      .update({
        ...form,
        updated_at: new Date().toISOString(),
      })
      .eq("setting_key", "main");

    if (error) {
      console.error(error);
      setMessage("Kaydetme sırasında hata oluştu.");
    } else {
      setMessage("✓ Site ayarları başarıyla kaydedildi.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="loadingPage">
        Site ayarları yükleniyor...

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8f6f2;
            color: #30302f;
            font-family: Arial, sans-serif;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <div className="topLeft">
          <button
            className="back"
            type="button"
            onClick={() => router.push("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <div className="brand">
            <span>OK DENT</span>
            <small>SİTE AYARLARI</small>
          </div>
        </div>

        <a
          className="siteButton"
          href="/"
          target="_blank"
          rel="noreferrer"
        >
          Siteyi Görüntüle ↗
        </a>
      </header>

      <div className="container">
        <div className="pageTitle">
          <span className="label">GENEL YÖNETİM</span>

          <h1>Site Ayarları</h1>

          <p>
            Klinikte ve sitenin farklı bölümlerinde kullanılan genel
            bilgileri tek merkezden yönet.
          </p>
        </div>

        {message && <div className="message">{message}</div>}

        <form onSubmit={saveSettings}>
          <div className="layout">
            <div>
              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">01</span>

                  <div>
                    <h2>Klinik Bilgileri</h2>
                    <p>Sitenin temel kimlik ve iletişim bilgileri.</p>
                  </div>
                </div>

                <div className="grid2">
                  <Field
                    label="Klinik Adı"
                    name="clinic_name"
                    value={form.clinic_name}
                    onChange={handleChange}
                  />

                  <Field
                    label="Klinik Alt Başlığı"
                    name="clinic_subtitle"
                    value={form.clinic_subtitle}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid2">
                  <Field
                    label="Telefon"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+90 555 000 00 00"
                  />

                  <Field
                    label="WhatsApp"
                    name="whatsapp"
                    value={form.whatsapp}
                    onChange={handleChange}
                    placeholder="+90 555 000 00 00"
                  />
                </div>

                <Field
                  label="E-posta"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="info@okdent.com"
                />

                <div className="field">
                  <label>Adres</label>

                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Klinik adresi..."
                  />
                </div>

                <Field
                  label="Harita / Yol Tarifi Adresi"
                  name="map_address"
                  value={form.map_address}
                  onChange={handleChange}
                  placeholder="Taşpazar Mah. Pir Ali Sultan Cad. Nazmiye Hatun Apt. No: 5/A, 68100 Aksaray Merkez/Aksaray"
                />

                <Field
                  label="Çalışma Saatleri"
                  name="working_hours"
                  value={form.working_hours}
                  onChange={handleChange}
                  placeholder="Pazartesi - Cumartesi 09:00 - 19:00"
                />
              </section>

              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">02</span>

                  <div>
                    <h2>Sosyal Medya</h2>
                    <p>Sosyal medya hesaplarının bağlantıları.</p>
                  </div>
                </div>

                <Field
                  label="Instagram"
                  name="instagram_url"
                  value={form.instagram_url}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                />

                <Field
                  label="Facebook"
                  name="facebook_url"
                  value={form.facebook_url}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                />

                <div className="grid2">
                  <Field
                    label="YouTube"
                    name="youtube_url"
                    value={form.youtube_url}
                    onChange={handleChange}
                    placeholder="https://youtube.com/..."
                  />

                  <Field
                    label="TikTok"
                    name="tiktok_url"
                    value={form.tiktok_url}
                    onChange={handleChange}
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </section>

              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">03</span>

                  <div>
                    <h2>Logo & Site Kimliği</h2>
                    <p>
                      Logoyu bilgisayarından doğrudan Supabase Storage'a yükle.
                    </p>
                  </div>
                </div>

                <div className="field">
                  <label>Site Logosu</label>

                  <div className="uploadArea">
                    <div className="uploadIcon">↑</div>

                    <div className="uploadText">
                      <strong>
                        {uploadingLogo
                          ? "Logo yükleniyor..."
                          : "Yeni logo yükle"}
                      </strong>

                      <span>
                        PNG, JPG, WEBP veya SVG · Maksimum 5 MB
                      </span>
                    </div>

                    <label
                      className={`uploadButton ${
                        uploadingLogo ? "disabled" : ""
                      }`}
                    >
                      {uploadingLogo ? "Yükleniyor" : "Dosya Seç"}

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        onChange={uploadLogo}
                        disabled={uploadingLogo}
                        hidden
                      />
                    </label>
                  </div>

                  {form.logo_url && (
                    <>
                      <div className="currentFile">
                        <span>✓ Logo hazır</span>

                        <div className="fileActions">
                          <a
                            href={form.logo_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Görseli Aç ↗
                          </a>

                          <button
                            type="button"
                            className="removeButton"
                            onClick={removeLogoFromForm}
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>

                      <div className="logoPreview">
                        <span>LOGO ÖNİZLEME</span>

                        <div className="logoPreviewBox">
                          <img
                            src={form.logo_url}
                            alt="OK Dent Logo"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {!form.logo_url && (
                    <div className="emptyLogo">
                      Henüz bir logo seçilmedi.
                    </div>
                  )}
                </div>

                <Field
                  label="Favicon URL"
                  name="favicon_url"
                  value={form.favicon_url}
                  onChange={handleChange}
                  placeholder="Favicon yüklemeyi sonraki adımda ekleyeceğiz"
                />

                <Field label="SEO / Tarayıcı Başlığı" name="seo_title" value={form.seo_title} onChange={handleChange} placeholder="OK Dent | Modern Diş Kliniği" />
                <Field label="SEO Açıklaması" name="seo_description" value={form.seo_description} onChange={handleChange} placeholder="Arama motorlarında görünen site açıklaması" />
              </section>
            </div>

            <div>
              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">04</span>

                  <div>
                    <h2>Header</h2>
                    <p>Üst menüdeki marka ve ana işlem butonu.</p>
                  </div>
                </div>

                <Field
                  label="Buton Yazısı"
                  name="header_button_text"
                  value={form.header_button_text}
                  onChange={handleChange}
                  placeholder="Randevu Al"
                />

                <Field
                  label="Buton Bağlantısı"
                  name="header_button_link"
                  value={form.header_button_link}
                  onChange={handleChange}
                  placeholder="#iletisim"
                />

                <div className="headerPreview">
                  <div className="miniBrand">
                    {form.logo_url ? (
                      <img src={form.logo_url} alt="" />
                    ) : (
                      <span className="miniLogo">OK</span>
                    )}

                    <div className="miniBrandText">
                      <strong>
                        {form.clinic_name || "OK Dent"}
                      </strong>

                      <small>
                        {form.clinic_subtitle ||
                          "Modern Diş Kliniği"}
                      </small>
                    </div>
                  </div>

                  <span className="previewButton">
                    {form.header_button_text || "Randevu Al"}
                  </span>
                </div>
              </section>

              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">05</span>

                  <div>
                    <h2>Footer</h2>
                    <p>Sitenin en alt bölümündeki kurumsal bilgiler.</p>
                  </div>
                </div>

                <Field
                  label="Footer Ana Yazısı"
                  name="footer_text"
                  value={form.footer_text}
                  onChange={handleChange}
                />

                <Field
                  label="Footer Alt Yazısı"
                  name="footer_note"
                  value={form.footer_note}
                  onChange={handleChange}
                />

                <div className="grid2">
                  <Field label="Hızlı Erişim Başlığı" name="footer_quick_links_title" value={form.footer_quick_links_title} onChange={handleChange} />
                  <Field label="Kurumsal Başlığı" name="footer_corporate_title" value={form.footer_corporate_title} onChange={handleChange} />
                </div>

                <div className="grid2">
                  <Field label="İletişim Başlığı" name="footer_contact_title" value={form.footer_contact_title} onChange={handleChange} />
                  <Field label="Copyright İşareti / Öneki" name="footer_copyright_prefix" value={form.footer_copyright_prefix} onChange={handleChange} />
                </div>

                <div className="grid2">
                  <Field label="Instagram Görünen Adı" name="instagram_label" value={form.instagram_label} onChange={handleChange} />
                  <Field label="Facebook Görünen Adı" name="facebook_label" value={form.facebook_label} onChange={handleChange} />
                </div>

                <div className="grid2">
                  <Field label="YouTube Görünen Adı" name="youtube_label" value={form.youtube_label} onChange={handleChange} />
                  <Field label="TikTok Görünen Adı" name="tiktok_label" value={form.tiktok_label} onChange={handleChange} />
                </div>

                <Field label="Sosyal Medya Dış Bağlantı İşareti" name="social_external_mark" value={form.social_external_mark} onChange={handleChange} placeholder=" ↗" />

                <div className="footerPreview">
                  <strong>
                    {form.footer_text ||
                      form.clinic_name ||
                      "OK Dent"}
                  </strong>

                  <span>
                    {form.footer_note ||
                      form.clinic_subtitle ||
                      "Modern Diş Kliniği"}
                  </span>

                  <div className="footerDetails">
                    {form.phone && <small>{form.phone}</small>}
                    {form.email && <small>{form.email}</small>}
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">06</span>

                  <div>
                    <h2>Tema & Görünüm</h2>
                    <p>
                      Sitenin genel renk dilini ve köşe yumuşaklığını tek merkezden yönet.
                    </p>
                  </div>
                </div>

                <div className="themeGrid">
                  <ThemeColorField
                    label="Ana Renk"
                    name="theme_primary_color"
                    value={form.theme_primary_color}
                    onChange={handleChange}
                  />

                  <ThemeColorField
                    label="Vurgu / Altın"
                    name="theme_accent_color"
                    value={form.theme_accent_color}
                    onChange={handleChange}
                  />

                  <ThemeColorField
                    label="Sayfa Arka Planı"
                    name="theme_background_color"
                    value={form.theme_background_color}
                    onChange={handleChange}
                  />

                  <ThemeColorField
                    label="Kart / Açık Yüzey"
                    name="theme_surface_color"
                    value={form.theme_surface_color}
                    onChange={handleChange}
                  />

                  <ThemeColorField
                    label="Ana Metin"
                    name="theme_text_color"
                    value={form.theme_text_color}
                    onChange={handleChange}
                  />

                  <ThemeColorField
                    label="İkincil Metin"
                    name="theme_muted_text_color"
                    value={form.theme_muted_text_color}
                    onChange={handleChange}
                  />

                  <ThemeColorField
                    label="Çizgi / Border"
                    name="theme_border_color"
                    value={form.theme_border_color}
                    onChange={handleChange}
                  />

                  <div className="field">
                    <label>Köşe Yuvarlaklığı</label>
                    <div className="radiusControl">
                      <input
                        type="range"
                        min="0"
                        max="36"
                        step="1"
                        name="theme_radius"
                        value={form.theme_radius}
                        onChange={handleChange}
                      />
                      <strong>{form.theme_radius}px</strong>
                    </div>
                  </div>
                </div>

                <div
                  className="themePreview"
                  style={{
                    background: form.theme_background_color,
                    color: form.theme_text_color,
                    borderColor: form.theme_border_color,
                    borderRadius: `${form.theme_radius}px`,
                  }}
                >
                  <div
                    className="themePreviewBar"
                    style={{
                      background: form.theme_primary_color,
                      borderRadius: `${Math.max(form.theme_radius - 6, 4)}px`,
                    }}
                  >
                    <div>
                      <span>OK DENT</span>
                      <small>TEMA ÖNİZLEME</small>
                    </div>

                    <button
                      type="button"
                      style={{
                        background: form.theme_accent_color,
                        color: form.theme_primary_color,
                        borderRadius: `${Math.max(form.theme_radius - 8, 4)}px`,
                      }}
                    >
                      Randevu Al
                    </button>
                  </div>

                  <div
                    className="themePreviewCard"
                    style={{
                      background: form.theme_surface_color,
                      borderColor: form.theme_border_color,
                      borderRadius: `${Math.max(form.theme_radius - 4, 4)}px`,
                    }}
                  >
                    <span style={{ color: form.theme_accent_color }}>
                      MODERN DİŞ HEKİMLİĞİ
                    </span>
                    <strong>Sağlıklı bir gülüş, güvenle başlar.</strong>
                    <p style={{ color: form.theme_muted_text_color }}>
                      Buradaki renkler daha sonra Header, Footer ve tüm ziyaretçi
                      sayfalarına merkezi olarak bağlanacak.
                    </p>
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">07</span>

                  <div>
                    <h2>Site Durumu</h2>
                    <p>Genel site ayarlarının aktiflik durumu.</p>
                  </div>
                </div>

                <label className="switchRow">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={form.is_active}
                    onChange={handleChange}
                  />

                  <div>
                    <strong>
                      {form.is_active
                        ? "Site ayarları aktif"
                        : "Site ayarları pasif"}
                    </strong>

                    <span>
                      Şimdilik sadece veritabanında tutulur.
                    </span>
                  </div>
                </label>
              </section>

              <section className="statusCard">
                <span className="statusEyebrow">SİSTEM</span>

                <h3>Supabase Storage bağlı</h3>

                <p>
                  Logo dosyaları{" "}
                  <strong>site-assets / branding</strong>{" "}
                  klasörüne yüklenir.
                </p>

                <div className="statusItem">
                  <span>Bucket</span>
                  <b>site-assets</b>
                </div>

                <div className="statusItem">
                  <span>Logo</span>
                  <b>
                    {form.logo_url ? "Hazır ✓" : "Yüklenmedi"}
                  </b>
                </div>
              </section>

              <div className="saveBox">
                <div>
                  <strong>Değişiklikler hazır mı?</strong>

                  <span>
                    Kaydettiğinde site_settings tablosu güncellenir.
                  </span>
                </div>

                <button
                  className="saveButton"
                  type="submit"
                  disabled={saving || uploadingLogo}
                >
                  {saving
                    ? "Kaydediliyor..."
                    : "Tüm Ayarları Kaydet"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f8f6f2;
          color: #30302f;
          font-family: Arial, sans-serif;
        }

        .topbar {
          min-height: 84px;
          background: #30302f;
          color: white;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
        }

        .topLeft {
          display: flex;
          align-items: center;
          gap: 28px;
        }

        .back {
          border: 0;
          background: rgba(255, 255, 255, 0.08);
          color: white;
          padding: 11px 15px;
          border-radius: 10px;
          cursor: pointer;
        }

        .back:hover {
          background: rgba(255, 255, 255, 0.14);
        }

        .brand {
          display: flex;
          flex-direction: column;
        }

        .brand span {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .brand small {
          font-size: 10px;
          opacity: 0.55;
          letter-spacing: 2px;
          margin-top: 4px;
        }

        .siteButton {
          background: #c2a17b;
          color: #30302f;
          padding: 11px 17px;
          border-radius: 12px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 800;
        }

        .container {
          max-width: 1250px;
          margin: auto;
          padding: 44px 24px 90px;
        }

        .pageTitle {
          margin-bottom: 28px;
        }

        .label {
          color: #746f68;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.7px;
        }

        .pageTitle h1 {
          font-size: 39px;
          margin: 10px 0 8px;
          letter-spacing: -1.5px;
        }

        .pageTitle p {
          color: #746f68;
          line-height: 1.6;
          margin: 0;
        }

        .message {
          background: #eee2d3;
          color: #30302f;
          border: 1px solid #decdb8;
          padding: 14px 18px;
          border-radius: 12px;
          margin-bottom: 22px;
          font-size: 14px;
        }

        .layout {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }

        .card {
          background: white;
          border: 1px solid #e7dfd5;
          border-radius: 20px;
          padding: 27px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(18, 59, 52, 0.04);
        }

        .cardTitle {
          display: flex;
          gap: 14px;
          align-items: center;
          margin-bottom: 24px;
        }

        .cardIcon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          background: #eee2d3;
          color: #8a6846;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
        }

        .cardTitle h2 {
          margin: 0 0 4px;
          font-size: 20px;
        }

        .cardTitle p {
          margin: 0;
          color: #746f68;
          font-size: 12px;
          line-height: 1.5;
        }

        .field {
          margin-bottom: 18px;
        }

        .field label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        input,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #e7dfd5;
          border-radius: 11px;
          padding: 13px 14px;
          font-size: 14px;
          outline: none;
          background: #fbfcfc;
          color: #30302f;
        }

        input:focus,
        textarea:focus {
          border-color: #c2a17b;
          background: white;
        }

        textarea {
          resize: vertical;
          font-family: inherit;
        }

        .grid2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .uploadArea {
          border: 2px dashed #e7dfd5;
          background: #faf8f5;
          border-radius: 16px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          transition: 0.2s ease;
        }

        .uploadArea:hover {
          border-color: #c2a17b;
          background: #f1f8f5;
        }

        .uploadIcon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 12px;
          background: #eee2d3;
          color: #8a6846;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          font-weight: 900;
        }

        .uploadText {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .uploadText strong {
          font-size: 14px;
          color: #30302f;
        }

        .uploadText span {
          font-size: 11px;
          color: #746f68;
          line-height: 1.4;
        }

        .uploadButton {
          background: #30302f;
          color: white;
          padding: 11px 15px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .uploadButton.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .currentFile {
          margin-top: 12px;
          background: #faf8f5;
          border: 1px solid #e7dfd5;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          font-size: 12px;
        }

        .currentFile > span {
          color: #8a6846;
          font-weight: 700;
        }

        .fileActions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .currentFile a {
          color: #746f68;
          text-decoration: none;
          font-weight: 700;
        }

        .removeButton {
          border: 0;
          background: #fbe8e8;
          color: #9a3434;
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .logoPreview {
          margin-top: 14px;
          background: #f5f8f7;
          border: 1px dashed #cedbd6;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .logoPreview > span {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: #746f68;
        }

        .logoPreviewBox {
          min-height: 110px;
          border-radius: 12px;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .logoPreview img {
          max-width: 240px;
          max-height: 100px;
          object-fit: contain;
        }

        .emptyLogo {
          margin-top: 12px;
          background: #faf8f5;
          border: 1px solid #e7dfd5;
          color: #817970;
          padding: 14px;
          border-radius: 11px;
          font-size: 12px;
        }

        .headerPreview {
          background: #30302f;
          border-radius: 14px;
          padding: 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: white;
        }

        .miniBrand {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .miniBrand img {
          width: 42px;
          height: 42px;
          object-fit: contain;
          border-radius: 8px;
        }

        .miniLogo {
          width: 38px;
          height: 38px;
          background: #c2a17b;
          color: #30302f;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 900;
        }

        .miniBrandText {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .miniBrandText strong {
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .miniBrandText small {
          font-size: 9px;
          opacity: 0.6;
          margin-top: 3px;
        }

        .previewButton {
          background: #c2a17b;
          color: #30302f;
          padding: 9px 11px;
          border-radius: 9px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .footerPreview {
          background: #f3f7f5;
          border-radius: 14px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .footerPreview strong {
          font-size: 17px;
        }

        .footerPreview > span {
          color: #746f68;
          font-size: 13px;
        }

        .footerDetails {
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid #dfe7e4;
          color: #746f68;
        }

        .themeGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 16px;
        }

        .radiusControl {
          min-height: 48px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid #e3ded7;
          border-radius: 12px;
          background: #fbfaf8;
          padding: 0 13px;
        }

        .radiusControl input[type="range"] {
          flex: 1;
          width: auto;
          padding: 0;
          border: 0;
          background: transparent;
          accent-color: #c2a17b;
        }

        .radiusControl strong {
          min-width: 42px;
          font-size: 12px;
          text-align: right;
          color: #30302f;
        }

        .themePreview {
          margin-top: 8px;
          border: 1px solid;
          padding: 14px;
          transition: 0.2s ease;
        }

        .themePreviewBar {
          min-height: 66px;
          padding: 13px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          color: white;
        }

        .themePreviewBar > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .themePreviewBar span {
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.6px;
        }

        .themePreviewBar small {
          font-size: 8px;
          opacity: 0.65;
          letter-spacing: 1.5px;
        }

        .themePreviewBar button {
          border: 0;
          padding: 10px 13px;
          font-weight: 900;
          font-size: 11px;
        }

        .themePreviewCard {
          margin-top: 12px;
          border: 1px solid;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .themePreviewCard > span {
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .themePreviewCard strong {
          font-size: 17px;
        }

        .themePreviewCard p {
          margin: 0;
          font-size: 11px;
          line-height: 1.55;
        }

        .switchRow {
          background: #faf8f5;
          border-radius: 14px;
          padding: 17px;
          display: flex;
          align-items: center;
          gap: 13px;
          cursor: pointer;
        }

        .switchRow input {
          width: auto;
        }

        .switchRow div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .switchRow strong {
          font-size: 14px;
        }

        .switchRow span {
          color: #746f68;
          font-size: 12px;
        }

        .statusCard {
          background: #f8f4ef;
          border: 1px solid #e7dfd5;
          padding: 22px;
          border-radius: 18px;
          margin-bottom: 24px;
        }

        .statusEyebrow {
          color: #746f68;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .statusCard h3 {
          margin: 8px 0 7px;
          font-size: 18px;
        }

        .statusCard p {
          margin: 0 0 18px;
          color: #746f68;
          font-size: 12px;
          line-height: 1.6;
        }

        .statusItem {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 10px 0;
          border-top: 1px solid #e7dfd5;
          font-size: 12px;
        }

        .statusItem span {
          color: #746f68;
        }

        .saveBox {
          background: #30302f;
          color: white;
          padding: 22px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .saveBox > div {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .saveBox strong {
          font-size: 15px;
        }

        .saveBox span {
          color: #b9d0c9;
          font-size: 11px;
        }

        .saveButton {
          border: 0;
          background: #c2a17b;
          color: #30302f;
          padding: 13px 16px;
          border-radius: 11px;
          cursor: pointer;
          font-weight: 900;
          white-space: nowrap;
        }

        .saveButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .layout,
          .grid2,
          .themeGrid {
            grid-template-columns: 1fr;
          }

          .topbar {
            padding: 0 20px;
          }

          .siteButton {
            display: none;
          }

          .saveBox {
            flex-direction: column;
            align-items: stretch;
          }

          .uploadArea {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 600px) {
          .topLeft {
            gap: 12px;
          }

          .brand {
            display: none;
          }

          .container {
            padding: 30px 15px 70px;
          }

          .pageTitle h1 {
            font-size: 31px;
          }

          .card {
            padding: 20px;
          }

          .uploadButton {
            width: 100%;
            text-align: center;
          }

          .currentFile {
            align-items: flex-start;
            flex-direction: column;
          }

          .fileActions {
            width: 100%;
            justify-content: space-between;
          }

          .headerPreview {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}

function ThemeColorField({ label, name, value, onChange }) {
  return (
    <div className="themeField">
      <label>{label}</label>

      <div className="themeInputRow">
        <input
          className="colorPicker"
          type="color"
          name={name}
          value={value || "#000000"}
          onChange={onChange}
          aria-label={`${label} renk seçici`}
        />

        <input
          className="hexInput"
          type="text"
          name={name}
          value={value}
          onChange={onChange}
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      <style jsx>{`
        .themeField {
          margin-bottom: 4px;
        }

        label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .themeInputRow {
          display: grid;
          grid-template-columns: 48px 1fr;
          gap: 9px;
          align-items: center;
        }

        .colorPicker {
          width: 48px;
          height: 48px;
          padding: 4px;
          border: 1px solid #e3ded7;
          border-radius: 11px;
          background: #fff;
          cursor: pointer;
        }

        .hexInput {
          width: 100%;
          height: 48px;
          box-sizing: border-box;
          border: 1px solid #e3ded7;
          border-radius: 11px;
          padding: 0 13px;
          background: #fbfaf8;
          color: #30302f;
          font-size: 13px;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            monospace;
          outline: none;
        }

        .hexInput:focus {
          border-color: #c2a17b;
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder = "",
  type = "text",
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />

      <style jsx>{`
        .field {
          margin-bottom: 18px;
        }

        label {
          display: block;
          font-size: 13px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #e7dfd5;
          border-radius: 11px;
          padding: 13px 14px;
          font-size: 14px;
          outline: none;
          background: #fbfcfc;
          color: #30302f;
        }

        input:focus {
          border-color: #c2a17b;
          background: white;
        }
      `}</style>
    </div>
  );
}