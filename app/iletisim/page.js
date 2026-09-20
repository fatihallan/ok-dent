"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabaseClient";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

function phoneHref(phone) {
  if (!phone) return "#";
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

function whatsappHref(phone) {
  if (!phone) return "#";
  let clean = phone.replace(/\D/g, "");
  if (clean.startsWith("0")) clean = `90${clean.substring(1)}`;
  return `https://wa.me/${clean}`;
}

export default function ContactPage() {
  const [settings, setSettings] = useState(null);
  const [homepage, setHomepage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const [settingsResult, homepageResult] = await Promise.all([
        supabase.from("site_settings").select("*").eq("setting_key", "main").single(),
        supabase.from("homepage_settings").select("*").eq("setting_key", "main").single(),
      ]);

      if (settingsResult.data) setSettings(settingsResult.data);
      if (homepageResult.data) setHomepage(homepageResult.data);
      setLoading(false);
    }
    load();
  }, []);

  const mapAddress =
    settings?.map_address ||
    settings?.address ||
    "Taşpazar Mah. Pir Ali Sultan Cad. Nazmiye Hatun Apt. No: 5/A, 68100 Aksaray Merkez/Aksaray";
  const mapQuery = encodeURIComponent(mapAddress);

  return (
    <>
      <SiteHeader />
      <main className="page">
        <section className="hero">
          <div className="container">
            <span className="eyebrow">{settings?.clinic_name || ""}</span>
            <h1>{homepage?.contact_title || "İletişim"}</h1>
            <p>{homepage?.contact_description || ""}</p>
          </div>
        </section>

        <section className="contact">
          <div className="container contactGrid">
            <div className="infoCard">
              {settings?.phone && (
                <div className="infoItem">
                  <span>{homepage?.contact_phone_label || "TELEFON"}</span>
                  <a href={phoneHref(settings.phone)}>{settings.phone}</a>
                </div>
              )}

              {settings?.whatsapp && (
                <div className="infoItem">
                  <span>WHATSAPP</span>
                  <a href={whatsappHref(settings.whatsapp)} target="_blank" rel="noreferrer">
                    {settings.whatsapp}
                  </a>
                </div>
              )}

              {settings?.email && (
                <div className="infoItem">
                  <span>{homepage?.contact_email_label || "E-POSTA"}</span>
                  <a href={`mailto:${settings.email}`}>{settings.email}</a>
                </div>
              )}

              {settings?.address && (
                <div className="infoItem">
                  <span>{homepage?.contact_address_label || "ADRES"}</span>
                  <strong>{settings.address}</strong>
                </div>
              )}

              {settings?.working_hours && (
                <div className="infoItem">
                  <span>{homepage?.contact_hours_label || "ÇALIŞMA SAATLERİ"}</span>
                  <strong>{settings.working_hours}</strong>
                </div>
              )}

              <div className="actions">
                <a
                  className="goldButton"
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Yol Tarifi Al <b>→</b>
                </a>
                <a className="darkButton" href="/randevu">
                  {homepage?.appointment_button_text || "Randevu Al"} <b>→</b>
                </a>
              </div>
            </div>

            <div className="mapCard">
              {!loading && (
                <iframe
                  title="OK Dent konum haritası"
                  src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />

      <style jsx>{`
        .page {
          min-height: 70vh;
          background: var(--theme-background);
          color: var(--theme-text);
        }
        .container {
          width: min(1180px, calc(100% - 48px));
          margin: auto;
        }
        .hero {
          padding: 78px 0 48px;
          text-align: center;
        }
        .eyebrow {
          color: var(--theme-accent);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }
        h1 {
          margin: 14px 0 12px;
          color: var(--theme-primary);
          font-size: clamp(46px, 7vw, 76px);
          line-height: 1;
          letter-spacing: -3px;
        }
        .hero p {
          max-width: 650px;
          margin: auto;
          color: var(--theme-muted);
          font-size: 14px;
          line-height: 1.8;
        }
        .contact {
          padding: 0 0 95px;
        }
        .contactGrid {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 22px;
          align-items: stretch;
        }
        .infoCard,
        .mapCard {
          overflow: hidden;
          border: 1px solid var(--theme-border);
          border-radius: var(--theme-radius);
        }
        .infoCard {
          padding: 32px;
          background: var(--theme-primary);
          color: white;
        }
        .infoItem {
          padding: 17px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-bottom: 1px solid rgba(255,255,255,.09);
        }
        .infoItem span {
          color: var(--theme-accent);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }
        .infoItem a,
        .infoItem strong {
          color: white;
          font-size: 12px;
          line-height: 1.6;
          text-decoration: none;
        }
        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 26px;
        }
        .goldButton,
        .darkButton {
          min-height: 46px;
          padding: 0 17px;
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
        }
        .goldButton {
          background: var(--theme-accent);
          color: var(--theme-primary);
        }
        .darkButton {
          border: 1px solid rgba(255,255,255,.2);
          color: white;
        }
        .mapCard {
          min-height: 520px;
          background: #eee8e0;
        }
        .mapCard iframe {
          width: 100%;
          height: 100%;
          min-height: 520px;
          display: block;
          border: 0;
        }
        @media (max-width: 900px) {
          .contactGrid {
            grid-template-columns: 1fr;
          }
          .mapCard,
          .mapCard iframe {
            min-height: 390px;
          }
        }
        @media (max-width: 600px) {
          .container {
            width: min(100% - 30px, 1180px);
          }
          .hero {
            padding: 55px 0 34px;
          }
          h1 {
            letter-spacing: -2px;
          }
          .infoCard {
            padding: 24px;
          }
          .actions {
            flex-direction: column;
          }
          .goldButton,
          .darkButton {
            width: 100%;
            box-sizing: border-box;
          }
          .mapCard,
          .mapCard iframe {
            min-height: 330px;
          }
        }
      `}</style>
    </>
  );
}
