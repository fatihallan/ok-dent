"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabaseClient";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

export default function DoktorlarPage() {
  const [doctors, setDoctors] = useState([]);
  const [settings, setSettings] = useState(null);
  const [pageSettings, setPageSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    const supabase = createClient();

    try {
      const [doctorsResult, settingsResult, pageResult] = await Promise.all([
        supabase
          .from("doctors")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("site_settings")
          .select("*")
          .eq("setting_key", "main")
          .single(),

        supabase
          .from("doctors_page_settings")
          .select("*")
          .eq("setting_key", "main")
          .single(),
      ]);

      if (doctorsResult.error) {
        console.error("Doktorlar yüklenemedi:", doctorsResult.error);
      }

      if (settingsResult.error) {
        console.error("Ayarlar yüklenemedi:", settingsResult.error);
      }

      setDoctors(doctorsResult.data || []);
      setSettings(settingsResult.data || null);
      setPageSettings(pageResult?.data || null);
    } catch (error) {
      console.error("Sayfa yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  }

  function pageText(key) {
    const value = pageSettings?.[key];
    return typeof value === "string" ? value : "";
  }

  function phoneHref(phone) {
    if (!phone) return "#";
    return `tel:${phone.replace(/[^\d+]/g, "")}`;
  }

  function whatsappHref(phone) {
    if (!phone) return "#";

    let clean = phone.replace(/\D/g, "");

    if (clean.startsWith("0")) {
      clean = `90${clean.substring(1)}`;
    }

    return `https://wa.me/${clean}`;
  }

  if (loading) {
    return (
      <main className="loading">
        <div className="loadingMark">{pageText("loading_mark")}</div>
        <span>{pageText("loading_text")}</span>

        <style jsx>{`
          .loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            background: var(--theme-background);
            color: var(--theme-primary);
            font-family: Arial, Helvetica, sans-serif;
          }

          .loadingMark {
            width: 58px;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: var(--theme-radius);
            background: var(--theme-primary);
            color: var(--theme-accent);
            font-weight: 900;
          }

          .loading span {
            color: var(--theme-muted);
            font-size: 12px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main>
      {/* ORTAK SITE HEADER */}
      <SiteHeader />

      {/* PAGE HERO */}

      <section className="pageHero">
        <div className="heroDecoration heroDecorationOne" />
        <div className="heroDecoration heroDecorationTwo" />

        <div className="container pageHeroInner">
          <div className="breadcrumb">
            <a href="/">{pageText("breadcrumb_home_text")}</a>
            <span>/</span>
            <strong>{pageText("breadcrumb_current_text")}</strong>
          </div>

          <div className="pageHeroGrid">
            <div>
              <span className="eyebrow">{pageText("hero_eyebrow")}</span>

              <h1>
                {pageText("hero_title_first")}
                <br />
                <em>{pageText("hero_title_emphasis")}</em>{" "}
                {pageText("hero_title_last")}
              </h1>
            </div>

            <div className="heroRight">
              <div className="doctorCount">
                <strong>
                  {String(doctors.length).padStart(2, "0")}
                </strong>
                <span>{pageText("doctor_count_label")}</span>
              </div>

              <p>
{pageText("hero_description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DOCTORS */}

      <section className="doctorsSection">
        <div className="container">
          {doctors.length > 0 ? (
            <div className="doctorsGrid">
              {doctors.map((doctor, index) => (
                <article className="doctorCard" key={doctor.id}>
                  <div className="doctorImageWrap">
                    {doctor.image_url ? (
                      <img
                        src={doctor.image_url}
                        alt={doctor.full_name}
                        className="doctorImage"
                      />
                    ) : (
                      <div className="doctorPlaceholder">
                        <span>
                          {doctor.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || ""}
                        </span>
                      </div>
                    )}

                    <div className="doctorNumber">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="specialty">
                      {doctor.specialty || pageText("default_specialty")}
                    </div>
                  </div>

                  <div className="doctorContent">
                    <span className="doctorTitle">
                      {doctor.title || pageText("default_doctor_title")}
                    </span>

                    <h2>{doctor.full_name}</h2>

                    {doctor.description && (
                      <p>{doctor.description}</p>
                    )}

                    <div className="doctorBottom">
                      <a href={pageText("doctor_button_link")}>
                        {pageText("doctor_button_text")}
                        <span>{pageText("doctor_button_arrow_text")}</span>
                      </a>

                      <span className="okMark">{pageText("doctor_card_mark")}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="emptyDoctors">
              <span>{pageText("empty_mark")}</span>
              <h2>{pageText("empty_title")}</h2>
<p>{pageText("empty_description")}</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}

      <section className="ctaSection">
        <div className="container">
          <div className="ctaCard">
            <div className="ctaContent">
              <span className="ctaEyebrow">{pageText("cta_eyebrow")}</span>

              <h2>
{pageText("cta_title")}
              </h2>

              <p>
{pageText("cta_description")}
              </p>
            </div>

            <div className="ctaActions">
              <a href={pageText("cta_button_link")} className="goldButton">
                {pageText("cta_button_text")}
                <span>{pageText("cta_button_arrow_text")}</span>
              </a>

              {settings?.phone && (
                <a
                  href={phoneHref(settings.phone)}
                  className="outlineButton"
                >
                  {pageText("phone_button_text")}
                </a>
              )}

              {settings?.whatsapp && (
                <a
                  href={whatsappHref(settings.whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="outlineButton"
                >
                  {pageText("whatsapp_button_text")}
                  <span>{pageText("whatsapp_external_mark")}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
      {/* ORTAK SITE FOOTER */}
      <SiteFooter />

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(html) {
          scroll-behavior: smooth;
        }

        :global(body) {
          margin: 0;
          background: color-mix(in srgb, var(--theme-background) 82%, white);
          color: var(--theme-primary);
          font-family: Arial, Helvetica, sans-serif;
        }

        main {
          min-height: 100vh;
          overflow: hidden;
        }

        .container {
          width: min(1240px, calc(100% - 50px));
          margin: 0 auto;
        }

        /* HEADER */

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          height: 88px;
          display: flex;
          align-items: center;
          background: rgba(250, 249, 246, 0.97);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid #e9e2d9;
        }

        .headerInner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 25px;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--theme-primary);
          text-decoration: none;
        }

        .brandLogo {
          height: 61px;
          width: auto;
          max-width: 175px;
          object-fit: contain;
        }

        .brandMark {
          width: 49px;
          height: 49px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--theme-radius);
          background: var(--theme-primary);
          color: var(--theme-accent);
          font-weight: 900;
        }

        .brandText {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .brandText strong {
          font-size: 16px;
        }

        .brandText span {
          color: #8b8176;
          font-size: 8px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 21px;
        }

        .nav > a,
        .dropdownButton {
          color: #69645f;
          text-decoration: none;
          font-family: inherit;
          font-size: 10px;
          font-weight: 800;
          transition: 0.2s;
        }

        .nav > a:hover,
        .nav > a.active,
        .dropdownButton:hover {
          color: #a17d55;
        }

        .nav > a.active {
          position: relative;
        }

        .nav > a.active::after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          bottom: -10px;
          height: 2px;
          background: var(--theme-accent);
        }

        .dropdown {
          position: relative;
          padding: 20px 0;
        }

        .dropdownButton {
          display: flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          border: 0;
          background: transparent;
          cursor: pointer;
        }

        .dropdownButton span {
          color: #b08c64;
        }

        .dropdownMenu {
          position: absolute;
          top: 54px;
          left: 50%;
          width: 300px;
          padding: 10px;
          opacity: 0;
          visibility: hidden;
          transform: translate(-50%, 8px);
          border: 1px solid var(--theme-border);
          border-radius: var(--theme-radius);
          background: white;
          box-shadow: 0 25px 65px rgba(38, 34, 30, 0.14);
          transition: 0.2s;
        }

        .dropdown:hover .dropdownMenu {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 0);
        }

        .dropdownMenu > a {
          padding: 13px;
          display: flex;
          align-items: center;
          gap: 12px;
          border-radius: 11px;
          color: var(--theme-primary);
          text-decoration: none;
        }

        .dropdownMenu > a:hover {
          background: color-mix(in srgb, var(--theme-background) 88%, var(--theme-accent));
        }

        .menuNumber {
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: color-mix(in srgb, var(--theme-accent) 25%, var(--theme-background));
          color: #8a6846;
          font-size: 8px;
          font-weight: 900;
        }

        .dropdownMenu div {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .dropdownMenu strong {
          font-size: 11px;
        }

        .dropdownMenu small {
          color: #968a7e;
          font-size: 8px;
        }

        .headerButton {
          flex-shrink: 0;
          padding: 13px 18px;
          display: flex;
          gap: 15px;
          border-radius: 10px;
          background: var(--theme-primary);
          color: white;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
        }

        .headerButton span {
          color: color-mix(in srgb, var(--theme-accent) 82%, white);
        }

        /* PAGE HERO */

        .pageHero {
          position: relative;
          overflow: hidden;
          padding: 82px 0 92px;
          background: var(--theme-border);
        }

        .heroDecoration {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .heroDecorationOne {
          width: 420px;
          height: 420px;
          top: -260px;
          right: -130px;
          border: 1px solid rgba(194, 161, 123, 0.28);
        }

        .heroDecorationTwo {
          width: 150px;
          height: 150px;
          right: 15%;
          bottom: -100px;
          background: rgba(194, 161, 123, 0.1);
        }

        .pageHeroInner {
          position: relative;
          z-index: 2;
        }

        .breadcrumb {
          margin-bottom: 55px;
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--theme-muted);
          font-size: 9px;
          font-weight: 700;
        }

        .breadcrumb a {
          color: var(--theme-muted);
          text-decoration: none;
        }

        .breadcrumb > span {
          color: var(--theme-accent);
        }

        .breadcrumb strong {
          color: #665f58;
        }

        .pageHeroGrid {
          display: grid;
          grid-template-columns: 1.25fr 0.75fr;
          gap: 90px;
          align-items: end;
        }

        .eyebrow {
          display: inline-block;
          margin-bottom: 18px;
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2.3px;
        }

        .pageHero h1 {
          margin: 0;
          color: var(--theme-primary);
          font-size: clamp(52px, 6.5vw, 82px);
          line-height: 0.98;
          letter-spacing: -4px;
        }

        .pageHero h1 em {
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
          font-family: Georgia, serif;
          font-weight: 400;
        }

        .heroRight {
          display: flex;
          align-items: flex-start;
          gap: 24px;
        }

        .doctorCount {
          width: 92px;
          min-width: 92px;
          height: 92px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-radius: var(--theme-radius);
          background: var(--theme-primary);
        }

        .doctorCount strong {
          color: #d2b28c;
          font-size: 25px;
        }

        .doctorCount span {
          margin-top: 4px;
          color: #c8c0b7;
          font-size: 7px;
          text-transform: uppercase;
        }

        .heroRight p {
          margin: 0;
          color: #746d66;
          font-size: 13px;
          line-height: 1.8;
        }

        /* DOCTORS */

        .doctorsSection {
          padding: 100px 0 115px;
          background: color-mix(in srgb, var(--theme-background) 82%, white);
        }

        .doctorsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .doctorCard {
          overflow: hidden;
          border: 1px solid #e6ddd3;
          border-radius: var(--theme-radius);
          background: white;
          transition: 0.3s ease;
        }

        .doctorCard:hover {
          transform: translateY(-7px);
          box-shadow: 0 30px 65px rgba(45, 40, 35, 0.1);
        }

        .doctorImageWrap {
          position: relative;
          height: 460px;
          overflow: hidden;
          background: #e1d8cc;
        }

        .doctorImage {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center top;
          transition: transform 0.6s ease;
        }

        .doctorCard:hover .doctorImage {
          transform: scale(1.025);
        }

        .doctorPlaceholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ded3c6;
        }

        .doctorPlaceholder span {
          color: rgba(60, 55, 50, 0.22);
          font-size: 100px;
          font-weight: 900;
        }

        .doctorNumber {
          position: absolute;
          top: 18px;
          left: 18px;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(48, 48, 47, 0.93);
          color: #d3b48e;
          font-size: 9px;
          font-weight: 900;
        }

        .specialty {
          position: absolute;
          left: 18px;
          bottom: 18px;
          padding: 11px 15px;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.94);
          color: #896744;
          backdrop-filter: blur(10px);
          font-size: 9px;
          font-weight: 900;
        }

        .doctorContent {
          padding: 27px;
        }

        .doctorTitle {
          color: #9c7b58;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        .doctorContent h2 {
          margin: 8px 0 15px;
          color: var(--theme-primary);
          font-size: 25px;
          letter-spacing: -0.8px;
        }

        .doctorContent > p {
          min-height: 65px;
          margin: 0;
          color: #7b746d;
          font-size: 12px;
          line-height: 1.75;
        }

        .doctorBottom {
          margin-top: 24px;
          padding-top: 19px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          border-top: 1px solid #eee7df;
        }

        .doctorBottom > a {
          display: flex;
          align-items: center;
          gap: 13px;
          color: #8e6b47;
          text-decoration: none;
          font-size: 10px;
          font-weight: 900;
        }

        .doctorBottom > a span {
          transition: transform 0.2s;
        }

        .doctorBottom > a:hover span {
          transform: translateX(4px);
        }

        .okMark {
          color: #c8b39a;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .emptyDoctors {
          padding: 100px 25px;
          text-align: center;
          border: 1px solid #e5ddd3;
          border-radius: var(--theme-radius);
          background: white;
        }

        .emptyDoctors > span {
          color: var(--theme-accent);
          font-size: 40px;
          font-weight: 900;
        }

        .emptyDoctors h2 {
          margin: 14px 0 8px;
          font-size: 28px;
        }

        .emptyDoctors p {
          color: var(--theme-muted);
          font-size: 12px;
        }

        /* CTA */

        .ctaSection {
          padding: 0 0 100px;
          background: color-mix(in srgb, var(--theme-background) 82%, white);
        }

        .ctaCard {
          min-height: 410px;
          padding: 60px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 70px;
          align-items: end;
          border-radius: var(--theme-radius);
          background: var(--theme-primary);
          color: white;
        }

        .ctaEyebrow {
          color: #d1ad82;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .ctaContent h2 {
          margin: 18px 0 22px;
          font-size: clamp(40px, 5vw, 58px);
          line-height: 1;
          letter-spacing: -2.5px;
        }

        .ctaContent p {
          max-width: 570px;
          margin: 0;
          color: #bdb6ae;
          font-size: 13px;
          line-height: 1.8;
        }

        .ctaActions {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 9px;
        }

        .goldButton,
        .outlineButton {
          min-height: 48px;
          padding: 14px 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-radius: 10px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 900;
        }

        .goldButton {
          background: var(--theme-accent);
          color: #2f2e2c;
        }

        .outlineButton {
          border: 1px solid rgba(255, 255, 255, 0.13);
          color: white;
        }

        /* FOOTER */

        .footer {
          padding: 65px 0 30px;
          background: var(--theme-text);
          color: white;
        }

        .footerMain {
          display: grid;
          grid-template-columns: 1.6fr 0.7fr 0.7fr 0.7fr;
          gap: 55px;
          padding-bottom: 50px;
        }

        .footerBrand {
          display: flex;
          align-items: center;
          gap: 13px;
          color: white;
          text-decoration: none;
        }

        .footerBrand img {
          height: 58px;
          width: auto;
          max-width: 170px;
          object-fit: contain;
          border-radius: 7px;
          background: white;
        }

        .footerMark {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #c4a17a;
          color: #292928;
          font-weight: 900;
        }

        .footerBrand > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .footerBrand span,
        .footerBrandBlock > p {
          color: #a8a097;
          font-size: 9px;
        }

        .footerBrandBlock > p {
          max-width: 300px;
          margin-top: 19px;
          line-height: 1.7;
        }

        .footerColumn {
          display: flex;
          flex-direction: column;
          gap: 11px;
        }

        .footerColumn > strong {
          margin-bottom: 5px;
          color: #c8aa86;
          font-size: 9px;
          letter-spacing: 1.4px;
        }

        .footerColumn a {
          color: #aaa39b;
          text-decoration: none;
          font-size: 10px;
        }

        .footerColumn a:hover {
          color: white;
        }

        .footerBottom {
          padding-top: 25px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: #8c857d;
          font-size: 9px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .nav {
            display: none;
          }

          .pageHeroGrid {
            grid-template-columns: 1fr;
            gap: 40px;
          }

          .doctorsGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .ctaCard {
            grid-template-columns: 1fr;
          }

          .footerMain {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 720px) {
          .container {
            width: min(100% - 30px, 1240px);
          }

          .header {
            height: 72px;
          }

          .brandText {
            display: none;
          }

          .brandLogo {
            height: 47px;
          }

          .pageHero {
            padding: 55px 0 65px;
          }

          .breadcrumb {
            margin-bottom: 38px;
          }

          .pageHero h1 {
            font-size: 48px;
            letter-spacing: -2.5px;
          }

          .heroRight {
            flex-direction: column;
          }

          .doctorsSection {
            padding: 70px 0;
          }

          .doctorsGrid {
            grid-template-columns: 1fr;
          }

          .doctorImageWrap {
            height: 500px;
          }

          .ctaSection {
            padding-bottom: 70px;
          }

          .ctaCard {
            padding: 38px 25px;
          }

          .footerMain {
            grid-template-columns: 1fr;
          }

          .footerBottom {
            flex-direction: column;
          }
        }

        @media (max-width: 430px) {
          .pageHero h1 {
            font-size: 42px;
          }

          .doctorImageWrap {
            height: 430px;
          }

          .headerButton {
            padding: 12px 14px;
          }

          .headerButton span {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}