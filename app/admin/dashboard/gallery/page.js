"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabaseClient";

const emptyForm = {
  id: null,
  title: "",
  description: "",
  category: "",
  image_url: "",
  sort_order: 1,
  is_active: true,
};

export default function GalleryPage() {
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadGallery();
  }, []);

  async function loadGallery() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("gallery")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("Galeri yüklenemedi.");
    } else {
      setItems(data || []);
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

  function editItem(item) {
    setForm({
      id: item.id,
      title: item.title || "",
      description: item.description || "",
      category: item.category || "",
      image_url: item.image_url || "",
      sort_order: item.sort_order ?? 1,
      is_active: item.is_active ?? true,
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    const nextOrder =
      items.length > 0
        ? Math.max(...items.map((item) => item.sort_order || 0)) + 1
        : 1;

    setForm({
      ...emptyForm,
      sort_order: nextOrder,
    });

    setMessage("");
  }

  async function uploadImage(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Lütfen bir görsel dosyası seç.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Galeri görseli en fazla 8 MB olabilir.");
      return;
    }

    setUploading(true);
    setMessage("Görsel yükleniyor...");

    const supabase = createClient();

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `gallery-${Date.now()}.${extension}`;
      const filePath = `gallery/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        setMessage("Görsel yüklenemedi.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        setMessage("Görsel bağlantısı oluşturulamadı.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        image_url: publicUrl,
      }));

      setMessage("✓ Görsel yüklendi. Şimdi kaydet.");
    } catch (error) {
      console.error(error);
      setMessage("Beklenmeyen bir yükleme hatası oluştu.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function saveItem(e) {
    e.preventDefault();

    if (!form.image_url) {
      setMessage("Önce galeri görseli yüklemelisin.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      image_url: form.image_url,
      sort_order: form.sort_order,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    let error = null;

    if (form.id) {
      const result = await supabase
        .from("gallery")
        .update(payload)
        .eq("id", form.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("gallery")
        .insert(payload);

      error = result.error;
    }

    if (error) {
      console.error(error);
      setMessage("Galeri öğesi kaydedilemedi.");
      setSaving(false);
      return;
    }

    setMessage(
      form.id
        ? "✓ Galeri öğesi güncellendi."
        : "✓ Yeni galeri öğesi eklendi."
    );

    await loadGallery();

    setForm(emptyForm);
    setSaving(false);
  }

  async function deleteItem(id) {
    const approved = window.confirm(
      "Bu galeri görselini silmek istediğine emin misin?"
    );

    if (!approved) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("gallery")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Galeri öğesi silinemedi.");
      return;
    }

    if (form.id === id) {
      resetForm();
    }

    setMessage("✓ Galeri öğesi silindi.");
    await loadGallery();
  }

  async function toggleItem(item) {
    const supabase = createClient();

    const { error } = await supabase
      .from("gallery")
      .update({
        is_active: !item.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (error) {
      console.error(error);
      setMessage("Yayın durumu değiştirilemedi.");
      return;
    }

    await loadGallery();
  }

  function removeImage() {
    setForm((prev) => ({
      ...prev,
      image_url: "",
    }));

    setMessage(
      "Görsel kaldırılmak üzere işaretlendi. Kaydetmeyi unutma."
    );
  }

  if (loading) {
    return (
      <main className="loadingPage">
        Galeri yükleniyor...

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f7f5f2;
            color: #2f2f2f;
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
            type="button"
            className="back"
            onClick={() => router.push("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <div className="brand">
            <span>OK DENT</span>
            <small>GALERİ YÖNETİMİ</small>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="siteButton"
        >
          Siteyi Görüntüle ↗
        </a>
      </header>

      <div className="container">
        <div className="pageTitle">
          <span className="label">GÖRSEL YÖNETİMİ</span>

          <h1>Galeri</h1>

          <p>
            Klinik fotoğraflarını ekle, düzenle, sırala ve
            yayın durumlarını yönet.
          </p>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="layout">
          <form onSubmit={saveItem}>
            <section className="card">
              <div className="cardTitle">
                <span className="cardIcon">
                  {form.id ? "✎" : "+"}
                </span>

                <div>
                  <h2>
                    {form.id
                      ? "Galeri Öğesini Düzenle"
                      : "Yeni Galeri Öğesi"}
                  </h2>

                  <p>Fotoğraf ve içerik bilgilerini yönet.</p>
                </div>
              </div>

              <div className="field">
                <label>Başlık</label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Örn. Klinik Bekleme Alanı"
                />
              </div>

              <div className="field">
                <label>Kategori</label>

                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  placeholder="Örn. Klinik, Tedavi, Ekip"
                />
              </div>

              <div className="field">
                <label>Açıklama</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Görsel hakkında kısa açıklama..."
                />
              </div>

              <div className="field">
                <label>Galeri Fotoğrafı</label>

                <div className="uploadArea">
                  <div className="uploadIcon">↑</div>

                  <div className="uploadText">
                    <strong>
                      {uploading
                        ? "Fotoğraf yükleniyor..."
                        : "Galeri görseli yükle"}
                    </strong>

                    <span>
                      PNG, JPG veya WEBP · Maksimum 8 MB
                    </span>
                  </div>

                  <label
                    className={`uploadButton ${
                      uploading ? "disabled" : ""
                    }`}
                  >
                    {uploading ? "Yükleniyor" : "Fotoğraf Seç"}

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={uploadImage}
                      disabled={uploading}
                      hidden
                    />
                  </label>
                </div>

                {form.image_url ? (
                  <>
                    <div className="currentFile">
                      <span>✓ Görsel hazır</span>

                      <div className="fileActions">
                        <a
                          href={form.image_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Aç ↗
                        </a>

                        <button
                          type="button"
                          onClick={removeImage}
                          className="removeButton"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>

                    <div className="imagePreview">
                      <img
                        src={form.image_url}
                        alt={form.title || "Galeri önizleme"}
                      />
                    </div>
                  </>
                ) : (
                  <div className="emptyImage">
                    Henüz görsel yüklenmedi.
                  </div>
                )}
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
                    onClick={resetForm}
                    className="cancelButton"
                  >
                    İptal / Yeni Görsel
                  </button>
                )}

                <button
                  type="submit"
                  className="saveButton"
                  disabled={saving || uploading}
                >
                  {saving
                    ? "Kaydediliyor..."
                    : form.id
                    ? "Görseli Güncelle"
                    : "Galeriye Ekle"}
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

              <div className="galleryPreview">
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt={form.title || "Galeri"}
                  />
                ) : (
                  <div className="previewPlaceholder">
                    Görsel Önizleme
                  </div>
                )}

                <div className="previewOverlay">
                  {form.category && (
                    <span>{form.category}</span>
                  )}

                  <h3>{form.title || "Galeri Başlığı"}</h3>

                  {form.description && (
                    <p>{form.description}</p>
                  )}
                </div>
              </div>
            </section>
          </form>

          <div>
            <section className="galleryCard">
              <div className="listHeader">
                <div>
                  <span className="label">MEVCUT GALERİ</span>
                  <h2>Galeri Görselleri</h2>
                </div>

                <div className="count">{items.length}</div>
              </div>

              {items.length === 0 ? (
                <div className="emptyList">
                  Galeride henüz görsel yok.
                </div>
              ) : (
                <div className="galleryList">
                  {items.map((item) => (
                    <article
                      key={item.id}
                      className={`galleryItem ${
                        form.id === item.id ? "selected" : ""
                      }`}
                    >
                      <div className="thumb">
                        <img
                          src={item.image_url}
                          alt={item.title || "Galeri"}
                        />
                      </div>

                      <div className="itemInfo">
                        <div className="itemTop">
                          <strong>
                            {item.title || "Başlıksız Görsel"}
                          </strong>

                          <span
                            className={`statusBadge ${
                              item.is_active
                                ? "active"
                                : "passive"
                            }`}
                          >
                            {item.is_active ? "Yayında" : "Gizli"}
                          </span>
                        </div>

                        {item.category && (
                          <span className="category">
                            {item.category}
                          </span>
                        )}

                        <div className="meta">
                          <span>Sıra: {item.sort_order}</span>
                          <span>Fotoğraf ✓</span>
                        </div>
                      </div>

                      <div className="actions">
                        <button
                          type="button"
                          onClick={() => editItem(item)}
                          className="editButton"
                        >
                          Düzenle
                        </button>

                        <button
                          type="button"
                          onClick={() => toggleItem(item)}
                          className="visibilityButton"
                        >
                          {item.is_active ? "Gizle" : "Yayınla"}
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteItem(item.id)}
                          className="deleteButton"
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

              <h3>Galeri depolaması aktif</h3>

              <p>
                Tüm galeri görselleri{" "}
                <strong>site-assets / gallery</strong>{" "}
                klasöründe tutulur.
              </p>

              <div className="storageRow">
                <span>Bucket</span>
                <b>site-assets</b>
              </div>

              <div className="storageRow">
                <span>Klasör</span>
                <b>gallery</b>
              </div>

              <div className="storageRow">
                <span>Görsel sayısı</span>
                <b>{items.length}</b>
              </div>
            </section>
          </div>
        </div>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f7f5f2;
          color: #343230;
          font-family: Arial, sans-serif;
        }

        .topbar {
          min-height: 84px;
          background: #2f302f;
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
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.06);
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
          margin-top: 4px;
          color: #c9b08d;
          font-size: 10px;
          letter-spacing: 2px;
        }

        .siteButton {
          background: #cbb18e;
          color: #2e2e2d;
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
          color: #a18462;
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
          color: #807b75;
          line-height: 1.6;
          margin: 0;
        }

        .message {
          background: #f3ebdf;
          color: #755e42;
          border: 1px solid #dfcdb7;
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
        .galleryCard {
          background: #ffffff;
          border: 1px solid #e9e2d8;
          border-radius: 20px;
          padding: 27px;
          margin-bottom: 24px;
          box-shadow: 0 10px 30px rgba(40, 40, 40, 0.04);
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
          background: #f1e8db;
          color: #9c7d59;
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
          color: #8b857d;
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
          border: 1px solid #ded7cd;
          border-radius: 11px;
          padding: 13px 14px;
          font-size: 14px;
          outline: none;
          background: #fcfbf9;
          color: #333231;
        }

        input:focus,
        textarea:focus {
          border-color: #b89a76;
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
          border: 2px dashed #ddd1c1;
          background: #fbf8f4;
          border-radius: 16px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .uploadIcon {
          width: 44px;
          height: 44px;
          background: #eee3d5;
          color: #997854;
          border-radius: 12px;
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
          color: #8a837b;
          font-size: 11px;
        }

        .uploadButton {
          background: #303130;
          color: white;
          padding: 11px 15px;
          border-radius: 10px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
        }

        .uploadButton.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .currentFile {
          margin-top: 12px;
          background: #f8f4ef;
          border: 1px solid #e7ddd0;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .currentFile > span {
          color: #967553;
          font-weight: 700;
        }

        .fileActions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .currentFile a {
          color: #6e604e;
          text-decoration: none;
          font-weight: 700;
        }

        .removeButton {
          border: 0;
          background: #f6e6e3;
          color: #9a4841;
          padding: 7px 10px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 11px;
          font-weight: 800;
        }

        .imagePreview {
          margin-top: 14px;
          height: 320px;
          overflow: hidden;
          background: #eeeae4;
          border-radius: 15px;
        }

        .imagePreview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .emptyImage {
          margin-top: 12px;
          background: #faf8f5;
          border: 1px solid #e8e1d8;
          color: #8c8882;
          padding: 14px;
          border-radius: 11px;
          font-size: 12px;
        }

        .switchRow {
          min-height: 51px;
          background: #faf6f1;
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
          color: #827b73;
          font-size: 10px;
        }

        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 11px;
        }

        .saveButton {
          border: 0;
          background: #303130;
          color: white;
          padding: 13px 18px;
          border-radius: 11px;
          cursor: pointer;
          font-weight: 900;
        }

        .cancelButton {
          border: 1px solid #ded6cb;
          background: white;
          color: #6e655b;
          padding: 12px 16px;
          border-radius: 11px;
          cursor: pointer;
          font-weight: 800;
        }

        .previewHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .previewHeader > span {
          color: #927a60;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .previewHeader b {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 10px;
        }

        .live {
          background: #f0e6d9;
          color: #8a6a47;
        }

        .hidden {
          background: #f3e5e5;
          color: #915454;
        }

        .galleryPreview {
          position: relative;
          height: 470px;
          overflow: hidden;
          border-radius: 18px;
          background: #eeeae4;
        }

        .galleryPreview > img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .previewPlaceholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #99918a;
        }

        .previewOverlay {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          padding: 70px 25px 25px;
          color: white;
          background: linear-gradient(
            transparent,
            rgba(30, 29, 28, 0.88)
          );
        }

        .previewOverlay span {
          color: #d5bc9b;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.4px;
        }

        .previewOverlay h3 {
          margin: 8px 0 5px;
          font-size: 24px;
        }

        .previewOverlay p {
          margin: 0;
          color: #dedbd7;
          font-size: 12px;
          line-height: 1.6;
        }

        .listHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .listHeader h2 {
          margin: 7px 0 0;
        }

        .count {
          width: 42px;
          height: 42px;
          border-radius: 13px;
          background: #f0e7db;
          color: #876a4c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
        }

        .galleryList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .galleryItem {
          border: 1px solid #e5ddd3;
          border-radius: 15px;
          padding: 13px;
          display: grid;
          grid-template-columns: 105px 1fr auto;
          gap: 14px;
          align-items: center;
          background: #fdfcfb;
        }

        .galleryItem.selected {
          border-color: #b89a76;
          background: #fbf7f2;
        }

        .thumb {
          width: 105px;
          height: 82px;
          border-radius: 12px;
          overflow: hidden;
          background: #ece7e0;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .itemTop {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .itemTop strong {
          font-size: 14px;
        }

        .statusBadge {
          padding: 4px 7px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 800;
        }

        .statusBadge.active {
          background: #eee4d6;
          color: #836444;
        }

        .statusBadge.passive {
          background: #f3e5e5;
          color: #925555;
        }

        .category {
          display: block;
          color: #998069;
          font-size: 10px;
          margin-top: 5px;
          font-weight: 700;
        }

        .meta {
          display: flex;
          gap: 12px;
          margin-top: 8px;
          color: #867e75;
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
          background: #303130;
          color: white;
        }

        .visibilityButton {
          background: #eee7dd;
          color: #725c43;
        }

        .deleteButton {
          background: #f7e5e3;
          color: #93443e;
        }

        .emptyList {
          background: #faf8f5;
          border: 1px solid #e8e0d6;
          border-radius: 13px;
          padding: 30px;
          text-align: center;
          color: #8a837b;
          font-size: 13px;
        }

        .storageCard {
          background: #f1e8dc;
          border: 1px solid #e0d1bf;
          padding: 22px;
          border-radius: 18px;
        }

        .storageLabel {
          color: #967958;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
        }

        .storageCard h3 {
          margin: 8px 0 7px;
          font-size: 18px;
        }

        .storageCard p {
          color: #7b6d5d;
          font-size: 12px;
          line-height: 1.6;
        }

        .storageRow {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-top: 1px solid #dfd0bd;
          font-size: 12px;
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

          .galleryItem {
            grid-template-columns: 90px 1fr;
          }

          .thumb {
            width: 90px;
          }

          .actions {
            grid-column: 1 / -1;
            flex-direction: row;
          }

          .actions button {
            flex: 1;
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
          .galleryCard {
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
            gap: 10px;
          }

          .formActions {
            flex-direction: column;
          }

          .formActions button {
            width: 100%;
          }

          .galleryPreview {
            height: 390px;
          }
        }
      `}</style>
    </main>
  );
}