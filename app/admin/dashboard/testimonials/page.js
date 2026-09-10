"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabaseClient";

const emptyForm = {
  id: null,
  patient_name: "",
  treatment: "",
  comment: "",
  rating: 5,
  sort_order: 1,
  is_active: true,
};

export default function TestimonialsPage() {
  const router = useRouter();

  const [testimonials, setTestimonials] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTestimonials();
  }, []);

  async function loadTestimonials() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Yorumlar yüklenemedi.");
    } else {
      setTestimonials(data || []);
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
          : name === "rating" || name === "sort_order"
          ? Number(value)
          : value,
    }));
  }

  function selectRating(rating) {
    setForm((prev) => ({
      ...prev,
      rating,
    }));
  }

  function editTestimonial(item) {
    setForm({
      id: item.id,
      patient_name: item.patient_name || "",
      treatment: item.treatment || "",
      comment: item.comment || "",
      rating: item.rating || 5,
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
      testimonials.length > 0
        ? Math.max(
            ...testimonials.map((item) => item.sort_order || 0)
          ) + 1
        : 1;

    setForm({
      ...emptyForm,
      sort_order: nextOrder,
    });

    setMessage("");
  }

  async function saveTestimonial(e) {
    e.preventDefault();

    if (!form.patient_name.trim()) {
      setMessage("Hasta adı boş bırakılamaz.");
      return;
    }

    if (!form.comment.trim()) {
      setMessage("Yorum metni boş bırakılamaz.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const payload = {
      patient_name: form.patient_name.trim(),
      treatment: form.treatment.trim(),
      comment: form.comment.trim(),
      rating: form.rating,
      sort_order: form.sort_order,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    let error;

    if (form.id) {
      const result = await supabase
        .from("testimonials")
        .update(payload)
        .eq("id", form.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("testimonials")
        .insert(payload);

      error = result.error;
    }

    if (error) {
      console.error(error);
      setMessage("Yorum kaydedilemedi.");
      setSaving(false);
      return;
    }

    setMessage(
      form.id
        ? "✓ Yorum başarıyla güncellendi."
        : "✓ Yeni yorum başarıyla eklendi."
    );

    await loadTestimonials();

    const nextOrder =
      testimonials.length > 0
        ? Math.max(
            ...testimonials.map((item) => item.sort_order || 0)
          ) + 1
        : 1;

    setForm({
      ...emptyForm,
      sort_order: nextOrder,
    });

    setSaving(false);
  }

  async function toggleTestimonial(item) {
    const supabase = createClient();

    const { error } = await supabase
      .from("testimonials")
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

    setMessage(
      item.is_active
        ? "✓ Yorum ana sayfadan gizlendi."
        : "✓ Yorum tekrar yayına alındı."
    );

    await loadTestimonials();
  }

  async function deleteTestimonial(item) {
    const approved = window.confirm(
      `"${item.patient_name}" yorumunu tamamen silmek istediğine emin misin?\n\nBu işlem geri alınamaz.`
    );

    if (!approved) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("testimonials")
      .delete()
      .eq("id", item.id);

    if (error) {
      console.error(error);
      setMessage("Yorum silinemedi.");
      return;
    }

    if (form.id === item.id) {
      resetForm();
    }

    setMessage("✓ Yorum tamamen silindi.");

    await loadTestimonials();
  }

  function renderStars(rating) {
    return Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={index < rating ? "star active" : "star"}
      >
        ★
      </span>
    ));
  }

  if (loading) {
    return (
      <main className="loading">
        <div className="loadingMark">OK</div>
        <p>Hasta yorumları yükleniyor...</p>

        <style jsx>{`
          .loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            background: #f7f5f2;
            color: #30302f;
            font-family: Arial, sans-serif;
          }

          .loadingMark {
            width: 55px;
            height: 55px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 15px;
            background: #30302f;
            color: #c6a47d;
            font-weight: 900;
          }

          .loading p {
            color: #807970;
            font-size: 13px;
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
            className="backButton"
            onClick={() => router.push("/admin/dashboard")}
          >
            ← Dashboard
          </button>

          <div className="brand">
            <strong>OK DENT</strong>
            <span>HASTA YORUMLARI</span>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="viewSite"
        >
          Siteyi Görüntüle ↗
        </a>
      </header>

      <div className="container">
        <div className="pageHeading">
          <div>
            <span className="eyebrow">SOSYAL KANIT</span>
            <h1>Hasta Yorumları</h1>

            <p>
              Hasta deneyimlerini ekle, düzenle, yayından kaldır
              veya tamamen sil.
            </p>
          </div>

          <div className="summary">
            <div>
              <strong>{testimonials.length}</strong>
              <span>Toplam</span>
            </div>

            <div>
              <strong>
                {
                  testimonials.filter((item) => item.is_active)
                    .length
                }
              </strong>
              <span>Yayında</span>
            </div>
          </div>
        </div>

        {message && <div className="message">{message}</div>}

        <div className="layout">
          <div>
            <form
              className="editorCard"
              onSubmit={saveTestimonial}
            >
              <div className="cardHeading">
                <div className="headingIcon">
                  {form.id ? "✎" : "+"}
                </div>

                <div>
                  <h2>
                    {form.id
                      ? "Yorumu Düzenle"
                      : "Yeni Yorum Ekle"}
                  </h2>

                  <p>
                    Ana sayfada gösterilecek hasta yorumunu
                    düzenle.
                  </p>
                </div>
              </div>

              <div className="field">
                <label>Hasta Adı</label>

                <input
                  name="patient_name"
                  value={form.patient_name}
                  onChange={handleChange}
                  placeholder="Örn. Ayşe K."
                />
              </div>

              <div className="field">
                <label>Yapılan Tedavi</label>

                <input
                  name="treatment"
                  value={form.treatment}
                  onChange={handleChange}
                  placeholder="Örn. Gülüş Tasarımı"
                />
              </div>

              <div className="field">
                <label>Hasta Yorumu</label>

                <textarea
                  name="comment"
                  value={form.comment}
                  onChange={handleChange}
                  rows="6"
                  placeholder="Hasta deneyimini buraya yaz..."
                />
              </div>

              <div className="field">
                <label>Puan</label>

                <div className="ratingSelector">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => selectRating(rating)}
                      className={
                        rating <= form.rating
                          ? "ratingStar selected"
                          : "ratingStar"
                      }
                    >
                      ★
                    </button>
                  ))}

                  <span>{form.rating} / 5</span>
                </div>
              </div>

              <div className="twoColumns">
                <div className="field">
                  <label>Gösterim Sırası</label>

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

                  <label className="publishControl">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={form.is_active}
                      onChange={handleChange}
                    />

                    <div>
                      <strong>
                        {form.is_active
                          ? "Yayında"
                          : "Gizli"}
                      </strong>

                      <span>
                        {form.is_active
                          ? "Ana sayfada gösterilebilir."
                          : "Veritabanında kalır, sitede görünmez."}
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
                    İptal / Yeni Yorum
                  </button>
                )}

                <button
                  type="submit"
                  className="saveButton"
                  disabled={saving}
                >
                  {saving
                    ? "Kaydediliyor..."
                    : form.id
                    ? "Yorumu Güncelle"
                    : "Yorumu Ekle"}
                </button>
              </div>
            </form>

            <section className="previewSection">
              <div className="previewTop">
                <span>CANLI ÖNİZLEME</span>

                <b
                  className={
                    form.is_active
                      ? "previewStatus activeStatus"
                      : "previewStatus hiddenStatus"
                  }
                >
                  {form.is_active ? "Yayında" : "Gizli"}
                </b>
              </div>

              <article className="testimonialPreview">
                <div className="quote">“</div>

                <div className="previewStars">
                  {renderStars(form.rating)}
                </div>

                <p>
                  {form.comment ||
                    "Hasta yorumunun nasıl görüneceğini burada görebilirsin."}
                </p>

                <div className="patient">
                  <div className="avatar">
                    {form.patient_name
                      ? form.patient_name
                          .charAt(0)
                          .toUpperCase()
                      : "O"}
                  </div>

                  <div>
                    <strong>
                      {form.patient_name || "Hasta Adı"}
                    </strong>

                    <span>
                      {form.treatment ||
                        "Tedavi bilgisi"}
                    </span>
                  </div>
                </div>
              </article>
            </section>
          </div>

          <section className="listCard">
            <div className="listHeading">
              <div>
                <span className="eyebrow">
                  MEVCUT YORUMLAR
                </span>

                <h2>Yorum Yönetimi</h2>
              </div>

              <span className="totalBadge">
                {testimonials.length}
              </span>
            </div>

            {testimonials.length === 0 ? (
              <div className="empty">
                Henüz hasta yorumu bulunmuyor.
              </div>
            ) : (
              <div className="testimonialList">
                {testimonials.map((item) => (
                  <article
                    key={item.id}
                    className={`testimonialItem ${
                      form.id === item.id ? "selectedItem" : ""
                    }`}
                  >
                    <div className="itemHeader">
                      <div className="patientMini">
                        <div className="miniAvatar">
                          {item.patient_name
                            ?.charAt(0)
                            ?.toUpperCase() || "O"}
                        </div>

                        <div>
                          <strong>{item.patient_name}</strong>

                          <span>
                            {item.treatment ||
                              "Tedavi belirtilmedi"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={
                          item.is_active
                            ? "status activeStatus"
                            : "status hiddenStatus"
                        }
                      >
                        {item.is_active
                          ? "Yayında"
                          : "Gizli"}
                      </span>
                    </div>

                    <div className="itemStars">
                      {renderStars(item.rating)}
                    </div>

                    <p className="itemComment">
                      “{item.comment}”
                    </p>

                    <div className="itemBottom">
                      <span>
                        Gösterim sırası:{" "}
                        <strong>{item.sort_order}</strong>
                      </span>

                      <div className="actions">
                        <button
                          type="button"
                          className="editButton"
                          onClick={() =>
                            editTestimonial(item)
                          }
                        >
                          Düzenle
                        </button>

                        <button
                          type="button"
                          className="hideButton"
                          onClick={() =>
                            toggleTestimonial(item)
                          }
                        >
                          {item.is_active
                            ? "Gizle"
                            : "Yayınla"}
                        </button>

                        <button
                          type="button"
                          className="deleteButton"
                          onClick={() =>
                            deleteTestimonial(item)
                          }
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          background: #f7f5f2;
          color: #30302f;
          font-family: Arial, Helvetica, sans-serif;
        }

        .topbar {
          min-height: 84px;
          padding: 0 48px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #30302f;
          color: white;
        }

        .topLeft {
          display: flex;
          align-items: center;
          gap: 27px;
        }

        .backButton {
          padding: 11px 15px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          color: white;
          cursor: pointer;
        }

        .brand {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .brand strong {
          font-size: 19px;
          letter-spacing: 1px;
        }

        .brand span {
          color: #c8aa86;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 2px;
        }

        .viewSite {
          padding: 11px 17px;
          border-radius: 11px;
          background: #c6a47d;
          color: #30302f;
          text-decoration: none;
          font-size: 12px;
          font-weight: 900;
        }

        .container {
          max-width: 1350px;
          margin: 0 auto;
          padding: 45px 24px 90px;
        }

        .pageHeading {
          margin-bottom: 28px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 30px;
        }

        .eyebrow {
          color: #9e7d58;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.7px;
        }

        .pageHeading h1 {
          margin: 9px 0 8px;
          font-size: 39px;
          letter-spacing: -1.6px;
        }

        .pageHeading p {
          margin: 0;
          color: #7e776f;
          font-size: 13px;
          line-height: 1.6;
        }

        .summary {
          display: flex;
          gap: 9px;
        }

        .summary > div {
          min-width: 95px;
          padding: 13px;
          display: flex;
          flex-direction: column;
          border: 1px solid #e4dbd0;
          border-radius: 13px;
          background: white;
        }

        .summary strong {
          font-size: 21px;
        }

        .summary span {
          margin-top: 3px;
          color: #958a7e;
          font-size: 9px;
        }

        .message {
          margin-bottom: 22px;
          padding: 14px 17px;
          border: 1px solid #decdb8;
          border-radius: 12px;
          background: #f2e8dc;
          color: #765d40;
          font-size: 12px;
        }

        .layout {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 24px;
          align-items: start;
        }

        .editorCard,
        .previewSection,
        .listCard {
          padding: 27px;
          border: 1px solid #e6ded4;
          border-radius: 20px;
          background: white;
          box-shadow: 0 12px 35px rgba(45, 40, 35, 0.04);
        }

        .editorCard {
          margin-bottom: 24px;
        }

        .cardHeading {
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .headingIcon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #eee3d5;
          color: #95714c;
          font-weight: 900;
        }

        .cardHeading h2 {
          margin: 0 0 4px;
          font-size: 20px;
        }

        .cardHeading p {
          margin: 0;
          color: #928980;
          font-size: 11px;
        }

        .field {
          margin-bottom: 18px;
        }

        .field > label {
          display: block;
          margin-bottom: 8px;
          font-size: 12px;
          font-weight: 800;
        }

        input,
        textarea {
          width: 100%;
          padding: 13px 14px;
          border: 1px solid #ddd5cb;
          border-radius: 11px;
          outline: none;
          background: #fcfbf9;
          color: #30302f;
          font-family: inherit;
          font-size: 13px;
        }

        input:focus,
        textarea:focus {
          border-color: #b79772;
          background: white;
        }

        textarea {
          resize: vertical;
          line-height: 1.6;
        }

        .ratingSelector {
          min-height: 55px;
          padding: 10px 13px;
          display: flex;
          align-items: center;
          gap: 4px;
          border-radius: 12px;
          background: #f8f4ef;
        }

        .ratingStar {
          padding: 2px;
          border: 0;
          background: transparent;
          color: #d8d1c8;
          cursor: pointer;
          font-size: 25px;
          transition: 0.15s;
        }

        .ratingStar.selected {
          color: #bd9668;
        }

        .ratingStar:hover {
          transform: scale(1.1);
        }

        .ratingSelector > span {
          margin-left: 10px;
          color: #82776c;
          font-size: 11px;
          font-weight: 800;
        }

        .twoColumns {
          display: grid;
          grid-template-columns: 0.6fr 1.4fr;
          gap: 15px;
        }

        .publishControl {
          min-height: 51px;
          margin: 0 !important;
          padding: 10px 12px;
          display: flex !important;
          align-items: center;
          gap: 10px;
          border-radius: 11px;
          background: #f8f4ef;
          cursor: pointer;
        }

        .publishControl input {
          width: auto;
        }

        .publishControl > div {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .publishControl strong {
          font-size: 11px;
        }

        .publishControl span {
          color: #8a8178;
          font-size: 9px;
        }

        .formActions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .saveButton,
        .cancelButton {
          padding: 13px 17px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 900;
        }

        .saveButton {
          border: 0;
          background: #30302f;
          color: white;
        }

        .saveButton:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .cancelButton {
          border: 1px solid #ded5ca;
          background: white;
          color: #71675d;
        }

        .previewTop {
          margin-bottom: 17px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .previewTop > span {
          color: #9c7a55;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.6px;
        }

        .testimonialPreview {
          position: relative;
          overflow: hidden;
          min-height: 310px;
          padding: 35px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          border-radius: 19px;
          background: #30302f;
          color: white;
        }

        .quote {
          position: absolute;
          top: -18px;
          right: 20px;
          color: rgba(198, 164, 125, 0.18);
          font-family: Georgia, serif;
          font-size: 140px;
          line-height: 1;
        }

        .previewStars,
        .itemStars {
          position: relative;
          z-index: 2;
          display: flex;
          gap: 2px;
        }

        :global(.star) {
          color: #d5cec6;
          font-size: 15px;
        }

        :global(.star.active) {
          color: #c6a47d;
        }

        .testimonialPreview > p {
          position: relative;
          z-index: 2;
          margin: 20px 0 28px;
          color: #e1ddd8;
          font-family: Georgia, serif;
          font-size: 18px;
          line-height: 1.65;
        }

        .patient {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .avatar,
        .miniAvatar {
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #c6a47d;
          color: #30302f;
          font-weight: 900;
        }

        .avatar {
          width: 42px;
          height: 42px;
        }

        .patient > div:last-child,
        .patientMini > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .patient strong {
          font-size: 12px;
        }

        .patient span {
          color: #c4bdb5;
          font-size: 9px;
        }

        .listHeading {
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .listHeading h2 {
          margin: 7px 0 0;
          font-size: 21px;
        }

        .totalBadge {
          width: 43px;
          height: 43px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          background: #eee3d5;
          color: #8b6845;
          font-weight: 900;
        }

        .testimonialList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .testimonialItem {
          padding: 17px;
          border: 1px solid #e6ded4;
          border-radius: 15px;
          background: #fdfcfb;
        }

        .testimonialItem.selectedItem {
          border-color: #b99b78;
          background: #fbf7f2;
        }

        .itemHeader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .patientMini {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .miniAvatar {
          width: 37px;
          height: 37px;
          font-size: 12px;
        }

        .patientMini strong {
          font-size: 12px;
        }

        .patientMini span {
          color: #9a8d80;
          font-size: 9px;
        }

        .status,
        .previewStatus {
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
        }

        .activeStatus {
          background: #eee3d5;
          color: #81603f;
        }

        .hiddenStatus {
          background: #f3e4e3;
          color: #91514d;
        }

        .itemStars {
          margin-top: 14px;
        }

        .itemComment {
          margin: 11px 0 15px;
          color: #68615a;
          font-family: Georgia, serif;
          font-size: 12px;
          line-height: 1.65;
        }

        .itemBottom {
          padding-top: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          border-top: 1px solid #eee8e1;
        }

        .itemBottom > span {
          color: #93897f;
          font-size: 9px;
        }

        .actions {
          display: flex;
          gap: 6px;
        }

        .actions button {
          padding: 7px 9px;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
        }

        .editButton {
          background: #30302f;
          color: white;
        }

        .hideButton {
          background: #eee5da;
          color: #755d42;
        }

        .deleteButton {
          background: #f5e2df;
          color: #9a443d;
        }

        .deleteButton:hover {
          background: #9a443d;
          color: white;
        }

        .empty {
          padding: 40px 20px;
          border: 1px dashed #ddd4ca;
          border-radius: 14px;
          color: #8f867d;
          text-align: center;
          font-size: 12px;
        }

        @media (max-width: 1050px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .topbar {
            padding: 0 18px;
          }

          .brand {
            display: none;
          }

          .pageHeading {
            align-items: flex-start;
            flex-direction: column;
          }

          .twoColumns {
            grid-template-columns: 1fr;
          }

          .itemBottom {
            align-items: flex-start;
            flex-direction: column;
          }

          .actions {
            width: 100%;
          }

          .actions button {
            flex: 1;
          }
        }

        @media (max-width: 500px) {
          .container {
            padding: 30px 14px 70px;
          }

          .viewSite {
            display: none;
          }

          .editorCard,
          .previewSection,
          .listCard {
            padding: 19px;
          }

          .pageHeading h1 {
            font-size: 31px;
          }

          .formActions {
            flex-direction: column;
          }

          .formActions button {
            width: 100%;
          }

          .testimonialPreview {
            padding: 25px;
          }

          .testimonialPreview > p {
            font-size: 16px;
          }

          .itemHeader {
            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}