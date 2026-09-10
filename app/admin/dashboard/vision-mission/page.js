"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabaseClient";

const emptyForm = {
  eyebrow: "",
  title: "",
  description: "",
  vision_title: "",
  vision_text: "",
  mission_title: "",
  mission_text: "",
  principle_1_title: "",
  principle_1_text: "",
  principle_2_title: "",
  principle_2_text: "",
  principle_3_title: "",
  principle_3_text: "",
  principle_4_title: "",
  principle_4_text: "",
  image_url: "",
  cta_title: "",
  cta_text: "",
  cta_button_text: "",
  cta_button_link: "/randevu",
  cta_button_arrow_text: "→",
  breadcrumb_home_text: "Ana Sayfa",
  breadcrumb_corporate_text: "Kurumsal",
  breadcrumb_current_text: "Vizyon & Misyon",
  vision_label: "GELECEĞE BAKIŞIMIZ",
  vision_icon_text: "V",
  mission_label: "BUGÜNKÜ SORUMLULUĞUMUZ",
  mission_icon_text: "M",
  image_alt_text: "OK Dent Vizyon ve Misyon",
  image_placeholder_mark: "OK",
  image_placeholder_title: "Sağlıklı Gülüşler",
  image_placeholder_text: "Güvenilir • Modern • Kişiye Özel",
  image_overlay_eyebrow: "OK DENT",
  image_overlay_title: "Her gülüşe özen, her hastaya güven.",
  principles_eyebrow: "ÇALIŞMA PRENSİPLERİMİZ",
  principles_title: "Temel İlkelerimiz",
  principles_description: "OK Dent'te sunduğumuz hizmetin temelini oluşturan değerler.",
  principle_fallback_title: "Temel İlkemiz",
  principle_fallback_text: "OK Dent hizmet anlayışının temel ilkelerinden biri.",
  brand_eyebrow: "OK DENT YAKLAŞIMI",
  brand_title: "Sadece tedavi değil, güven veren bir deneyim.",
  brand_point_1_text: "Hastalarımızı dinler, ihtiyaçlarını doğru anlamaya önem veririz.",
  brand_point_2_text: "Tedavi seçeneklerini anlaşılır ve şeffaf biçimde değerlendiririz.",
  brand_point_3_text: "Hasta konforunu tedavi sürecinin her aşamasında ön planda tutarız.",
  cta_eyebrow: "SAĞLIKLI GÜLÜŞLER İÇİN",
  whatsapp_button_text: "WhatsApp",
  hidden_brand_text: "OK DENT",
  hidden_title: "Bu sayfa şu anda yayında değil.",
  hidden_description: "Vizyon & Misyon içeriğimizi kısa süre içinde tekrar görüntüleyebilirsiniz.",
  hidden_button_text: "Ana Sayfaya Dön",
  hidden_button_link: "/",
  loading_text: "Sayfa yükleniyor...",
  is_active: true,
};

export default function VisionMissionAdminPage() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadContent();
  }, []);

  async function loadContent() {
    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { data, error } = await supabase
      .from("vision_mission_page")
      .select("*")
      .eq("section_key", "main")
      .single();

    if (error) {
      console.error(error);
      setMessage("Vizyon & Misyon içeriği yüklenemedi.");
    } else if (data) {
      setForm({ ...emptyForm, ...data });
    }

    setLoading(false);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      setMessage("Sadece JPG, PNG veya WEBP yükleyebilirsin.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Görsel en fazla 8 MB olabilir.");
      return;
    }

    setUploading(true);
    setMessage("");

    const supabase = createClient();

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const filePath =
        `vision-mission/vision-mission-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        image_url: data.publicUrl,
      }));

      setMessage(
        "Görsel yüklendi. Kalıcı olması için Değişiklikleri Kaydet'e bas."
      );
    } catch (error) {
      console.error(error);
      setMessage("Görsel yüklenirken hata oluştu.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function cleanText(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  async function handleSave(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("vision_mission_page")
      .update({
        eyebrow: cleanText(form.eyebrow),
        title: cleanText(form.title),
        description: cleanText(form.description),

        vision_title: cleanText(form.vision_title),
        vision_text: cleanText(form.vision_text),

        mission_title: cleanText(form.mission_title),
        mission_text: cleanText(form.mission_text),

        principle_1_title: cleanText(form.principle_1_title),
        principle_1_text: cleanText(form.principle_1_text),

        principle_2_title: cleanText(form.principle_2_title),
        principle_2_text: cleanText(form.principle_2_text),

        principle_3_title: cleanText(form.principle_3_title),
        principle_3_text: cleanText(form.principle_3_text),

        principle_4_title: cleanText(form.principle_4_title),
        principle_4_text: cleanText(form.principle_4_text),

        image_url: cleanText(form.image_url) || null,

        cta_title: cleanText(form.cta_title),
        cta_text: cleanText(form.cta_text),
        cta_button_text: cleanText(form.cta_button_text),
        cta_button_link: cleanText(form.cta_button_link),
        cta_button_arrow_text: cleanText(form.cta_button_arrow_text),

        breadcrumb_home_text: cleanText(form.breadcrumb_home_text),
        breadcrumb_corporate_text: cleanText(form.breadcrumb_corporate_text),
        breadcrumb_current_text: cleanText(form.breadcrumb_current_text),
        vision_label: cleanText(form.vision_label),
        vision_icon_text: cleanText(form.vision_icon_text),
        mission_label: cleanText(form.mission_label),
        mission_icon_text: cleanText(form.mission_icon_text),
        image_alt_text: cleanText(form.image_alt_text),
        image_placeholder_mark: cleanText(form.image_placeholder_mark),
        image_placeholder_title: cleanText(form.image_placeholder_title),
        image_placeholder_text: cleanText(form.image_placeholder_text),
        image_overlay_eyebrow: cleanText(form.image_overlay_eyebrow),
        image_overlay_title: cleanText(form.image_overlay_title),
        principles_eyebrow: cleanText(form.principles_eyebrow),
        principles_title: cleanText(form.principles_title),
        principles_description: cleanText(form.principles_description),
        principle_fallback_title: cleanText(form.principle_fallback_title),
        principle_fallback_text: cleanText(form.principle_fallback_text),
        brand_eyebrow: cleanText(form.brand_eyebrow),
        brand_title: cleanText(form.brand_title),
        brand_point_1_text: cleanText(form.brand_point_1_text),
        brand_point_2_text: cleanText(form.brand_point_2_text),
        brand_point_3_text: cleanText(form.brand_point_3_text),
        cta_eyebrow: cleanText(form.cta_eyebrow),
        whatsapp_button_text: cleanText(form.whatsapp_button_text),
        hidden_brand_text: cleanText(form.hidden_brand_text),
        hidden_title: cleanText(form.hidden_title),
        hidden_description: cleanText(form.hidden_description),
        hidden_button_text: cleanText(form.hidden_button_text),
        hidden_button_link: cleanText(form.hidden_button_link),
        loading_text: cleanText(form.loading_text),

        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("section_key", "main");

    if (error) {
      console.error(error);
      setMessage("Kaydetme sırasında hata oluştu.");
    } else {
      setMessage("Vizyon & Misyon başarıyla kaydedildi.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loader"></div>
        <p>Vizyon & Misyon yükleniyor...</p>

        <style jsx>{`
          .loading {
            min-height: 100vh;
            display: grid;
            place-items: center;
            align-content: center;
            gap: 15px;
            background: #f8f6f2;
            color: #30302f;
            font-family: Arial, sans-serif;
          }

          .loader {
            width: 35px;
            height: 35px;
            border: 3px solid #e5dbcf;
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
      </div>
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
            OK DENT / KURUMSAL
          </span>

          <h1>Vizyon & Misyon</h1>

          <p className="intro">
            Kurumsal vizyon, misyon, temel ilkeler ve sayfa
            görselini buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="topActions">
          <a
            href="/kurumsal/vizyon-misyon"
            target="_blank"
            rel="noreferrer"
            className="previewButton"
          >
            Sayfayı Gör ↗
          </a>

          <button
            type="button"
            className="saveTop"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </div>

      {message && <div className="message">{message}</div>}

      <form onSubmit={handleSave}>
        <div className="layout">
          <div className="content">
            <Section
              number="01"
              title="Sayfa Girişi"
              text="Sayfanın üst bölümünde ziyaretçilere gösterilecek ana içerik."
            >
              <Field label="Üst Küçük Başlık">
                <input
                  name="eyebrow"
                  value={form.eyebrow}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Ana Başlık">
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Açıklama">
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                />
              </Field>
            </Section>

            <Section
              number="02"
              title="Vizyonumuz"
              text="OK Dent'in geleceğe yönelik hedef ve bakış açısı."
            >
              <Field label="Vizyon Başlığı">
                <input
                  name="vision_title"
                  value={form.vision_title}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Vizyon Metni">
                <textarea
                  name="vision_text"
                  value={form.vision_text}
                  onChange={handleChange}
                  rows="7"
                />
              </Field>
            </Section>

            <Section
              number="03"
              title="Misyonumuz"
              text="Kliniğin hizmet anlayışı ve temel amacı."
            >
              <Field label="Misyon Başlığı">
                <input
                  name="mission_title"
                  value={form.mission_title}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Misyon Metni">
                <textarea
                  name="mission_text"
                  value={form.mission_text}
                  onChange={handleChange}
                  rows="7"
                />
              </Field>
            </Section>

            <Section
              number="04"
              title="Temel İlkelerimiz"
              text="Ziyaretçi sayfasında dört ayrı kurumsal ilke olarak gösterilecek."
            >
              <div className="principleGrid">
                {[1, 2, 3, 4].map((number) => (
                  <div className="principleEditor" key={number}>
                    <span className="principleNumber">
                      0{number}
                    </span>

                    <Field label="Başlık">
                      <input
                        name={`principle_${number}_title`}
                        value={
                          form[`principle_${number}_title`]
                        }
                        onChange={handleChange}
                      />
                    </Field>

                    <Field label="Açıklama">
                      <textarea
                        name={`principle_${number}_text`}
                        value={
                          form[`principle_${number}_text`]
                        }
                        onChange={handleChange}
                        rows="5"
                      />
                    </Field>
                  </div>
                ))}
              </div>
            </Section>

            <Section
              number="05"
              title="Sayfa Görseli"
              text="Vizyon & Misyon ziyaretçi sayfasında kullanılacak kurumsal görsel."
            >
              <div className="uploadBox">
                {form.image_url ? (
                  <img src={form.image_url} alt="Vizyon ve Misyon" />
                ) : (
                  <div className="emptyImage">
                    <span>＋</span>
                    <strong>Henüz görsel yüklenmedi</strong>
                    <small>JPG, PNG veya WEBP • Maksimum 8 MB</small>
                  </div>
                )}

                <div className="uploadActions">
                  <label className="uploadButton">
                    {uploading ? "Yükleniyor..." : "Görsel Yükle"}

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploading}
                    />
                  </label>

                  {form.image_url && (
                    <>
                      <a
                        href={form.image_url}
                        target="_blank"
                        rel="noreferrer"
                        className="openButton"
                      >
                        Görseli Aç
                      </a>

                      <button
                        type="button"
                        className="removeButton"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            image_url: "",
                          }))
                        }
                      >
                        Görseli Kaldır
                      </button>
                    </>
                  )}
                </div>
              </div>
            </Section>

            <Section
              number="06"
              title="Sayfa Detayları / Mikro Metinler"
              text="Ziyaretçi sayfasında sabit kalan küçük yazıları buradan yönetebilirsiniz."
            >
              <Field label="Breadcrumb — Ana Sayfa">
                <input name="breadcrumb_home_text" value={form.breadcrumb_home_text} onChange={handleChange} />
              </Field>

              <Field label="Breadcrumb — Kurumsal">
                <input name="breadcrumb_corporate_text" value={form.breadcrumb_corporate_text} onChange={handleChange} />
              </Field>

              <Field label="Breadcrumb — Vizyon & Misyon">
                <input name="breadcrumb_current_text" value={form.breadcrumb_current_text} onChange={handleChange} />
              </Field>

              <Field label="Vizyon Kartı Üst Etiketi">
                <input name="vision_label" value={form.vision_label} onChange={handleChange} />
              </Field>

              <Field label="Vizyon İkon Harfi">
                <input name="vision_icon_text" value={form.vision_icon_text} onChange={handleChange} />
              </Field>

              <Field label="Misyon Kartı Üst Etiketi">
                <input name="mission_label" value={form.mission_label} onChange={handleChange} />
              </Field>

              <Field label="Misyon İkon Harfi">
                <input name="mission_icon_text" value={form.mission_icon_text} onChange={handleChange} />
              </Field>

              <Field label="Görsel Alt Metni">
                <input name="image_alt_text" value={form.image_alt_text} onChange={handleChange} />
              </Field>

              <Field label="Görsel Yoksa İşaret">
                <input name="image_placeholder_mark" value={form.image_placeholder_mark} onChange={handleChange} />
              </Field>

              <Field label="Görsel Yoksa Başlık">
                <input name="image_placeholder_title" value={form.image_placeholder_title} onChange={handleChange} />
              </Field>

              <Field label="Görsel Yoksa Açıklama">
                <textarea name="image_placeholder_text" value={form.image_placeholder_text} onChange={handleChange} rows="3" />
              </Field>

              <Field label="Görsel Üzeri Küçük Başlık">
                <input name="image_overlay_eyebrow" value={form.image_overlay_eyebrow} onChange={handleChange} />
              </Field>

              <Field label="Görsel Üzeri Ana Başlık">
                <textarea name="image_overlay_title" value={form.image_overlay_title} onChange={handleChange} rows="3" />
              </Field>

              <Field label="İlkeler Küçük Başlığı">
                <input name="principles_eyebrow" value={form.principles_eyebrow} onChange={handleChange} />
              </Field>

              <Field label="İlkeler Ana Başlığı">
                <input name="principles_title" value={form.principles_title} onChange={handleChange} />
              </Field>

              <Field label="İlkeler Açıklaması">
                <textarea name="principles_description" value={form.principles_description} onChange={handleChange} rows="3" />
              </Field>

              <Field label="İlke Varsayılan Başlığı">
                <input name="principle_fallback_title" value={form.principle_fallback_title} onChange={handleChange} />
              </Field>

              <Field label="İlke Varsayılan Açıklaması">
                <textarea name="principle_fallback_text" value={form.principle_fallback_text} onChange={handleChange} rows="3" />
              </Field>

              <Field label="Koyu Bölüm Küçük Başlığı">
                <input name="brand_eyebrow" value={form.brand_eyebrow} onChange={handleChange} />
              </Field>

              <Field label="Koyu Bölüm Ana Başlığı">
                <textarea name="brand_title" value={form.brand_title} onChange={handleChange} rows="3" />
              </Field>

              <Field label="Koyu Bölüm 1. Madde">
                <textarea name="brand_point_1_text" value={form.brand_point_1_text} onChange={handleChange} rows="3" />
              </Field>

              <Field label="Koyu Bölüm 2. Madde">
                <textarea name="brand_point_2_text" value={form.brand_point_2_text} onChange={handleChange} rows="3" />
              </Field>

              <Field label="Koyu Bölüm 3. Madde">
                <textarea name="brand_point_3_text" value={form.brand_point_3_text} onChange={handleChange} rows="3" />
              </Field>

              <Field label="CTA Küçük Başlığı">
                <input name="cta_eyebrow" value={form.cta_eyebrow} onChange={handleChange} />
              </Field>

              <Field label="WhatsApp Buton Yazısı">
                <input name="whatsapp_button_text" value={form.whatsapp_button_text} onChange={handleChange} />
              </Field>

              <Field label="Gizli Sayfa Marka Yazısı">
                <input name="hidden_brand_text" value={form.hidden_brand_text} onChange={handleChange} />
              </Field>

              <Field label="Gizli Sayfa Başlığı">
                <input name="hidden_title" value={form.hidden_title} onChange={handleChange} />
              </Field>

              <Field label="Gizli Sayfa Açıklaması">
                <textarea name="hidden_description" value={form.hidden_description} onChange={handleChange} rows="3" />
              </Field>

              <Field label="Gizli Sayfa Buton Yazısı">
                <input name="hidden_button_text" value={form.hidden_button_text} onChange={handleChange} />
              </Field>

              <Field label="Gizli Sayfa Buton Linki">
                <input name="hidden_button_link" value={form.hidden_button_link} onChange={handleChange} />
              </Field>

              <Field label="Yükleniyor Yazısı">
                <input name="loading_text" value={form.loading_text} onChange={handleChange} />
              </Field>
            </Section>

            <Section
              number="07"
              title="Alt Randevu Alanı"
              text="Sayfanın sonunda ziyaretçiyi randevu sayfasına yönlendiren alan."
            >
              <Field label="Başlık">
                <input
                  name="cta_title"
                  value={form.cta_title}
                  onChange={handleChange}
                />
              </Field>

              <Field label="Açıklama">
                <textarea
                  name="cta_text"
                  value={form.cta_text}
                  onChange={handleChange}
                  rows="4"
                />
              </Field>

              <div className="twoColumns">
                <Field label="Buton Yazısı">
                  <input
                    name="cta_button_text"
                    value={form.cta_button_text}
                    onChange={handleChange}
                  />
                </Field>

                <Field label="Buton Bağlantısı">
                  <input
                    name="cta_button_link"
                    value={form.cta_button_link}
                    onChange={handleChange}
                  />
                </Field>
              </div>
            </Section>
          </div>

          <aside>
            <div className="sidePanel">
              <span className="eyebrow">YAYIN DURUMU</span>
              <h2>Sayfa Ayarları</h2>

              <label className="switchRow">
                <div>
                  <strong>Vizyon & Misyon Sayfası</strong>
                  <small>Ziyaretçilere göster / gizle</small>
                </div>

                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
              </label>

              <div
                className={
                  form.is_active
                    ? "status published"
                    : "status hidden"
                }
              >
                <i></i>
                {form.is_active
                  ? "Sayfa yayında"
                  : "Sayfa gizli"}
              </div>

              <div className="divider"></div>

              <span className="eyebrow">CANLI ÖNİZLEME</span>

              <div className="preview">
                <small>{form.eyebrow || "OK DENT"}</small>

                <h3>
                  {form.title || "Vizyon & Misyon"}
                </h3>

                <p>
                  {form.description ||
                    "Sayfa açıklaması burada görüntülenecek."}
                </p>

                {form.image_url && (
                  <img src={form.image_url} alt="" />
                )}

                <div className="previewVM">
                  <div>
                    <span>V</span>
                    <strong>
                      {form.vision_title || "Vizyonumuz"}
                    </strong>
                  </div>

                  <div>
                    <span>M</span>
                    <strong>
                      {form.mission_title || "Misyonumuz"}
                    </strong>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="saveSide"
                disabled={saving || uploading}
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
          border: 1px solid #dec9ae;
          border-radius: 10px;
          background: #f2e9dd;
          color: #765b3f;
          font-size: 12px;
          font-weight: 700;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 330px;
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

        .principleGrid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .principleEditor {
          padding: 17px;
          background: #faf8f5;
          border: 1px solid #eee6dc;
          border-radius: 13px;
        }

        .principleNumber {
          display: block;
          margin-bottom: 14px;
          color: #b1906b;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .uploadBox {
          padding: 13px;
          background: #faf8f5;
          border: 1px dashed #d7c8b7;
          border-radius: 14px;
        }

        .uploadBox > img {
          width: 100%;
          height: 380px;
          display: block;
          object-fit: cover;
          border-radius: 11px;
        }

        .emptyImage {
          height: 240px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          gap: 7px;
          color: #91877e;
        }

        .emptyImage > span {
          color: #c2a17b;
          font-size: 30px;
        }

        .emptyImage strong {
          font-size: 12px;
        }

        .emptyImage small {
          font-size: 9px;
        }

        .uploadActions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 11px;
        }

        .uploadButton,
        .openButton,
        .removeButton {
          padding: 9px 12px;
          border-radius: 8px;
          font-size: 9px;
          font-weight: 800;
          text-decoration: none;
          cursor: pointer;
        }

        .uploadButton {
          background: #30302f;
          color: white;
        }

        .uploadButton input {
          display: none;
        }

        .openButton {
          background: white;
          color: #30302f;
          border: 1px solid #ded7cf;
        }

        .removeButton {
          background: #fff7f5;
          color: #a25143;
          border: 1px solid #e6c8c2;
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
          font-size: 17px;
        }

        .switchRow {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 15px;
          background: #faf8f5;
          border: 1px solid #eee6dc;
          border-radius: 12px;
        }

        .switchRow strong {
          display: block;
          font-size: 11px;
        }

        .switchRow small {
          display: block;
          margin-top: 4px;
          color: #938980;
          font-size: 8px;
        }

        .switchRow input {
          width: 18px;
          height: 18px;
          accent-color: #c2a17b;
        }

        .status {
          margin-top: 10px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          gap: 7px;
          border-radius: 9px;
          font-size: 9px;
          font-weight: 800;
        }

        .status i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .published {
          background: #edf5ef;
          color: #52705b;
        }

        .published i {
          background: #5d8b6b;
        }

        .hidden {
          background: #f4eeee;
          color: #9a6059;
        }

        .hidden i {
          background: #a9675d;
        }

        .divider {
          height: 1px;
          margin: 24px 0;
          background: #eee8e0;
        }

        .preview {
          margin-top: 12px;
          padding: 18px;
          background: #30302f;
          color: white;
          border-radius: 13px;
        }

        .preview > small {
          color: #c6a47d;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .preview h3 {
          margin: 8px 0;
          font-size: 18px;
          line-height: 1.2;
        }

        .preview > p {
          margin: 0;
          color: #bcb4ac;
          font-size: 9px;
          line-height: 1.6;
        }

        .preview > img {
          width: 100%;
          height: 130px;
          margin-top: 13px;
          object-fit: cover;
          border-radius: 9px;
        }

        .previewVM {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px;
          margin-top: 13px;
        }

        .previewVM div {
          padding: 9px;
          background: rgba(198, 164, 125, 0.1);
          border-radius: 8px;
        }

        .previewVM span {
          display: block;
          color: #c6a47d;
          font-size: 7px;
          font-weight: 900;
        }

        .previewVM strong {
          display: block;
          margin-top: 4px;
          font-size: 8px;
        }

        .saveSide {
          width: 100%;
          margin-top: 18px;
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
          .principleGrid,
          .twoColumns {
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
          transition: 0.2s;
        }

        .field :global(textarea) {
          resize: vertical;
          line-height: 1.7;
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