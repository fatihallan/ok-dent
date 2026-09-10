"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../../lib/supabaseClient";

const emptyForm = {
  eyebrow: "",
  title: "",
  description: "",
  story_title: "",
  story_text: "",
  image_url: "",
  value_1_title: "",
  value_1_text: "",
  value_2_title: "",
  value_2_text: "",
  value_3_title: "",
  value_3_text: "",
  cta_title: "",
  cta_text: "",
  cta_button_text: "",
  cta_button_link: "/randevu",
  cta_button_arrow_text: "→",
  breadcrumb_home_text: "Ana Sayfa",
  breadcrumb_corporate_text: "Kurumsal",
  breadcrumb_current_text: "Hakkımızda",
  hero_badge_mark: "OK",
  hero_badge_title: "Modern Diş Hekimliği",
  hero_badge_text: "Güven • Konfor • Kişiye Özel Yaklaşım",
  image_placeholder_mark: "OK",
  image_placeholder_title: "OK Dent",
  image_placeholder_text: "Ağız ve Diş Sağlığı Polikliniği",
  image_card_title: "Kişiye Özel",
  image_card_text: "Tedavi Yaklaşımı",
  story_eyebrow: "BİZ KİMİZ?",
  story_note: "Her hastanın ihtiyaçları farklıdır. Bu nedenle tedavi sürecini kişiye özel planlıyor, sürecin her aşamasında açık iletişimi önemsiyoruz.",
  values_eyebrow: "BİZİM İÇİN ÖNEMLİ",
  values_title: "Değerlerimiz",
  values_description: "Tedavi anlayışımızın merkezinde güven, kişiye özel yaklaşım ve modern diş hekimliği bulunur.",
  principles_eyebrow: "OK DENT YAKLAŞIMI",
  principles_title: "Sağlıklı gülüşlerin ardında güvenli bir süreç vardır.",
  principle_1_title: "Dinliyoruz",
  principle_1_text: "İhtiyaçlarınızı ve beklentilerinizi değerlendiriyoruz.",
  principle_2_title: "Planlıyoruz",
  principle_2_text: "Size uygun tedavi seçeneklerini birlikte değerlendiriyoruz.",
  principle_3_title: "Takip Ediyoruz",
  principle_3_text: "Tedavi sonrasında da ağız ve diş sağlığınızı önemsiyoruz.",
  cta_eyebrow: "OK DENT",
  whatsapp_button_text: "WhatsApp",
  hidden_brand_text: "OK DENT",
  hidden_title: "Bu sayfa şu anda yayında değil.",
  hidden_description: "Kurumsal içeriklerimizi kısa süre içinde tekrar görüntüleyebilirsiniz.",
  hidden_button_text: "Ana Sayfaya Dön",
  hidden_button_link: "/",
  loading_text: "Sayfa yükleniyor...",
  is_active: true,
};

export default function AboutAdminPage() {
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

    const supabase = createClient();

    const { data, error } = await supabase
      .from("about_page")
      .select("*")
      .eq("section_key", "main")
      .single();

    if (error) {
      console.error(error);
      setMessage("İçerik yüklenemedi.");
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
        `about/about-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      setForm((prev) => ({
        ...prev,
        image_url: data.publicUrl,
      }));

      setMessage(
        "Görsel yüklendi. Değişikliği kalıcı yapmak için Kaydet'e bas."
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
      .from("about_page")
      .update({
        eyebrow: cleanText(form.eyebrow),
        title: cleanText(form.title),
        description: cleanText(form.description),
        story_title: cleanText(form.story_title),
        story_text: cleanText(form.story_text),
        image_url: cleanText(form.image_url) || null,

        value_1_title: cleanText(form.value_1_title),
        value_1_text: cleanText(form.value_1_text),

        value_2_title: cleanText(form.value_2_title),
        value_2_text: cleanText(form.value_2_text),

        value_3_title: cleanText(form.value_3_title),
        value_3_text: cleanText(form.value_3_text),

        cta_title: cleanText(form.cta_title),
        cta_text: cleanText(form.cta_text),
        cta_button_text: cleanText(form.cta_button_text),
        cta_button_link: cleanText(form.cta_button_link),
        cta_button_arrow_text: cleanText(form.cta_button_arrow_text),

        breadcrumb_home_text: cleanText(form.breadcrumb_home_text),
        breadcrumb_corporate_text: cleanText(form.breadcrumb_corporate_text),
        breadcrumb_current_text: cleanText(form.breadcrumb_current_text),
        hero_badge_mark: cleanText(form.hero_badge_mark),
        hero_badge_title: cleanText(form.hero_badge_title),
        hero_badge_text: cleanText(form.hero_badge_text),
        image_placeholder_mark: cleanText(form.image_placeholder_mark),
        image_placeholder_title: cleanText(form.image_placeholder_title),
        image_placeholder_text: cleanText(form.image_placeholder_text),
        image_card_title: cleanText(form.image_card_title),
        image_card_text: cleanText(form.image_card_text),
        story_eyebrow: cleanText(form.story_eyebrow),
        story_note: cleanText(form.story_note),
        values_eyebrow: cleanText(form.values_eyebrow),
        values_title: cleanText(form.values_title),
        values_description: cleanText(form.values_description),
        principles_eyebrow: cleanText(form.principles_eyebrow),
        principles_title: cleanText(form.principles_title),
        principle_1_title: cleanText(form.principle_1_title),
        principle_1_text: cleanText(form.principle_1_text),
        principle_2_title: cleanText(form.principle_2_title),
        principle_2_text: cleanText(form.principle_2_text),
        principle_3_title: cleanText(form.principle_3_title),
        principle_3_text: cleanText(form.principle_3_text),
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
      setMessage("Hakkımızda sayfası başarıyla kaydedildi.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <div className="loadingScreen">
        <div className="loader"></div>
        <p>Hakkımızda içeriği yükleniyor...</p>

        <style jsx>{`
          .loadingScreen {
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
            width: 34px;
            height: 34px;
            border: 3px solid #e4d8ca;
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
    <div className="page">
      <header className="topbar">
        <div>
          <a href="/admin/dashboard" className="back">
            ← Yönetim Paneli
          </a>

          <span className="eyebrow">
            OK DENT / KURUMSAL
          </span>

          <h1>Hakkımızda</h1>

          <p>
            Hakkımızda sayfasında ziyaretçilerin göreceği
            içerikleri buradan yönetebilirsiniz.
          </p>
        </div>

        <div className="topActions">
          <a
            href="/kurumsal/hakkimizda"
            target="_blank"
            rel="noreferrer"
            className="previewButton"
          >
            Sayfayı Gör ↗
          </a>

          <button
            className="saveTop"
            onClick={handleSave}
            disabled={saving || uploading}
          >
            {saving ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
          </button>
        </div>
      </header>

      {message && (
        <div className="message">
          {message}
        </div>
      )}

      <form onSubmit={handleSave}>
        <div className="layout">
          <div className="mainColumn">
            <section className="panel">
              <div className="panelHeading">
                <div className="number">01</div>

                <div>
                  <h2>Sayfa Girişi</h2>
                  <p>
                    Hakkımızda sayfasının üst bölümündeki
                    başlık ve açıklama.
                  </p>
                </div>
              </div>

              <div className="field">
                <label>Üst Küçük Başlık</label>

                <input
                  name="eyebrow"
                  value={form.eyebrow}
                  onChange={handleChange}
                  placeholder="Örn: OK DENT"
                />
              </div>

              <div className="field">
                <label>Ana Başlık</label>

                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Açıklama</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>
            </section>

            <section className="panel">
              <div className="panelHeading">
                <div className="number">02</div>

                <div>
                  <h2>Hikâyemiz / Klinik Tanıtımı</h2>
                  <p>
                    OK Dent'i daha detaylı anlatacağımız ana
                    kurumsal bölüm.
                  </p>
                </div>
              </div>

              <div className="field">
                <label>Bölüm Başlığı</label>

                <input
                  name="story_title"
                  value={form.story_title}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Tanıtım Metni</label>

                <textarea
                  name="story_text"
                  value={form.story_text}
                  onChange={handleChange}
                  rows="7"
                />
              </div>

              <div className="field">
                <label>Klinik Görseli</label>

                <div className="uploadBox">
                  {form.image_url ? (
                    <img
                      src={form.image_url}
                      alt="Hakkımızda"
                    />
                  ) : (
                    <div className="emptyImage">
                      <span>＋</span>
                      <strong>Henüz görsel yok</strong>
                      <small>
                        JPG, PNG veya WEBP
                      </small>
                    </div>
                  )}

                  <div className="uploadActions">
                    <label className="uploadButton">
                      {uploading
                        ? "Yükleniyor..."
                        : "Görsel Yükle"}

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
                          Kaldır
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panelHeading">
                <div className="number">03</div>

                <div>
                  <h2>Değerlerimiz</h2>
                  <p>
                    Hakkımızda sayfasında üç ayrı kurumsal
                    değer göstereceğiz.
                  </p>
                </div>
              </div>

              <div className="valueGrid">
                <div className="valueEditor">
                  <span>01</span>

                  <div className="field">
                    <label>Başlık</label>
                    <input
                      name="value_1_title"
                      value={form.value_1_title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label>Açıklama</label>
                    <textarea
                      name="value_1_text"
                      value={form.value_1_text}
                      onChange={handleChange}
                      rows="5"
                    />
                  </div>
                </div>

                <div className="valueEditor">
                  <span>02</span>

                  <div className="field">
                    <label>Başlık</label>
                    <input
                      name="value_2_title"
                      value={form.value_2_title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label>Açıklama</label>
                    <textarea
                      name="value_2_text"
                      value={form.value_2_text}
                      onChange={handleChange}
                      rows="5"
                    />
                  </div>
                </div>

                <div className="valueEditor">
                  <span>03</span>

                  <div className="field">
                    <label>Başlık</label>
                    <input
                      name="value_3_title"
                      value={form.value_3_title}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="field">
                    <label>Açıklama</label>
                    <textarea
                      name="value_3_text"
                      value={form.value_3_text}
                      onChange={handleChange}
                      rows="5"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="panel">
              <div className="panelHeading">
                <div className="number">04</div>
                <div>
                  <h2>Sayfa Detayları / Mikro Metinler</h2>
                  <p>Hakkımızda sayfasındaki küçük sabit yazıları buradan yönetebilirsiniz.</p>
                </div>
              </div>
              <div className="field">
                <label>Breadcrumb — Ana Sayfa</label>
                <input name="breadcrumb_home_text" value={form.breadcrumb_home_text} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Breadcrumb — Kurumsal</label>
                <input name="breadcrumb_corporate_text" value={form.breadcrumb_corporate_text} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Breadcrumb — Hakkımızda</label>
                <input name="breadcrumb_current_text" value={form.breadcrumb_current_text} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Hero Rozet İşareti</label>
                <input name="hero_badge_mark" value={form.hero_badge_mark} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Hero Rozet Başlığı</label>
                <input name="hero_badge_title" value={form.hero_badge_title} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Hero Rozet Açıklaması</label>
                <textarea name="hero_badge_text" value={form.hero_badge_text} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>Görsel Yoksa İşaret</label>
                <input name="image_placeholder_mark" value={form.image_placeholder_mark} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Görsel Yoksa Başlık</label>
                <input name="image_placeholder_title" value={form.image_placeholder_title} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Görsel Yoksa Açıklama</label>
                <textarea name="image_placeholder_text" value={form.image_placeholder_text} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>Görsel Kart Başlığı</label>
                <input name="image_card_title" value={form.image_card_title} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Görsel Kart Açıklaması</label>
                <textarea name="image_card_text" value={form.image_card_text} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>Hikâye Küçük Başlığı</label>
                <input name="story_eyebrow" value={form.story_eyebrow} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Hikâye Notu</label>
                <textarea name="story_note" value={form.story_note} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>Değerler Küçük Başlığı</label>
                <input name="values_eyebrow" value={form.values_eyebrow} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Değerler Ana Başlığı</label>
                <input name="values_title" value={form.values_title} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Değerler Açıklaması</label>
                <textarea name="values_description" value={form.values_description} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>Yaklaşım Küçük Başlığı</label>
                <input name="principles_eyebrow" value={form.principles_eyebrow} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Yaklaşım Ana Başlığı</label>
                <input name="principles_title" value={form.principles_title} onChange={handleChange} />
              </div>

              <div className="field">
                <label>1. Prensip Başlığı</label>
                <input name="principle_1_title" value={form.principle_1_title} onChange={handleChange} />
              </div>

              <div className="field">
                <label>1. Prensip Açıklaması</label>
                <textarea name="principle_1_text" value={form.principle_1_text} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>2. Prensip Başlığı</label>
                <input name="principle_2_title" value={form.principle_2_title} onChange={handleChange} />
              </div>

              <div className="field">
                <label>2. Prensip Açıklaması</label>
                <textarea name="principle_2_text" value={form.principle_2_text} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>3. Prensip Başlığı</label>
                <input name="principle_3_title" value={form.principle_3_title} onChange={handleChange} />
              </div>

              <div className="field">
                <label>3. Prensip Açıklaması</label>
                <textarea name="principle_3_text" value={form.principle_3_text} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>CTA Küçük Başlığı</label>
                <input name="cta_eyebrow" value={form.cta_eyebrow} onChange={handleChange} />
              </div>

              <div className="field">
                <label>WhatsApp Buton Yazısı</label>
                <input name="whatsapp_button_text" value={form.whatsapp_button_text} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Gizli Sayfa Marka Yazısı</label>
                <textarea name="hidden_brand_text" value={form.hidden_brand_text} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>Gizli Sayfa Başlığı</label>
                <input name="hidden_title" value={form.hidden_title} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Gizli Sayfa Açıklaması</label>
                <textarea name="hidden_description" value={form.hidden_description} onChange={handleChange} rows="3" />
              </div>

              <div className="field">
                <label>Gizli Sayfa Buton Yazısı</label>
                <input name="hidden_button_text" value={form.hidden_button_text} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Gizli Sayfa Buton Linki</label>
                <input name="hidden_button_link" value={form.hidden_button_link} onChange={handleChange} />
              </div>

              <div className="field">
                <label>Yükleniyor Yazısı</label>
                <input name="loading_text" value={form.loading_text} onChange={handleChange} />
              </div>
            </section>

            <section className="panel">
              <div className="panelHeading">
                <div className="number">05</div>

                <div>
                  <h2>Alt Randevu Alanı</h2>
                  <p>
                    Sayfanın sonunda gösterilecek çağrı
                    alanını yönetin.
                  </p>
                </div>
              </div>

              <div className="field">
                <label>Başlık</label>

                <input
                  name="cta_title"
                  value={form.cta_title}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Açıklama</label>

                <textarea
                  name="cta_text"
                  value={form.cta_text}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="twoColumns">
                <div className="field">
                  <label>Buton Yazısı</label>

                  <input
                    name="cta_button_text"
                    value={form.cta_button_text}
                    onChange={handleChange}
                  />
                </div>

                <div className="field">
                  <label>Buton Bağlantısı</label>

                  <input
                    name="cta_button_link"
                    value={form.cta_button_link}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="field">
                <label>Buton İşareti</label>
                <input name="cta_button_arrow_text" value={form.cta_button_arrow_text} onChange={handleChange} />
              </div>
            </section>
          </div>

          <aside className="sideColumn">
            <section className="panel stickyPanel">
              <span className="eyebrow">
                YAYIN DURUMU
              </span>

              <h2>Sayfa Ayarları</h2>

              <label className="switchRow">
                <div>
                  <strong>
                    Hakkımızda Sayfası
                  </strong>

                  <small>
                    Ziyaretçilere göster / gizle
                  </small>
                </div>

                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
              </label>

              <div
                className={`status ${
                  form.is_active
                    ? "published"
                    : "hidden"
                }`}
              >
                <i></i>

                {form.is_active
                  ? "Sayfa yayında"
                  : "Sayfa gizli"}
              </div>

              <div className="divider"></div>

              <span className="eyebrow">
                CANLI ÖNİZLEME
              </span>

              <div className="miniPreview">
                <small>
                  {form.eyebrow || "OK DENT"}
                </small>

                <h3>
                  {form.title ||
                    "Hakkımızda başlığı"}
                </h3>

                <p>
                  {form.description ||
                    "Sayfa açıklaması burada görünecek."}
                </p>

                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt=""
                  />
                )}

                <div className="previewValues">
                  <span>
                    {form.value_1_title ||
                      "Değer 1"}
                  </span>

                  <span>
                    {form.value_2_title ||
                      "Değer 2"}
                  </span>

                  <span>
                    {form.value_3_title ||
                      "Değer 3"}
                  </span>
                </div>
              </div>

              <button
                className="saveSide"
                type="submit"
                disabled={saving || uploading}
              >
                {saving
                  ? "Kaydediliyor..."
                  : "Değişiklikleri Kaydet"}
              </button>
            </section>
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
          background: #f8f6f2;
          color: #30302f;
          padding: 45px 5%;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        .topbar {
          max-width: 1450px;
          margin: 0 auto 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
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
          margin: 8px 0 8px;
          font-size: 38px;
          letter-spacing: -1.5px;
        }

        .topbar p {
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
          border: 1px solid #30302f;
          background: #30302f;
          color: white;
        }

        .saveTop:disabled,
        .saveSide:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .message {
          max-width: 1450px;
          margin: 0 auto 20px;
          padding: 13px 16px;
          border: 1px solid #dec9ae;
          border-radius: 10px;
          background: #f2e9dd;
          color: #765b3f;
          font-size: 12px;
          font-weight: 700;
        }

        .layout {
          max-width: 1450px;
          margin: auto;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 330px;
          gap: 20px;
          align-items: start;
        }

        .mainColumn {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .panel {
          background: white;
          border: 1px solid #e7dfd5;
          border-radius: 17px;
          padding: 25px;
        }

        .panelHeading {
          display: flex;
          gap: 14px;
          align-items: center;
          padding-bottom: 20px;
          margin-bottom: 22px;
          border-bottom: 1px solid #eee8e0;
        }

        .number {
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 11px;
          display: grid;
          place-items: center;
          background: #eee4d7;
          color: #8a6846;
          font-size: 10px;
          font-weight: 900;
        }

        .panelHeading h2,
        .stickyPanel h2 {
          margin: 0 0 4px;
          font-size: 17px;
        }

        .panelHeading p {
          margin: 0;
          color: #91877e;
          font-size: 10px;
          line-height: 1.5;
        }

        .field {
          margin-bottom: 17px;
        }

        .field:last-child {
          margin-bottom: 0;
        }

        .field label {
          display: block;
          margin-bottom: 7px;
          color: #665f58;
          font-size: 10px;
          font-weight: 800;
        }

        input,
        textarea {
          width: 100%;
          border: 1px solid #ded7cf;
          border-radius: 10px;
          background: #fdfcfb;
          color: #30302f;
          padding: 12px 13px;
          outline: none;
          font: inherit;
          font-size: 12px;
          transition: 0.2s;
        }

        textarea {
          resize: vertical;
          line-height: 1.7;
        }

        input:focus,
        textarea:focus {
          border-color: #c2a17b;
          box-shadow:
            0 0 0 3px
            rgba(194, 161, 123, 0.1);
        }

        .uploadBox {
          border: 1px dashed #d7c8b7;
          background: #faf8f5;
          border-radius: 14px;
          padding: 13px;
        }

        .uploadBox > img {
          width: 100%;
          height: 350px;
          display: block;
          object-fit: cover;
          border-radius: 11px;
        }

        .emptyImage {
          height: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #91877e;
          gap: 6px;
        }

        .emptyImage span {
          font-size: 28px;
          color: #c2a17b;
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
          cursor: pointer;
          text-decoration: none;
        }

        .uploadButton {
          background: #30302f;
          color: white;
        }

        .uploadButton input {
          display: none;
        }

        .openButton {
          border: 1px solid #ded7cf;
          background: white;
          color: #30302f;
        }

        .removeButton {
          border: 1px solid #e6c8c2;
          background: #fff7f5;
          color: #a25143;
        }

        .valueGrid {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 12px;
        }

        .valueEditor {
          background: #faf8f5;
          border: 1px solid #eee6dc;
          border-radius: 13px;
          padding: 16px;
        }

        .valueEditor > span {
          display: block;
          margin-bottom: 14px;
          color: #b1906b;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .twoColumns {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stickyPanel {
          position: sticky;
          top: 20px;
        }

        .stickyPanel h2 {
          margin-top: 7px;
          margin-bottom: 20px;
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
          color: #938980;
          margin-top: 4px;
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
          border-radius: 9px;
          display: flex;
          align-items: center;
          gap: 7px;
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
          background: #eee8e0;
          margin: 24px 0;
        }

        .miniPreview {
          margin-top: 12px;
          background: #30302f;
          color: white;
          border-radius: 13px;
          padding: 18px;
        }

        .miniPreview > small {
          color: #c6a47d;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .miniPreview h3 {
          margin: 8px 0;
          font-size: 18px;
          line-height: 1.2;
        }

        .miniPreview p {
          color: #bcb4ac;
          font-size: 9px;
          line-height: 1.6;
        }

        .miniPreview img {
          width: 100%;
          height: 130px;
          object-fit: cover;
          border-radius: 9px;
          margin-top: 8px;
        }

        .previewValues {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 12px;
        }

        .previewValues span {
          background:
            rgba(198, 164, 125, 0.13);
          color: #d8b990;
          border-radius: 20px;
          padding: 5px 7px;
          font-size: 7px;
        }

        .saveSide {
          width: 100%;
          margin-top: 18px;
          padding: 12px;
          border: 0;
          border-radius: 9px;
          background: #c2a17b;
          color: #242423;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        @media (max-width: 1050px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .stickyPanel {
            position: static;
          }
        }

        @media (max-width: 800px) {
          .valueGrid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 25px 16px;
          }

          .topbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .topActions {
            width: 100%;
          }

          .previewButton,
          .saveTop {
            flex: 1;
            text-align: center;
          }

          .twoColumns {
            grid-template-columns: 1fr;
          }

          .panel {
            padding: 18px;
          }

          h1 {
            font-size: 31px;
          }
        }
      `}</style>
    </div>
  );
}