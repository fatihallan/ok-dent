"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabaseClient";

const emptyPageSettings = {
  breadcrumb_home_text: 'Ana Sayfa',
  breadcrumb_current_text: 'Doktorlarımız',
  hero_eyebrow: 'OK DENT HEKİM KADROSU',
  hero_title_first: 'Gülüşünüz,',
  hero_title_emphasis: 'uzman ellere',
  hero_title_last: 'emanet.',
  doctor_count_label: 'Aktif Hekim',
  hero_description: 'Bilimsel yaklaşımı, modern diş hekimliği uygulamalarını ve kişiye özel tedavi planlamasını bir araya getiren hekim kadromuzla tanışın.',
  default_specialty: 'Diş Hekimliği',
  default_doctor_title: 'Diş Hekimi',
  doctor_button_text: 'Randevu Oluştur',
  doctor_button_link: '/randevu',
  doctor_button_arrow_text: '→',
  doctor_card_mark: 'OK',
  empty_mark: 'OK',
  empty_title: 'Hekim kadromuz güncelleniyor.',
  empty_description: 'Aktif hekimlerimiz kısa süre içerisinde burada yayınlanacaktır.',
  cta_eyebrow: 'OK DENT',
  cta_title: 'Hangi hekime başvuracağınızdan emin değil misiniz?',
  cta_description: 'İhtiyacınızı bize iletin. Uygun tedavi alanı ve randevu süreci konusunda size yardımcı olalım.',
  cta_button_text: 'Randevu Oluştur',
  cta_button_link: '/randevu',
  cta_button_arrow_text: '→',
  phone_button_text: 'Telefonla Ara',
  whatsapp_button_text: 'WhatsApp',
  whatsapp_external_mark: '↗',
  loading_mark: 'OK',
  loading_text: 'Hekimlerimiz yükleniyor...',
  is_active: true,
};

const emptyForm = {
  id: null,
  full_name: "",
  title: "",
  specialty: "",
  description: "",
  image_url: "",
  button_text: "Detaylı Bilgi",
  button_link: "",
  sort_order: 1,
  is_active: true,
};

export default function DoctorsPage() {
  const router = useRouter();

  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [pageSettings, setPageSettings] = useState(emptyPageSettings);
  const [savingPage, setSavingPage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDoctors();
    loadPageSettings();
  }, []);

  async function loadDoctors() {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("doctors")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("Doktorlar yüklenemedi.");
    } else {
      setDoctors(data || []);
    }

    setLoading(false);
  }

  async function loadPageSettings() {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("doctors_page_settings")
      .select("*")
      .eq("setting_key", "main")
      .single();

    if (error) {
      console.error(error);
      setMessage("Doktorlar sayfa ayarları yüklenemedi.");
      return;
    }

    setPageSettings({ ...emptyPageSettings, ...(data || {}) });
  }

  function handlePageChange(e) {
    const { name, value, type, checked } = e.target;
    setPageSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function savePageSettings(e) {
    e.preventDefault();
    setSavingPage(true);
    setMessage("");

    const supabase = createClient();
    const payload = {
      ...pageSettings,
      setting_key: "main",
      updated_at: new Date().toISOString(),
    };
    delete payload.id;

    const { error } = await supabase
      .from("doctors_page_settings")
      .upsert(payload, { onConflict: "setting_key" });

    if (error) {
      console.error(error);
      setMessage("Doktorlar sayfa ayarları kaydedilemedi.");
    } else {
      setMessage("✓ Doktorlarımız sayfa ayarları kaydedildi.");
      await loadPageSettings();
    }
    setSavingPage(false);
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

  function editDoctor(doctor) {
    setForm({
      id: doctor.id,
      full_name: doctor.full_name || "",
      title: doctor.title || "",
      specialty: doctor.specialty || "",
      description: doctor.description || "",
      image_url: doctor.image_url || "",
      button_text: doctor.button_text || "Detaylı Bilgi",
      button_link: doctor.button_link || "",
      sort_order: doctor.sort_order ?? 1,
      is_active: doctor.is_active ?? true,
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function resetForm() {
    const nextOrder =
      doctors.length > 0
        ? Math.max(...doctors.map((doctor) => doctor.sort_order || 0)) + 1
        : 1;

    setForm({
      ...emptyForm,
      sort_order: nextOrder,
    });

    setMessage("");
  }

  async function uploadDoctorImage(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Lütfen bir görsel dosyası seç.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Doktor fotoğrafı en fazla 8 MB olabilir.");
      return;
    }

    setUploadingImage(true);
    setMessage("Doktor fotoğrafı yükleniyor...");

    const supabase = createClient();

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `doctor-${Date.now()}.${extension}`;
      const filePath = `doctors/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("site-assets")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error(uploadError);
        setMessage(
          "Doktor fotoğrafı yüklenemedi. Storage izinlerini kontrol et."
        );
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("site-assets")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData?.publicUrl;

      if (!publicUrl) {
        setMessage("Fotoğraf bağlantısı oluşturulamadı.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        image_url: publicUrl,
      }));

      setMessage(
        "✓ Doktor fotoğrafı yüklendi. Şimdi doktoru kaydet."
      );
    } catch (error) {
      console.error(error);
      setMessage("Fotoğraf yüklenirken beklenmeyen bir hata oluştu.");
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
      "Fotoğraf kaldırılmak üzere işaretlendi. Kaydetmeyi unutma."
    );
  }

  async function saveDoctor(e) {
    e.preventDefault();

    if (!form.full_name.trim()) {
      setMessage("Doktor adı boş bırakılamaz.");
      return;
    }

    setSaving(true);
    setMessage("");

    const supabase = createClient();

    const payload = {
      full_name: form.full_name.trim(),
      title: form.title,
      specialty: form.specialty,
      description: form.description,
      image_url: form.image_url,
      button_text: form.button_text,
      button_link: form.button_link,
      sort_order: form.sort_order,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    let error = null;

    if (form.id) {
      const result = await supabase
        .from("doctors")
        .update(payload)
        .eq("id", form.id);

      error = result.error;
    } else {
      const result = await supabase
        .from("doctors")
        .insert(payload);

      error = result.error;
    }

    if (error) {
      console.error(error);
      setMessage("Doktor kaydedilemedi.");
      setSaving(false);
      return;
    }

    setMessage(
      form.id
        ? "✓ Doktor başarıyla güncellendi."
        : "✓ Yeni doktor başarıyla eklendi."
    );

    await loadDoctors();

    setForm({
      ...emptyForm,
      sort_order: doctors.length + 1,
    });

    setSaving(false);
  }

  async function deleteDoctor(id) {
    const approved = window.confirm(
      "Bu doktoru kalıcı olarak silmek istediğine emin misin?"
    );

    if (!approved) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("doctors")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Doktor silinemedi.");
      return;
    }

    if (form.id === id) {
      resetForm();
    }

    setMessage("✓ Doktor silindi.");
    await loadDoctors();
  }

  async function toggleDoctor(doctor) {
    const supabase = createClient();

    const { error } = await supabase
      .from("doctors")
      .update({
        is_active: !doctor.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", doctor.id);

    if (error) {
      console.error(error);
      setMessage("Doktorun yayın durumu değiştirilemedi.");
      return;
    }

    await loadDoctors();
  }

  if (loading) {
    return (
      <main className="loadingPage">
        Doktorlar yükleniyor...

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
            <small>DOKTORLAR YÖNETİMİ</small>
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
          <span className="label">EKİP YÖNETİMİ</span>

          <h1>Doktorlarımız</h1>

          <p>
            Doktorları ekle, düzenle, fotoğraflarını yükle ve
            yayın durumlarını kontrol et.
          </p>
        </div>

        {message && <div className="message">{message}</div>}

        <form onSubmit={savePageSettings}>
          <section className="card pageSettingsCard">
            <div className="cardTitle">
              <span className="cardIcon">Aa</span>
              <div>
                <h2>Doktorlarımız Sayfa İçerikleri</h2>
                <p>Ziyaretçi sayfasındaki sabit metinleri ve butonları buradan yönet.</p>
              </div>
            </div>
            <div className="grid2">
              <Field label="Breadcrumb Ana Sayfa" name="breadcrumb_home_text" value={pageSettings.breadcrumb_home_text || ""} onChange={handlePageChange} placeholder="Ana Sayfa" />
              <Field label="Breadcrumb Mevcut Sayfa" name="breadcrumb_current_text" value={pageSettings.breadcrumb_current_text || ""} onChange={handlePageChange} placeholder="Doktorlarımız" />
              <Field label="Hero Üst Başlık" name="hero_eyebrow" value={pageSettings.hero_eyebrow || ""} onChange={handlePageChange} placeholder="OK DENT HEKİM KADROSU" />
              <Field label="Hero Başlık 1" name="hero_title_first" value={pageSettings.hero_title_first || ""} onChange={handlePageChange} placeholder="Gülüşünüz," />
              <Field label="Hero Vurgulu Başlık" name="hero_title_emphasis" value={pageSettings.hero_title_emphasis || ""} onChange={handlePageChange} placeholder="uzman ellere" />
              <Field label="Hero Başlık Sonu" name="hero_title_last" value={pageSettings.hero_title_last || ""} onChange={handlePageChange} placeholder="emanet." />
              <Field label="Hekim Sayısı Etiketi" name="doctor_count_label" value={pageSettings.doctor_count_label || ""} onChange={handlePageChange} placeholder="Aktif Hekim" />
              <Field label="Hero Açıklama" name="hero_description" value={pageSettings.hero_description || ""} onChange={handlePageChange} placeholder="Bilimsel yaklaşımı, modern diş hekimliği uygulamalarını ve kişiye özel tedavi planlamasını bir araya getiren hekim kadromuzla tanışın." />
              <Field label="Varsayılan Uzmanlık" name="default_specialty" value={pageSettings.default_specialty || ""} onChange={handlePageChange} placeholder="Diş Hekimliği" />
              <Field label="Varsayılan Ünvan" name="default_doctor_title" value={pageSettings.default_doctor_title || ""} onChange={handlePageChange} placeholder="Diş Hekimi" />
              <Field label="Doktor Kartı Buton Yazısı" name="doctor_button_text" value={pageSettings.doctor_button_text || ""} onChange={handlePageChange} placeholder="Randevu Oluştur" />
              <Field label="Doktor Kartı Buton Linki" name="doctor_button_link" value={pageSettings.doctor_button_link || ""} onChange={handlePageChange} placeholder="/randevu" />
              <Field label="Doktor Kartı Buton İşareti" name="doctor_button_arrow_text" value={pageSettings.doctor_button_arrow_text || ""} onChange={handlePageChange} placeholder="→" />
              <Field label="Doktor Kartı İşareti" name="doctor_card_mark" value={pageSettings.doctor_card_mark || ""} onChange={handlePageChange} placeholder="OK" />
              <Field label="Boş Durum İşareti" name="empty_mark" value={pageSettings.empty_mark || ""} onChange={handlePageChange} placeholder="OK" />
              <Field label="Boş Durum Başlığı" name="empty_title" value={pageSettings.empty_title || ""} onChange={handlePageChange} placeholder="Hekim kadromuz güncelleniyor." />
              <Field label="Boş Durum Açıklaması" name="empty_description" value={pageSettings.empty_description || ""} onChange={handlePageChange} placeholder="Aktif hekimlerimiz kısa süre içerisinde burada yayınlanacaktır." />
              <Field label="CTA Üst Başlık" name="cta_eyebrow" value={pageSettings.cta_eyebrow || ""} onChange={handlePageChange} placeholder="OK DENT" />
              <Field label="CTA Başlık" name="cta_title" value={pageSettings.cta_title || ""} onChange={handlePageChange} placeholder="Hangi hekime başvuracağınızdan emin değil misiniz?" />
              <Field label="CTA Açıklama" name="cta_description" value={pageSettings.cta_description || ""} onChange={handlePageChange} placeholder="İhtiyacınızı bize iletin. Uygun tedavi alanı ve randevu süreci konusunda size yardımcı olalım." />
              <Field label="CTA Buton Yazısı" name="cta_button_text" value={pageSettings.cta_button_text || ""} onChange={handlePageChange} placeholder="Randevu Oluştur" />
              <Field label="CTA Buton Linki" name="cta_button_link" value={pageSettings.cta_button_link || ""} onChange={handlePageChange} placeholder="/randevu" />
              <Field label="CTA Buton İşareti" name="cta_button_arrow_text" value={pageSettings.cta_button_arrow_text || ""} onChange={handlePageChange} placeholder="→" />
              <Field label="Telefon Buton Yazısı" name="phone_button_text" value={pageSettings.phone_button_text || ""} onChange={handlePageChange} placeholder="Telefonla Ara" />
              <Field label="WhatsApp Buton Yazısı" name="whatsapp_button_text" value={pageSettings.whatsapp_button_text || ""} onChange={handlePageChange} placeholder="WhatsApp" />
              <Field label="WhatsApp Dış Link İşareti" name="whatsapp_external_mark" value={pageSettings.whatsapp_external_mark || ""} onChange={handlePageChange} placeholder="↗" />
              <Field label="Yükleme İşareti" name="loading_mark" value={pageSettings.loading_mark || ""} onChange={handlePageChange} placeholder="OK" />
              <Field label="Yükleme Yazısı" name="loading_text" value={pageSettings.loading_text || ""} onChange={handlePageChange} placeholder="Hekimlerimiz yükleniyor..." />
            </div>
            <div className="field">
              <label>Sayfa Yayın Durumu</label>
              <label className="switchRow">
                <input type="checkbox" name="is_active" checked={pageSettings.is_active !== false} onChange={handlePageChange} />
                <div><strong>{pageSettings.is_active !== false ? "Yayında" : "Gizli"}</strong><span>Doktorlarımız sayfasının genel yayın durumunu belirler.</span></div>
              </label>
            </div>
            <div className="formActions">
              <button type="submit" className="saveButton" disabled={savingPage}>
                {savingPage ? "Kaydediliyor..." : "Sayfa İçeriklerini Kaydet"}
              </button>
            </div>
          </section>
        </form>

        <div className="layout">
          <form onSubmit={saveDoctor}>
            <section className="card">
              <div className="cardTitle">
                <span className="cardIcon">
                  {form.id ? "✎" : "+"}
                </span>

                <div>
                  <h2>
                    {form.id ? "Doktoru Düzenle" : "Yeni Doktor"}
                  </h2>

                  <p>
                    Doktor bilgilerini ve profil fotoğrafını yönet.
                  </p>
                </div>
              </div>

              <Field
                label="Ad Soyad"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Örn. Dt. Ahmet Yılmaz"
              />

              <div className="grid2">
                <Field
                  label="Ünvan"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Diş Hekimi"
                />

                <Field
                  label="Uzmanlık"
                  name="specialty"
                  value={form.specialty}
                  onChange={handleChange}
                  placeholder="Estetik Diş Hekimliği"
                />
              </div>

              <div className="field">
                <label>Kısa Açıklama</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Doktor hakkında kısa bilgi..."
                />
              </div>

              <div className="field">
                <label>Doktor Fotoğrafı</label>

                <div className="uploadArea">
                  <div className="uploadIcon">↑</div>

                  <div className="uploadText">
                    <strong>
                      {uploadingImage
                        ? "Fotoğraf yükleniyor..."
                        : "Profil fotoğrafı yükle"}
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
                      onChange={uploadDoctorImage}
                      disabled={uploadingImage}
                      hidden
                    />
                  </label>
                </div>

                {form.image_url && (
                  <>
                    <div className="currentFile">
                      <span>✓ Doktor fotoğrafı hazır</span>

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
                        alt="Doktor önizleme"
                      />
                    </div>
                  </>
                )}

                {!form.image_url && (
                  <div className="emptyImage">
                    Henüz doktor fotoğrafı yüklenmedi.
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
                  label="Buton Linki"
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
                    İptal / Yeni Doktor
                  </button>
                )}

                <button
                  type="submit"
                  className="saveButton"
                  disabled={saving || uploadingImage}
                >
                  {saving
                    ? "Kaydediliyor..."
                    : form.id
                    ? "Doktoru Güncelle"
                    : "Yeni Doktor Ekle"}
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

              <div className="doctorPreview">
                <div className="doctorPhoto">
                  {form.image_url ? (
                    <img
                      src={form.image_url}
                      alt={form.full_name}
                    />
                  ) : (
                    <span>Fotoğraf</span>
                  )}
                </div>

                <div className="doctorPreviewInfo">
                  <span className="specialty">
                    {form.specialty || "Uzmanlık Alanı"}
                  </span>

                  <h3>
                    {form.full_name || "Doktor Ad Soyad"}
                  </h3>

                  <strong>
                    {form.title || "Diş Hekimi"}
                  </strong>

                  <p>
                    {form.description ||
                      "Doktor hakkında kısa açıklama burada görünecek."}
                  </p>

                  {form.button_text && (
                    <span className="previewButton">
                      {form.button_text} →
                    </span>
                  )}
                </div>
              </div>
            </section>
          </form>

          <div>
            <section className="doctorsCard">
              <div className="listHeader">
                <div>
                  <span className="label">MEVCUT EKİP</span>
                  <h2>Doktor Listesi</h2>
                </div>

                <div className="count">
                  {doctors.length}
                </div>
              </div>

              <div className="doctorList">
                {doctors.map((doctor) => (
                  <article
                    className={`doctorItem ${
                      form.id === doctor.id ? "selected" : ""
                    }`}
                    key={doctor.id}
                  >
                    <div className="thumb">
                      {doctor.image_url ? (
                        <img
                          src={doctor.image_url}
                          alt={doctor.full_name}
                        />
                      ) : (
                        <span>
                          {doctor.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "D"}
                        </span>
                      )}
                    </div>

                    <div className="doctorInfo">
                      <div className="doctorTop">
                        <strong>{doctor.full_name}</strong>

                        <span
                          className={`statusBadge ${
                            doctor.is_active
                              ? "active"
                              : "passive"
                          }`}
                        >
                          {doctor.is_active
                            ? "Yayında"
                            : "Gizli"}
                        </span>
                      </div>

                      <span className="doctorTitle">
                        {doctor.title}
                      </span>

                      <span className="doctorSpecialty">
                        {doctor.specialty}
                      </span>

                      <div className="meta">
                        <span>Sıra: {doctor.sort_order}</span>

                        {doctor.image_url && (
                          <span>Fotoğraf ✓</span>
                        )}
                      </div>
                    </div>

                    <div className="actions">
                      <button
                        type="button"
                        className="editButton"
                        onClick={() => editDoctor(doctor)}
                      >
                        Düzenle
                      </button>

                      <button
                        type="button"
                        className="visibilityButton"
                        onClick={() => toggleDoctor(doctor)}
                      >
                        {doctor.is_active
                          ? "Gizle"
                          : "Yayınla"}
                      </button>

                      <button
                        type="button"
                        className="deleteButton"
                        onClick={() => deleteDoctor(doctor.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="storageCard">
              <span className="storageLabel">
                SUPABASE STORAGE
              </span>

              <h3>Doktor fotoğrafları hazır</h3>

              <p>
                Yüklenen görseller{" "}
                <strong>site-assets / doctors</strong>{" "}
                klasöründe tutulur.
              </p>

              <div className="storageRow">
                <span>Bucket</span>
                <b>site-assets</b>
              </div>

              <div className="storageRow">
                <span>Klasör</span>
                <b>doctors</b>
              </div>

              <div className="storageRow">
                <span>Doktor sayısı</span>
                <b>{doctors.length}</b>
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
        .doctorsCard {
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
          background: #eee2d3;
          color: #8a6846;
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
          aspect-ratio: 4 / 5;
          max-height: 420px;
          overflow: hidden;
          background: #eef4f1;
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
          border: 1px solid #e7dfd5;
          color: #817970;
          padding: 14px;
          border-radius: 11px;
          font-size: 12px;
        }

        .switchRow {
          min-height: 51px;
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
          justify-content: space-between;
          align-items: center;
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

        .live {
          background: #eee2d3;
          color: #276e58;
        }

        .hidden {
          background: #f3e5e5;
          color: #915454;
        }

        .doctorPreview {
          overflow: hidden;
          background: #f5f8f7;
          border-radius: 18px;
        }

        .doctorPhoto {
          height: 340px;
          background: #dfe9e5;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #788a84;
        }

        .doctorPhoto img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .doctorPreviewInfo {
          padding: 24px;
        }

        .specialty {
          color: #548175;
          font-size: 11px;
          font-weight: 800;
        }

        .doctorPreviewInfo h3 {
          font-size: 25px;
          margin: 9px 0 5px;
        }

        .doctorPreviewInfo strong {
          font-size: 12px;
          color: #647a73;
        }

        .doctorPreviewInfo p {
          color: #71817c;
          font-size: 12px;
          line-height: 1.7;
        }

        .previewButton {
          font-size: 12px;
          font-weight: 900;
          color: #295f50;
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
          background: #e5f3ed;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
        }

        .doctorList {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .doctorItem {
          border: 1px solid #e0e8e5;
          border-radius: 15px;
          padding: 13px;
          display: grid;
          grid-template-columns: 76px 1fr auto;
          gap: 14px;
          align-items: center;
          background: #fbfcfc;
        }

        .doctorItem.selected {
          border-color: #7fb9a7;
          background: #f3faf7;
        }

        .thumb {
          width: 76px;
          height: 88px;
          border-radius: 12px;
          overflow: hidden;
          background: #e6efeb;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          font-weight: 900;
        }

        .thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .doctorTop {
          display: flex;
          align-items: center;
          gap: 9px;
          flex-wrap: wrap;
        }

        .doctorTop strong {
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

        .doctorTitle {
          display: block;
          color: #526d64;
          font-size: 11px;
          margin-top: 6px;
          font-weight: 800;
        }

        .doctorSpecialty {
          display: block;
          color: #798984;
          font-size: 10px;
          margin-top: 3px;
        }

        .meta {
          display: flex;
          gap: 12px;
          margin-top: 8px;
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
          color: #746f68;
          font-size: 12px;
          line-height: 1.6;
        }

        .storageRow {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-top: 1px solid #e7dfd5;
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

          .doctorItem {
            grid-template-columns: 70px 1fr;
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
          .doctorsCard {
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
}) {
  return (
    <div className="field">
      <label>{label}</label>

      <input
        type="text"
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