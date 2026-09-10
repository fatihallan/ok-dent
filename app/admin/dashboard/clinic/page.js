"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabaseClient";

export default function ClinicPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    eyebrow: "",
    title: "",
    description: "",
    feature_1: "",
    feature_2: "",
    feature_3: "",
    image_url: "",
    is_active: true,
    sort_order: 3,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadClinic() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("clinic_section")
        .select("*")
        .eq("section_key", "clinic")
        .single();

      if (error) {
        console.error(error);
        setMessage("Kliniğimiz bölümü yüklenemedi.");
        setLoading(false);
        return;
      }

      if (data) {
        setForm({
          eyebrow: data.eyebrow || "",
          title: data.title || "",
          description: data.description || "",
          feature_1: data.feature_1 || "",
          feature_2: data.feature_2 || "",
          feature_3: data.feature_3 || "",
          image_url: data.image_url || "",
          is_active: data.is_active ?? true,
          sort_order: data.sort_order ?? 3,
        });
      }

      setLoading(false);
    }

    loadClinic();
  }, []);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "sort_order"
          ? Number(value)
          : value,
    }));
  }

  async function uploadClinicImage(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Lütfen bir görsel dosyası seç.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Klinik görseli en fazla 8 MB olabilir.");
      return;
    }

    setUploadingImage(true);
    setMessage("Klinik görseli yükleniyor...");

    const supabase = createClient();

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `clinic-${Date.now()}.${extension}`;
      const filePath = `clinic/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        setMessage(
          "Klinik görseli yüklenemedi. Storage izinlerini kontrol et."
        );
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        setMessage("Görsel URL'si oluşturulamadı.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        image_url: publicUrl,
      }));

      setMessage(
        "✓ Klinik görseli yüklendi. Şimdi Kliniğimiz Bölümünü Kaydet butonuna bas."
      );
    } catch (error) {
      console.error(error);
      setMessage("Görsel yüklenirken beklenmeyen bir hata oluştu.");
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  }

  function removeImageFromForm() {
    setForm((prev) => ({
      ...prev,
      image_url: "",
    }));

    setMessage(
      "Klinik görseli kaldırılmak üzere işaretlendi. Kaydetmeyi unutma."
    );
  }

  async function saveClinic(e) {
    e.preventDefault();

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase
      .from("clinic_section")
      .update({
        eyebrow: form.eyebrow,
        title: form.title,
        description: form.description,
        feature_1: form.feature_1,
        feature_2: form.feature_2,
        feature_3: form.feature_3,
        image_url: form.image_url,
        is_active: form.is_active,
        sort_order: form.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq("section_key", "clinic");

    if (error) {
      console.error(error);
      setMessage("Kaydetme sırasında hata oluştu.");
    } else {
      setMessage("✓ Kliniğimiz bölümü başarıyla kaydedildi.");
    }

    setSaving(false);
  }

  if (loading) {
    return (
      <main className="loadingPage">
        Kliniğimiz bölümü yükleniyor...

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
            <small>KLİNİĞİMİZ YÖNETİMİ</small>
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
          <span className="label">ANA SAYFA BÖLÜMÜ</span>

          <h1>Kliniğimiz</h1>

          <p>
            Klinik tanıtım alanındaki metinleri, öne çıkan maddeleri
            ve görseli yönet.
          </p>
        </div>

        {message && <div className="message">{message}</div>}

        <form onSubmit={saveClinic}>
          <div className="layout">
            <div>
              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">01</span>

                  <div>
                    <h2>Metin İçerikleri</h2>
                    <p>Kliniğin yaklaşımını ve ana mesajını düzenle.</p>
                  </div>
                </div>

                <Field
                  label="Üst Başlık"
                  name="eyebrow"
                  value={form.eyebrow}
                  onChange={handleChange}
                  placeholder="OK Dent yaklaşımı"
                />

                <Field
                  label="Ana Başlık"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Modern teknoloji. İnsani dokunuş."
                />

                <div className="field">
                  <label>Açıklama</label>

                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows="6"
                    placeholder="Kliniğin yaklaşımını anlat..."
                  />
                </div>
              </section>

              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">02</span>

                  <div>
                    <h2>Öne Çıkan Özellikler</h2>
                    <p>Kliniği özetleyen üç güçlü madde.</p>
                  </div>
                </div>

                <Field
                  label="Özellik 1"
                  name="feature_1"
                  value={form.feature_1}
                  onChange={handleChange}
                  placeholder="Kişiye özel tedavi planlaması"
                />

                <Field
                  label="Özellik 2"
                  name="feature_2"
                  value={form.feature_2}
                  onChange={handleChange}
                  placeholder="Modern ve steril klinik ortamı"
                />

                <Field
                  label="Özellik 3"
                  name="feature_3"
                  value={form.feature_3}
                  onChange={handleChange}
                  placeholder="Estetik ve fonksiyon birlikte"
                />
              </section>

              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">03</span>

                  <div>
                    <h2>Klinik Fotoğrafı</h2>
                    <p>
                      Görseli bilgisayarından doğrudan Supabase Storage'a yükle.
                    </p>
                  </div>
                </div>

                <div className="field">
                  <label>Kliniğimiz Görseli</label>

                  <div className="uploadArea">
                    <div className="uploadIcon">↑</div>

                    <div className="uploadText">
                      <strong>
                        {uploadingImage
                          ? "Görsel yükleniyor..."
                          : "Yeni klinik fotoğrafı yükle"}
                      </strong>

                      <span>
                        PNG, JPG veya WEBP · Maksimum 8 MB
                      </span>
                    </div>

                    <label
                      className={`uploadButton ${
                        uploadingImage ? "disabled" : ""
                      }`}
                    >
                      {uploadingImage ? "Yükleniyor" : "Fotoğraf Seç"}

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={uploadClinicImage}
                        disabled={uploadingImage}
                        hidden
                      />
                    </label>
                  </div>

                  {form.image_url && (
                    <>
                      <div className="currentFile">
                        <span>✓ Klinik görseli hazır</span>

                        <div className="fileActions">
                          <a
                            href={form.image_url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Görseli Aç ↗
                          </a>

                          <button
                            type="button"
                            className="removeButton"
                            onClick={removeImageFromForm}
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>

                      <div className="imagePreview">
                        <img
                          src={form.image_url}
                          alt="Klinik önizleme"
                        />
                      </div>
                    </>
                  )}

                  {!form.image_url && (
                    <div className="emptyImage">
                      Henüz klinik fotoğrafı yüklenmedi.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <div>
              <section className="previewCard">
                <div className="previewTop">
                  <span>CANLI ÖNİZLEME</span>

                  <div
                    className={`status ${
                      form.is_active ? "active" : "passive"
                    }`}
                  >
                    {form.is_active ? "Yayında" : "Gizli"}
                  </div>
                </div>

                <div className="previewContent">
                  <div
                    className="previewImage"
                    style={
                      form.image_url
                        ? {
                            backgroundImage: `url(${form.image_url})`,
                          }
                        : {}
                    }
                  >
                    {!form.image_url && (
                      <span>Klinik fotoğrafı burada görünecek</span>
                    )}
                  </div>

                  <div className="previewText">
                    <span className="previewEyebrow">
                      {form.eyebrow || "OK Dent yaklaşımı"}
                    </span>

                    <h2>
                      {form.title ||
                        "Modern teknoloji. İnsani dokunuş."}
                    </h2>

                    <p>
                      {form.description ||
                        "Kliniğiniz hakkında kısa açıklama burada görünecek."}
                    </p>

                    <div className="features">
                      {form.feature_1 && (
                        <div className="feature">
                          <span>✓</span>
                          {form.feature_1}
                        </div>
                      )}

                      {form.feature_2 && (
                        <div className="feature">
                          <span>✓</span>
                          {form.feature_2}
                        </div>
                      )}

                      {form.feature_3 && (
                        <div className="feature">
                          <span>✓</span>
                          {form.feature_3}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              <section className="card">
                <div className="cardTitle">
                  <span className="cardIcon">04</span>

                  <div>
                    <h2>Yayın Ayarları</h2>
                    <p>Bölümün görünürlüğü ve sırası.</p>
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
                        ? "Kliniğimiz bölümü yayında"
                        : "Kliniğimiz bölümü gizli"}
                    </strong>

                    <span>
                      Pasif olduğunda ana sayfada ve menüde görünmez.
                    </span>
                  </div>
                </label>

                <div className="orderBox">
                  <div>
                    <strong>Bölüm sırası</strong>
                    <span>
                      İleride tüm bölümlerin sıralamasında kullanılacak.
                    </span>
                  </div>

                  <input
                    type="number"
                    name="sort_order"
                    value={form.sort_order}
                    onChange={handleChange}
                    min="0"
                  />
                </div>
              </section>

              <section className="storageCard">
                <span className="storageLabel">STORAGE</span>

                <h3>Görsel altyapısı hazır</h3>

                <p>
                  Klinik fotoğrafları{" "}
                  <strong>site-assets / clinic</strong>{" "}
                  klasöründe tutulur.
                </p>

                <div className="storageRow">
                  <span>Bucket</span>
                  <b>site-assets</b>
                </div>

                <div className="storageRow">
                  <span>Klasör</span>
                  <b>clinic</b>
                </div>

                <div className="storageRow">
                  <span>Görsel</span>
                  <b>{form.image_url ? "Hazır ✓" : "Yüklenmedi"}</b>
                </div>
              </section>

              <div className="saveBox">
                <div>
                  <strong>Kliniğimiz bölümü hazır mı?</strong>

                  <span>
                    Kaydettiğinde ana sayfadaki bölüm güncellenir.
                  </span>
                </div>

                <button
                  className="saveButton"
                  type="submit"
                  disabled={saving || uploadingImage}
                >
                  {saving
                    ? "Kaydediliyor..."
                    : "Kliniğimiz Bölümünü Kaydet"}
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

        .card,
        .previewCard {
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

        .uploadArea {
          border: 2px dashed #e7dfd5;
          background: #faf8f5;
          border-radius: 16px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
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
        }

        .uploadText span {
          color: #746f68;
          font-size: 11px;
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
          gap: 10px;
          align-items: center;
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

        .imagePreview {
          margin-top: 14px;
          overflow: hidden;
          border-radius: 15px;
          background: #eef3f1;
          aspect-ratio: 16 / 10;
        }

        .imagePreview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .emptyImage {
          margin-top: 12px;
          background: #faf8f5;
          border: 1px solid #e7dfd5;
          color: #817970;
          padding: 14px;
          border-radius: 11px;
          font-size: 12px;
        }

        .previewTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .previewTop > span {
          color: #71857e;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .status {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
        }

        .status.active {
          background: #eee2d3;
          color: #28735b;
        }

        .status.passive {
          background: #f2e4e4;
          color: #925050;
        }

        .previewContent {
          overflow: hidden;
          background: #f5f8f7;
          border-radius: 18px;
        }

        .previewImage {
          min-height: 260px;
          background: #dfe9e5;
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #746f68;
          font-size: 12px;
        }

        .previewText {
          padding: 26px;
        }

        .previewEyebrow {
          display: inline-block;
          color: #548175;
          font-size: 11px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .previewText h2 {
          font-size: 28px;
          margin: 0 0 14px;
          letter-spacing: -1px;
        }

        .previewText p {
          color: #6f807a;
          line-height: 1.7;
          font-size: 13px;
        }

        .features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 20px;
        }

        .feature {
          background: white;
          border: 1px solid #e0e8e5;
          padding: 12px 14px;
          border-radius: 11px;
          display: flex;
          gap: 9px;
          font-size: 12px;
          font-weight: 700;
        }

        .feature span {
          color: #4d947e;
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

        .orderBox {
          margin-top: 16px;
          padding: 16px;
          border: 1px solid #e1e9e6;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .orderBox > div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .orderBox strong {
          font-size: 13px;
        }

        .orderBox span {
          color: #7d8d88;
          font-size: 11px;
        }

        .orderBox input {
          width: 80px;
        }

        .storageCard {
          background: #f8f4ef;
          border: 1px solid #e7dfd5;
          padding: 22px;
          border-radius: 18px;
          margin-bottom: 24px;
        }

        .storageLabel {
          color: #746f68;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .storageCard h3 {
          margin: 8px 0 7px;
          font-size: 18px;
        }

        .storageCard p {
          margin: 0 0 18px;
          color: #746f68;
          font-size: 12px;
          line-height: 1.6;
        }

        .storageRow {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 10px 0;
          border-top: 1px solid #e7dfd5;
          font-size: 12px;
        }

        .storageRow span {
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
          .layout {
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
          .brand {
            display: none;
          }

          .container {
            padding: 30px 15px 70px;
          }

          .pageTitle h1 {
            font-size: 31px;
          }

          .card,
          .previewCard {
            padding: 20px;
          }

          .uploadButton {
            width: 100%;
            text-align: center;
          }

          .currentFile {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
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