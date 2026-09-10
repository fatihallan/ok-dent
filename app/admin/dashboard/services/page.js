"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabaseClient";

const emptyForm = {
  id: null,
  title: "",
  description: "",
  image_url: "",
  button_text: "Detaylı Bilgi",
  button_link: "",
  sort_order: 0,
  is_active: true,
};

export default function ServicesPage() {
  const router = useRouter();

  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("Hizmetler yüklenemedi.");
    } else {
      setServices(data || []);
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
          : name === "sort_order"
          ? Number(value)
          : value,
    }));
  }

  function resetForm() {
    setForm({
      ...emptyForm,
      sort_order:
        services.length > 0
          ? Math.max(...services.map((item) => item.sort_order || 0)) + 1
          : 1,
    });

    setMessage("");
  }

  function editService(service) {
    setForm({
      id: service.id,
      title: service.title || "",
      description: service.description || "",
      image_url: service.image_url || "",
      button_text: service.button_text || "Detaylı Bilgi",
      button_link: service.button_link || "",
      sort_order: service.sort_order ?? 0,
      is_active: service.is_active ?? true,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadServiceImage(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Lütfen bir görsel dosyası seç.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Hizmet görseli en fazla 8 MB olabilir.");
      return;
    }

    setUploadingImage(true);
    setMessage("Hizmet görseli yükleniyor...");

    const supabase = createClient();

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `service-${Date.now()}.${extension}`;
      const filePath = `services/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        setMessage(
          "Hizmet görseli yüklenemedi. Storage izinlerini kontrol et."
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
        "✓ Hizmet görseli yüklendi. Şimdi hizmeti kaydet."
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
      "Hizmet görseli kaldırılmak üzere işaretlendi. Kaydetmeyi unutma."
    );
  }

  async function saveService(e) {
    e.preventDefault();

    if (!form.title.trim()) {
      setMessage("Hizmet başlığı boş bırakılamaz.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const payload = {
      title: form.title.trim(),
      description: form.description,
      image_url: form.image_url,
      button_text: form.button_text,
      button_link: form.button_link,
      sort_order: form.sort_order,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (form.id) {
      const result = await supabase
        .from("services")
        .update(payload)
        .eq("id", form.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("services")
        .insert(payload);

      error = result.error;
    }

    if (error) {
      console.error(error);
      setMessage("Hizmet kaydedilemedi.");
      setSaving(false);
      return;
    }

    setMessage(
      form.id
        ? "✓ Hizmet başarıyla güncellendi."
        : "✓ Yeni hizmet başarıyla eklendi."
    );

    await loadServices();

    setForm({
      ...emptyForm,
      sort_order:
        services.length > 0
          ? Math.max(...services.map((item) => item.sort_order || 0)) + 1
          : 1,
    });

    setSaving(false);
  }

  async function deleteService(id) {
    const approved = window.confirm(
      "Bu hizmeti kalıcı olarak silmek istediğine emin misin?"
    );

    if (!approved) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("services")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Hizmet silinemedi.");
      return;
    }

    if (form.id === id) {
      resetForm();
    }

    setMessage("✓ Hizmet silindi.");
    await loadServices();
  }

  async function toggleService(service) {
    const supabase = createClient();

    const { error } = await supabase
      .from("services")
      .update({
        is_active: !service.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", service.id);

    if (error) {
      console.error(error);
      setMessage("Hizmet durumu değiştirilemedi.");
      return;
    }

    await loadServices();
  }

  if (loading) {
    return (
      <main className="loadingPage">
        Hizmetler yükleniyor...

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
            <small>HİZMETLER YÖNETİMİ</small>
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
          <span className="label">İÇERİK YÖNETİMİ</span>

          <h1>Hizmetler</h1>

          <p>
            Tedavi alanlarını ekle, düzenle, fotoğraf yükle ve
            yayın durumlarını yönet.
          </p>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="layout">
          <form onSubmit={saveService}>
            <section className="card">
              <div className="cardTitle">
                <span className="cardIcon">
                  {form.id ? "✎" : "+"}
                </span>

                <div>
                  <h2>
                    {form.id ? "Hizmeti Düzenle" : "Yeni Hizmet"}
                  </h2>

                  <p>
                    {form.id
                      ? "Seçili hizmetin bilgilerini güncelle."
                      : "Yeni bir tedavi veya hizmet alanı oluştur."}
                  </p>
                </div>
              </div>

              <Field
                label="Hizmet Başlığı"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Örn. İmplant Tedavisi"
              />

              <div className="field">
                <label>Açıklama</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Hizmet hakkında kısa ve anlaşılır açıklama..."
                />
              </div>

              <div className="field">
                <label>Hizmet Görseli</label>

                <div className="uploadArea">
                  <div className="uploadIcon">↑</div>

                  <div className="uploadText">
                    <strong>
                      {uploadingImage
                        ? "Fotoğraf yükleniyor..."
                        : "Hizmet fotoğrafı yükle"}
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
                      onChange={uploadServiceImage}
                      disabled={uploadingImage}
                      hidden
                    />
                  </label>
                </div>

                {form.image_url && (
                  <>
                    <div className="currentFile">
                      <span>✓ Hizmet görseli hazır</span>

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
                        alt="Hizmet görseli"
                      />
                    </div>
                  </>
                )}

                {!form.image_url && (
                  <div className="emptyImage">
                    Henüz bu hizmet için fotoğraf seçilmedi.
                  </div>
                )}
              </div>

              <div className="grid2">
                <Field
                  label="Buton Yazısı"
                  name="button_text"
                  value={form.button_text}
                  onChange={handleChange}
                  placeholder="Detaylı Bilgi"
                />

                <Field
                  label="Buton Bağlantısı"
                  name="button_link"
                  value={form.button_link}
                  onChange={handleChange}
                  placeholder="#iletisim"
                />
              </div>

              <div className="grid2">
                <div className="field">
                  <label>Sıra</label>

                  <input
                    type="number"
                    name="sort_order"
                    value={form.sort_order}
                    onChange={handleChange}
                    min="0"
                  />
                </div>

                <div className="field">
                  <label>Yayın Durumu</label>

                  <label className="switchRow">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />

                    <div>
                      <strong>
                        {form.is_active ? "Yayında" : "Gizli"}
                      </strong>

                      <span>
                        Ana sayfada görünürlüğünü belirler.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="formActions">
                {form.id && (
                  <button
                    type="button"
                    className="cancelButton"
                    onClick={resetForm}
                  >
                    İptal / Yeni Hizmet
                  </button>
                )}

                <button
                  className="saveButton"
                  type="submit"
                  disabled={saving || uploadingImage}
                >
                  {saving
                    ? "Kaydediliyor..."
                    : form.id
                    ? "Hizmeti Güncelle"
                    : "Yeni Hizmet Ekle"}
                </button>
              </div>
            </section>

            <section className="previewCard">
              <div className="previewHeader">
                <span>CANLI ÖNİZLEME</span>

                <b className={form.is_active ? "live" : "hidden"}>
                  {form.is_active ? "Yayında" : "Gizli"}
                </b>
              </div>

              {form.image_url && (
                <div className="previewImage">
                  <img src={form.image_url} alt="" />
                </div>
              )}

              <span className="previewNumber">
                {String(form.sort_order || 0).padStart(2, "0")}
              </span>

              <h3>{form.title || "Hizmet Başlığı"}</h3>

              <p>
                {form.description ||
                  "Hizmet açıklaması burada görünecek."}
              </p>

              {form.button_text && (
                <div className="previewLink">
                  {form.button_text} →
                </div>
              )}
            </section>
          </form>

          <div>
            <section className="servicesCard">
              <div className="listHeader">
                <div>
                  <span className="label">MEVCUT İÇERİK</span>

                  <h2>Hizmet Listesi</h2>
                </div>

                <div className="count">
                  {services.length}
                </div>
              </div>

              {services.length === 0 ? (
                <div className="emptyList">
                  Henüz hizmet bulunmuyor.
                </div>
              ) : (
                <div className="serviceList">
                  {services.map((service) => (
                    <article
                      className={`serviceItem ${
                        form.id === service.id ? "selected" : ""
                      }`}
                      key={service.id}
                    >
                      <div className="serviceImage">
                        {service.image_url ? (
                          <img
                            src={service.image_url}
                            alt={service.title}
                          />
                        ) : (
                          <span>
                            {String(service.sort_order || 0).padStart(
                              2,
                              "0"
                            )}
                          </span>
                        )}
                      </div>

                      <div className="serviceInfo">
                        <div className="serviceTop">
                          <strong>{service.title}</strong>

                          <span
                            className={`statusBadge ${
                              service.is_active
                                ? "active"
                                : "passive"
                            }`}
                          >
                            {service.is_active
                              ? "Yayında"
                              : "Gizli"}
                          </span>
                        </div>

                        <p>{service.description}</p>

                        <div className="meta">
                          <span>
                            Sıra: {service.sort_order}
                          </span>

                          {service.image_url && (
                            <span>Fotoğraf ✓</span>
                          )}
                        </div>
                      </div>

                      <div className="actions">
                        <button
                          type="button"
                          className="editButton"
                          onClick={() => editService(service)}
                        >
                          Düzenle
                        </button>

                        <button
                          type="button"
                          className="visibilityButton"
                          onClick={() => toggleService(service)}
                        >
                          {service.is_active
                            ? "Gizle"
                            : "Yayınla"}
                        </button>

                        <button
                          type="button"
                          className="deleteButton"
                          onClick={() => deleteService(service.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="storageCard">
              <span className="storageLabel">
                SUPABASE STORAGE
              </span>

              <h3>Hizmet görselleri bağlı</h3>

              <p>
                Yüklenen fotoğraflar{" "}
                <strong>site-assets / services</strong>{" "}
                klasöründe tutulur.
              </p>

              <div className="storageRow">
                <span>Bucket</span>
                <b>site-assets</b>
              </div>

              <div className="storageRow">
                <span>Klasör</span>
                <b>services</b>
              </div>

              <div className="storageRow">
                <span>Hizmet sayısı</span>
                <b>{services.length}</b>
              </div>
            </section>
          </div>
        </div>
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
          max-width: 1350px;
          margin: auto;
          padding: 44px 24px 90px;
        }

        .pageTitle {
          margin-bottom: 28px;
        }

        .label {
          color: #746f68;
          font-size: 10px;
          font-weight: 900;
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
          grid-template-columns: 0.9fr 1.1fr;
          gap: 24px;
          align-items: start;
        }

        .card,
        .previewCard,
        .servicesCard {
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
          font-size: 16px;
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

        .field > label {
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
          aspect-ratio: 16 / 10;
          overflow: hidden;
          background: #eef4f1;
          border-radius: 14px;
        }

        .imagePreview img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
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

        .switchRow {
          min-height: 51px;
          box-sizing: border-box;
          background: #faf8f5;
          border-radius: 11px;
          padding: 10px 13px;
          display: flex !important;
          align-items: center;
          gap: 10px;
          margin: 0 !important;
          cursor: pointer;
        }

        .switchRow input {
          width: auto;
        }

        .switchRow div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .switchRow strong {
          font-size: 12px;
        }

        .switchRow span {
          color: #746f68;
          font-size: 10px;
        }

        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 11px;
          margin-top: 10px;
        }

        .saveButton {
          border: 0;
          background: #30302f;
          color: white;
          padding: 13px 18px;
          border-radius: 11px;
          cursor: pointer;
          font-weight: 900;
        }

        .saveButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .cancelButton {
          border: 1px solid #e7dfd5;
          background: white;
          color: #557169;
          padding: 12px 16px;
          border-radius: 11px;
          cursor: pointer;
          font-weight: 800;
        }

        .previewHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
        }

        .previewHeader > span {
          color: #72877f;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .previewHeader b {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 10px;
        }

        .previewHeader .live {
          background: #eee2d3;
          color: #276e58;
        }

        .previewHeader .hidden {
          background: #f3e5e5;
          color: #915454;
        }

        .previewImage {
          aspect-ratio: 16 / 9;
          border-radius: 15px;
          overflow: hidden;
          margin-bottom: 18px;
          background: #edf3f0;
        }

        .previewImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .previewNumber {
          display: inline-flex;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #eee2d3;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
          color: #3b705f;
        }

        .previewCard h3 {
          font-size: 25px;
          margin: 16px 0 10px;
        }

        .previewCard p {
          color: #71817c;
          font-size: 13px;
          line-height: 1.7;
        }

        .previewLink {
          margin-top: 18px;
          font-size: 12px;
          font-weight: 800;
          color: #295f50;
        }

        .listHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .listHeader h2 {
          margin: 7px 0 0;
          font-size: 23px;
        }

        .count {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: #e5f3ed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 900;
        }

        .serviceList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .serviceItem {
          border: 1px solid #e0e8e5;
          border-radius: 15px;
          padding: 13px;
          display: grid;
          grid-template-columns: 84px 1fr auto;
          gap: 14px;
          align-items: center;
          background: #fbfcfc;
        }

        .serviceItem.selected {
          border-color: #7fb9a7;
          background: #f3faf7;
        }

        .serviceImage {
          width: 84px;
          height: 72px;
          background: #e8f1ed;
          border-radius: 11px;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .serviceImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .serviceImage span {
          font-size: 12px;
          font-weight: 900;
          color: #5c7c72;
        }

        .serviceInfo {
          min-width: 0;
        }

        .serviceTop {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .serviceTop strong {
          font-size: 14px;
        }

        .statusBadge {
          padding: 4px 7px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
        }

        .statusBadge.active {
          background: #dff4e9;
          color: #33735d;
        }

        .statusBadge.passive {
          background: #f3e5e5;
          color: #925555;
        }

        .serviceInfo p {
          color: #7b8a86;
          font-size: 11px;
          line-height: 1.5;
          margin: 7px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .meta {
          display: flex;
          gap: 12px;
          color: #72837e;
          font-size: 9px;
          font-weight: 700;
        }

        .actions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .actions button {
          border: 0;
          border-radius: 8px;
          padding: 7px 10px;
          cursor: pointer;
          font-size: 10px;
          font-weight: 800;
        }

        .editButton {
          background: #30302f;
          color: white;
        }

        .visibilityButton {
          background: #e8f1ed;
          color: #365f53;
        }

        .deleteButton {
          background: #f8e6e6;
          color: #963f3f;
        }

        .emptyList {
          background: #faf8f5;
          color: #758680;
          border-radius: 13px;
          padding: 25px;
          text-align: center;
          font-size: 12px;
        }

        .storageCard {
          background: #f8f4ef;
          border: 1px solid #e7dfd5;
          padding: 22px;
          border-radius: 18px;
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

        @media (max-width: 1050px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 750px) {
          .grid2 {
            grid-template-columns: 1fr;
          }

          .topbar {
            padding: 0 20px;
          }

          .siteButton {
            display: none;
          }

          .serviceItem {
            grid-template-columns: 70px 1fr;
          }

          .actions {
            grid-column: 1 / -1;
            flex-direction: row;
          }

          .actions button {
            flex: 1;
          }

          .serviceImage {
            width: 70px;
            height: 70px;
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
          .previewCard,
          .servicesCard {
            padding: 20px;
          }

          .uploadArea {
            flex-wrap: wrap;
          }

          .uploadButton {
            width: 100%;
            text-align: center;
          }

          .currentFile {
            flex-direction: column;
          }

          .formActions {
            flex-direction: column;
          }

          .formActions button {
            width: 100%;
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