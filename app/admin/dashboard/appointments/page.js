"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../../../lib/supabaseClient";

const STATUS_OPTIONS = [
  {
    value: "new",
    label: "Yeni Talep",
  },
  {
    value: "confirmed",
    label: "Onaylandı",
  },
  {
    value: "completed",
    label: "Tamamlandı",
  },
  {
    value: "cancelled",
    label: "İptal",
  },
];

export default function AppointmentsAdminPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedAppointment, setSelectedAppointment] =
    useState(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAppointments();
  }, []);

  async function loadAppointments() {
    setLoading(true);
    setMessage("");

    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setAppointments(data || []);
    } catch (error) {
      console.error("Randevular yüklenemedi:", error);

      setMessage(
        "Randevu talepleri yüklenirken bir hata oluştu."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, newStatus) {
    setUpdatingId(id);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("appointments")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        throw error;
      }

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === id
            ? {
                ...appointment,
                status: newStatus,
                updated_at: new Date().toISOString(),
              }
            : appointment
        )
      );

      if (selectedAppointment?.id === id) {
        setSelectedAppointment((current) => ({
          ...current,
          status: newStatus,
        }));
      }

      setMessage("Randevu durumu güncellendi.");
    } catch (error) {
      console.error("Durum güncellenemedi:", error);

      setMessage("Randevu durumu güncellenemedi.");
    } finally {
      setUpdatingId(null);
    }
  }

  async function deleteAppointment(appointment) {
    const approved = window.confirm(
      `${appointment.full_name} isimli kişinin randevu talebi silinsin mi?\n\nBu işlem geri alınamaz.`
    );

    if (!approved) {
      return;
    }

    setDeletingId(appointment.id);
    setMessage("");

    try {
      const supabase = createClient();

      const { error } = await supabase
        .from("appointments")
        .delete()
        .eq("id", appointment.id);

      if (error) {
        throw error;
      }

      setAppointments((current) =>
        current.filter((item) => item.id !== appointment.id)
      );

      if (selectedAppointment?.id === appointment.id) {
        setSelectedAppointment(null);
      }

      setMessage("Randevu talebi silindi.");
    } catch (error) {
      console.error("Randevu silinemedi:", error);

      setMessage("Randevu silinemedi.");
    } finally {
      setDeletingId(null);
    }
  }

  function getStatusLabel(status) {
    return (
      STATUS_OPTIONS.find((item) => item.value === status)
        ?.label || "Bilinmiyor"
    );
  }

  function formatDate(date) {
    if (!date) {
      return "-";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  }

  function formatTime(time) {
    if (!time) {
      return "-";
    }

    return time.slice(0, 5);
  }

  function formatCreatedAt(value) {
    if (!value) {
      return "-";
    }

    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  function phoneHref(phone) {
    if (!phone) {
      return "#";
    }

    return `tel:${phone.replace(/[^\d+]/g, "")}`;
  }

  function whatsappHref(phone) {
    if (!phone) {
      return "#";
    }

    let clean = phone.replace(/\D/g, "");

    if (clean.startsWith("0")) {
      clean = `90${clean.substring(1)}`;
    }

    return `https://wa.me/${clean}`;
  }

  const filteredAppointments = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLocaleLowerCase("tr-TR");

    return appointments.filter((appointment) => {
      const matchesStatus =
        statusFilter === "all" ||
        appointment.status === statusFilter;

      if (!matchesStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchable = [
        appointment.full_name,
        appointment.phone,
        appointment.email,
        appointment.doctor_name,
        appointment.treatment,
        appointment.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("tr-TR");

      return searchable.includes(normalizedSearch);
    });
  }, [appointments, search, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: appointments.length,

      new: appointments.filter(
        (appointment) => appointment.status === "new"
      ).length,

      confirmed: appointments.filter(
        (appointment) => appointment.status === "confirmed"
      ).length,

      completed: appointments.filter(
        (appointment) => appointment.status === "completed"
      ).length,

      cancelled: appointments.filter(
        (appointment) => appointment.status === "cancelled"
      ).length,
    };
  }, [appointments]);

  if (loading) {
    return (
      <div className="loadingScreen">
        <div className="loadingLogo">OK</div>
        <strong>Randevular yükleniyor...</strong>

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

          .loadingLogo {
            width: 56px;
            height: 56px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 14px;
            background: #30302f;
            color: #c6a47d;
            font-weight: 900;
          }

          strong {
            font-size: 12px;
          }
        `}</style>
      </div>
    );
  }

  return (
    <main>
      <div className="pageHeader">
        <div>
          <span className="eyebrow">OK DENT YÖNETİM</span>

          <h1>Randevu Talepleri</h1>

          <p>
            Web sitesinden gönderilen randevu taleplerini\n            görüntüleyin, durumlarını güncelleyin ve hastalarla iletişime geçin.
          </p>
        </div>

        <button
          type="button"
          className="refreshButton"
          onClick={loadAppointments}
        >
          Yenile
          <span>↻</span>
        </button>
      </div>

      {/* STATS */}

      <section className="statsGrid">
        <button
          type="button"
          className={
            statusFilter === "all"
              ? "statCard activeStat"
              : "statCard"
          }
          onClick={() => setStatusFilter("all")}
        >
          <span>TOPLAM</span>
          <strong>{stats.total}</strong>
          <small>Tüm randevu talepleri</small>
        </button>

        <button
          type="button"
          className={
            statusFilter === "new"
              ? "statCard activeStat"
              : "statCard"
          }
          onClick={() => setStatusFilter("new")}
        >
          <span>YENİ</span>
          <strong>{stats.new}</strong>
          <small>İncelenmeyi bekleyen</small>
        </button>

        <button
          type="button"
          className={
            statusFilter === "confirmed"
              ? "statCard activeStat"
              : "statCard"
          }
          onClick={() => setStatusFilter("confirmed")}
        >
          <span>ONAYLANDI</span>
          <strong>{stats.confirmed}</strong>
          <small>Kesinleşen randevular</small>
        </button>

        <button
          type="button"
          className={
            statusFilter === "completed"
              ? "statCard activeStat"
              : "statCard"
          }
          onClick={() => setStatusFilter("completed")}
        >
          <span>TAMAMLANDI</span>
          <strong>{stats.completed}</strong>
          <small>Tamamlanan görüşmeler</small>
        </button>

        <button
          type="button"
          className={
            statusFilter === "cancelled"
              ? "statCard activeStat"
              : "statCard"
          }
          onClick={() => setStatusFilter("cancelled")}
        >
          <span>İPTAL</span>
          <strong>{stats.cancelled}</strong>
          <small>İptal edilen talepler</small>
        </button>
      </section>

      {/* TOOLBAR */}

      <section className="toolbar">
        <div className="searchBox">
          <span>⌕</span>

          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Hasta, telefon, doktor veya hizmet ara..."
          />
        </div>

        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">Tüm Durumlar</option>

          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </section>

      {message && <div className="messageBox">{message}</div>}

      {/* LIST */}

      <section className="appointmentsPanel">
        <div className="panelHeader">
          <div>
            <strong>Randevu Talepleri</strong>

            <span>
              {filteredAppointments.length} kayıt gösteriliyor
            </span>
          </div>
        </div>

        {filteredAppointments.length > 0 ? (
          <div className="appointmentsList">
            {filteredAppointments.map((appointment) => (
              <article
                className="appointmentCard"
                key={appointment.id}
              >
                <div className="dateBox">
                  <strong>
                    {appointment.appointment_date
                      ? appointment.appointment_date
                          .split("-")[2]
                      : "--"}
                  </strong>

                  <span>
                    {appointment.appointment_date
                      ? new Intl.DateTimeFormat("tr-TR", {
                          month: "short",
                        })
                          .format(
                            new Date(
                              `${appointment.appointment_date}T12:00:00`
                            )
                          )
                          .toUpperCase()
                      : "---"}
                  </span>

                  <small>
                    {formatTime(
                      appointment.appointment_time
                    )}
                  </small>
                </div>

                <div className="patientInfo">
                  <div className="patientTop">
                    <div>
                      <span className="requestId">
                        TALEP #{appointment.id}
                      </span>

                      <h2>{appointment.full_name}</h2>
                    </div>

                    <span
                      className={`statusBadge status-${appointment.status}`}
                    >
                      {getStatusLabel(appointment.status)}
                    </span>
                  </div>

                  <div className="appointmentMeta">
                    <div>
                      <span>DOKTOR</span>

                      <strong>
                        {appointment.doctor_name ||
                          "Belirtilmemiş"}
                      </strong>
                    </div>

                    <div>
                      <span>TEDAVİ</span>

                      <strong>
                        {appointment.treatment ||
                          "Belirtilmemiş"}
                      </strong>
                    </div>

                    <div>
                      <span>TELEFON</span>

                      <strong>{appointment.phone}</strong>
                    </div>
                  </div>
                </div>

                <div className="cardActions">
                  <select
                    value={appointment.status}
                    disabled={updatingId === appointment.id}
                    onChange={(event) =>
                      updateStatus(
                        appointment.id,
                        event.target.value
                      )
                    }
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option
                        key={status.value}
                        value={status.value}
                      >
                        {status.label}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="detailButton"
                    onClick={() =>
                      setSelectedAppointment(appointment)
                    }
                  >
                    Detay
                  </button>

                  <button
                    type="button"
                    className="deleteButton"
                    disabled={
                      deletingId === appointment.id
                    }
                    onClick={() =>
                      deleteAppointment(appointment)
                    }
                  >
                    {deletingId === appointment.id
                      ? "..."
                      : "Sil"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="emptyState">
            <div>OK</div>

            <h3>Randevu bulunamadı.</h3>

            <p>
              Seçtiğiniz filtreye veya aramaya uygun randevu
              talebi bulunmuyor.
            </p>
          </div>
        )}
      </section>

      {/* DETAIL MODAL */}

      {selectedAppointment && (
        <div
          className="modalOverlay"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="modalCard"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modalHeader">
              <div>
                <span>
                  RANDEVU TALEBİ #{selectedAppointment.id}
                </span>

                <h2>{selectedAppointment.full_name}</h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedAppointment(null)
                }
              >
                ×
              </button>
            </div>

            <div className="modalStatus">
              <span
                className={`statusBadge status-${selectedAppointment.status}`}
              >
                {getStatusLabel(
                  selectedAppointment.status
                )}
              </span>

              <select
                value={selectedAppointment.status}
                disabled={
                  updatingId === selectedAppointment.id
                }
                onChange={(event) =>
                  updateStatus(
                    selectedAppointment.id,
                    event.target.value
                  )
                }
              >
                {STATUS_OPTIONS.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="detailGrid">
              <div className="detailItem">
                <span>RANDEVU TARİHİ</span>
                <strong>
                  {formatDate(
                    selectedAppointment.appointment_date
                  )}
                </strong>
              </div>

              <div className="detailItem">
                <span>RANDEVU SAATİ</span>
                <strong>
                  {formatTime(
                    selectedAppointment.appointment_time
                  )}
                </strong>
              </div>

              <div className="detailItem">
                <span>DOKTOR</span>
                <strong>
                  {selectedAppointment.doctor_name ||
                    "Belirtilmemiş"}
                </strong>
              </div>

              <div className="detailItem">
                <span>TEDAVİ / HİZMET</span>
                <strong>
                  {selectedAppointment.treatment ||
                    "Belirtilmemiş"}
                </strong>
              </div>

              <div className="detailItem">
                <span>TELEFON</span>
                <strong>
                  {selectedAppointment.phone}
                </strong>
              </div>

              <div className="detailItem">
                <span>E-POSTA</span>
                <strong>
                  {selectedAppointment.email ||
                    "Belirtilmemiş"}
                </strong>
              </div>
            </div>

            <div className="noteBox">
              <span>HASTA NOTU</span>

              <p>
                {selectedAppointment.note ||
                  "Hasta herhangi bir not eklememiş."}
              </p>
            </div>

            <div className="createdInfo">
              <span>Talep oluşturulma zamanı</span>

              <strong>
                {formatCreatedAt(
                  selectedAppointment.created_at
                )}
              </strong>
            </div>

            <div className="modalActions">
              <a
                href={phoneHref(selectedAppointment.phone)}
                className="primaryAction"
              >
                Telefonla Ara
                <span>→</span>
              </a>

              <a
                href={whatsappHref(
                  selectedAppointment.phone
                )}
                target="_blank"
                rel="noreferrer"
                className="secondaryAction"
              >
                WhatsApp
                <span>↗</span>
              </a>

              {selectedAppointment.email && (
                <a
                  href={`mailto:${selectedAppointment.email}`}
                  className="secondaryAction"
                >
                  E-posta
                  <span>→</span>
                </a>
              )}
            </div>

            <button
              type="button"
              className="modalDeleteButton"
              disabled={
                deletingId === selectedAppointment.id
              }
              onClick={() =>
                deleteAppointment(selectedAppointment)
              }
            >
              {deletingId === selectedAppointment.id
                ? "Siliniyor..."
                : "Randevu Talebini Sil"}
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        main {
          min-height: 100vh;
          color: #30302f;
          font-family: Arial, Helvetica, sans-serif;
        }

        button,
        input,
        select {
          font-family: inherit;
        }

        .pageHeader {
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 30px;
        }

        .eyebrow {
          color: #9e7b54;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.8px;
        }

        .pageHeader h1 {
          margin: 8px 0 7px;
          font-size: 34px;
          letter-spacing: -1.5px;
        }

        .pageHeader p {
          max-width: 580px;
          margin: 0;
          color: #827a72;
          font-size: 11px;
          line-height: 1.6;
        }

        .refreshButton {
          padding: 12px 17px;
          display: flex;
          align-items: center;
          gap: 13px;
          border: 1px solid #ded6cc;
          border-radius: 10px;
          background: white;
          color: #4f4943;
          cursor: pointer;
          font-size: 9px;
          font-weight: 900;
        }

        .refreshButton span {
          color: #a27e56;
          font-size: 15px;
        }

        /* STATS */

        .statsGrid {
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .statCard {
          min-width: 0;
          padding: 19px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          border: 1px solid #e6ded4;
          border-radius: 14px;
          background: white;
          color: #30302f;
          cursor: pointer;
          text-align: left;
          transition: 0.2s;
        }

        .statCard:hover {
          transform: translateY(-2px);
          border-color: #c8ac8b;
        }

        .activeStat {
          border-color: #30302f;
          background: #30302f;
          color: white;
        }

        .statCard > span {
          margin-bottom: 8px;
          color: #9b7b5a;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.2px;
        }

        .activeStat > span {
          color: #d0ae86;
        }

        .statCard strong {
          font-size: 29px;
        }

        .statCard small {
          margin-top: 5px;
          color: #978e85;
          font-size: 7px;
        }

        .activeStat small {
          color: #aaa39c;
        }

        /* TOOLBAR */

        .toolbar {
          margin-bottom: 20px;
          padding: 12px;
          display: flex;
          gap: 10px;
          border: 1px solid #e5ddd4;
          border-radius: 14px;
          background: white;
        }

        .searchBox {
          flex: 1;
          height: 44px;
          padding: 0 15px;
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 9px;
          background: #f6f2ed;
        }

        .searchBox > span {
          color: #a48767;
        }

        .searchBox input {
          width: 100%;
          border: 0;
          outline: none;
          background: transparent;
          color: #30302f;
          font-size: 10px;
        }

        .searchBox input::placeholder {
          color: #aaa198;
        }

        .toolbar > select {
          min-width: 180px;
          padding: 0 14px;
          border: 1px solid #dfd7cd;
          outline: none;
          border-radius: 9px;
          background: white;
          color: #57514b;
          font-size: 9px;
          font-weight: 800;
        }

        .messageBox {
          margin-bottom: 17px;
          padding: 12px 15px;
          border: 1px solid #decdb8;
          border-radius: 9px;
          background: #f3e9dc;
          color: #806142;
          font-size: 9px;
          font-weight: 700;
        }

        /* PANEL */

        .appointmentsPanel {
          overflow: hidden;
          border: 1px solid #e4dcd2;
          border-radius: 17px;
          background: white;
        }

        .panelHeader {
          padding: 20px 22px;
          border-bottom: 1px solid #eee7df;
        }

        .panelHeader > div {
          display: flex;
          align-items: baseline;
          gap: 11px;
        }

        .panelHeader strong {
          font-size: 13px;
        }

        .panelHeader span {
          color: #968d85;
          font-size: 8px;
        }

        .appointmentsList {
          padding: 8px 20px 20px;
        }

        .appointmentCard {
          padding: 18px 0;
          display: grid;
          grid-template-columns: 76px minmax(0, 1fr) 155px;
          gap: 18px;
          align-items: center;
          border-bottom: 1px solid #eee8e1;
        }

        .appointmentCard:last-child {
          border-bottom: 0;
        }

        .dateBox {
          width: 76px;
          height: 83px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #eee4d7;
        }

        .dateBox strong {
          color: #30302f;
          font-size: 22px;
        }

        .dateBox span {
          margin-top: 1px;
          color: #91704f;
          font-size: 7px;
          font-weight: 900;
        }

        .dateBox small {
          margin-top: 6px;
          color: #6f6861;
          font-size: 9px;
          font-weight: 900;
        }

        .patientInfo {
          min-width: 0;
        }

        .patientTop {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
        }

        .requestId {
          color: #9b8064;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1.1px;
        }

        .patientTop h2 {
          margin: 4px 0 0;
          font-size: 16px;
        }

        .statusBadge {
          padding: 7px 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          white-space: nowrap;
          border-radius: 30px;
          font-size: 7px;
          font-weight: 900;
        }

        .status-new {
          background: #eee2d2;
          color: #8a673f;
        }

        .status-confirmed {
          background: #e4ebe2;
          color: #547051;
        }

        .status-completed {
          background: #e4e8eb;
          color: #536573;
        }

        .status-cancelled {
          background: #f1dfdc;
          color: #965b52;
        }

        .appointmentMeta {
          margin-top: 14px;
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
        }

        .appointmentMeta > div {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .appointmentMeta span {
          color: #aaa098;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .appointmentMeta strong {
          overflow: hidden;
          color: #625c56;
          font-size: 8px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .cardActions {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .cardActions select {
          height: 34px;
          padding: 0 8px;
          border: 1px solid #ddd4ca;
          outline: none;
          border-radius: 8px;
          background: #f9f7f4;
          color: #5c5650;
          font-size: 8px;
          font-weight: 800;
        }

        .detailButton,
        .deleteButton {
          height: 33px;
          border-radius: 8px;
          cursor: pointer;
          font-size: 8px;
          font-weight: 900;
        }

        .detailButton {
          border: 0;
          background: #30302f;
          color: white;
        }

        .deleteButton {
          border: 1px solid #eadbd6;
          background: white;
          color: #9b5d52;
        }

        .deleteButton:disabled,
        .cardActions select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .emptyState {
          padding: 90px 20px;
          text-align: center;
        }

        .emptyState > div {
          margin: 0 auto 14px;
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          background: #30302f;
          color: #c6a47d;
          font-weight: 900;
        }

        .emptyState h3 {
          margin: 0 0 7px;
          font-size: 18px;
        }

        .emptyState p {
          margin: 0;
          color: #958d85;
          font-size: 9px;
        }

        /* MODAL */

        .modalOverlay {
          position: fixed;
          inset: 0;
          z-index: 1000;
          padding: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          background: rgba(28, 27, 26, 0.66);
          backdrop-filter: blur(6px);
        }

        .modalCard {
          width: min(680px, 100%);
          max-height: calc(100vh - 60px);
          padding: 30px;
          overflow-y: auto;
          border-radius: 21px;
          background: #faf9f6;
          box-shadow: 0 40px 100px rgba(0, 0, 0, 0.25);
        }

        .modalHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
        }

        .modalHeader span {
          color: #9c7b58;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 1.3px;
        }

        .modalHeader h2 {
          margin: 6px 0 0;
          font-size: 27px;
          letter-spacing: -1px;
        }

        .modalHeader button {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          border: 0;
          border-radius: 9px;
          background: #ebe4dc;
          color: #625c56;
          cursor: pointer;
          font-size: 22px;
        }

        .modalStatus {
          margin-top: 24px;
          padding: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          border-radius: 11px;
          background: white;
        }

        .modalStatus select {
          height: 35px;
          padding: 0 10px;
          border: 1px solid #ded6cc;
          border-radius: 8px;
          outline: none;
          background: #faf8f5;
          color: #554f49;
          font-size: 8px;
          font-weight: 800;
        }

        .detailGrid {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .detailItem {
          min-height: 73px;
          padding: 15px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          border: 1px solid #e7ded5;
          border-radius: 11px;
          background: white;
        }

        .detailItem span,
        .noteBox span,
        .createdInfo span {
          color: #9c8064;
          font-size: 6px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .detailItem strong {
          color: #4e4944;
          font-size: 10px;
        }

        .noteBox {
          margin-top: 10px;
          padding: 18px;
          border-radius: 11px;
          background: #eee5da;
        }

        .noteBox p {
          margin: 7px 0 0;
          color: #665f58;
          font-size: 10px;
          line-height: 1.7;
        }

        .createdInfo {
          margin-top: 10px;
          padding: 13px 15px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-bottom: 1px solid #e6ddd3;
        }

        .createdInfo strong {
          color: #625c56;
          font-size: 8px;
        }

        .modalActions {
          margin-top: 20px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }

        .primaryAction,
        .secondaryAction {
          min-height: 43px;
          padding: 10px 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 9px;
          text-decoration: none;
          font-size: 8px;
          font-weight: 900;
        }

        .primaryAction {
          background: #30302f;
          color: white;
        }

        .primaryAction span {
          color: #d2b18a;
        }

        .secondaryAction {
          border: 1px solid #ded5cb;
          background: white;
          color: #5e5852;
        }

        .modalDeleteButton {
          width: 100%;
          height: 42px;
          margin-top: 9px;
          border: 1px solid #ead6d1;
          border-radius: 9px;
          background: #fbf5f3;
          color: #9a584f;
          cursor: pointer;
          font-size: 8px;
          font-weight: 900;
        }

        .modalDeleteButton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* RESPONSIVE */

        @media (max-width: 1100px) {
          .statsGrid {
            grid-template-columns: repeat(3, 1fr);
          }

          .appointmentCard {
            grid-template-columns: 76px 1fr;
          }

          .cardActions {
            grid-column: 2;
            flex-direction: row;
          }

          .cardActions select,
          .detailButton,
          .deleteButton {
            flex: 1;
          }
        }

        @media (max-width: 750px) {
          .pageHeader {
            align-items: flex-start;
            flex-direction: column;
          }

          .statsGrid {
            grid-template-columns: 1fr 1fr;
          }

          .toolbar {
            flex-direction: column;
          }

          .toolbar > select {
            width: 100%;
            height: 44px;
          }

          .appointmentCard {
            grid-template-columns: 65px 1fr;
          }

          .dateBox {
            width: 65px;
          }

          .appointmentMeta {
            grid-template-columns: 1fr;
          }

          .cardActions {
            grid-column: 1 / -1;
          }

          .detailGrid {
            grid-template-columns: 1fr;
          }

          .modalActions {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 470px) {
          .statsGrid {
            grid-template-columns: 1fr;
          }

          .patientTop {
            flex-direction: column;
          }

          .cardActions {
            flex-direction: column;
          }

          .modalOverlay {
            padding: 12px;
          }

          .modalCard {
            max-height: calc(100vh - 24px);
            padding: 20px;
          }

          .modalStatus {
            align-items: flex-start;
            flex-direction: column;
          }

          .modalStatus select {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}