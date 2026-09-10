"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabaseClient";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export default function VisionMissionPage() {
  const [content, setContent] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    const supabase = createClient();

    try {
      const [contentResult, settingsResult] = await Promise.all([
        supabase
          .from("vision_mission_page")
          .select("*")
          .eq("section_key", "main")
          .single(),

        supabase
          .from("site_settings")
          .select("*")
          .eq("setting_key", "main")
          .single(),
      ]);

      if (contentResult.error) {
        console.error(
          "Vizyon & Misyon hatası:",
          contentResult.error
        );
      }

      if (settingsResult.error) {
        console.error(
          "Site ayarları hatası:",
          settingsResult.error
        );
      }

      setContent(contentResult.data || null);
      setSettings(settingsResult.data || null);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  function getWhatsAppLink() {
    if (!settings?.whatsapp) return "#";

    let phone = settings.whatsapp.replace(/\D/g, "");

    if (phone.startsWith("0")) {
      phone = "90" + phone.slice(1);
    }

    if (!phone.startsWith("90")) {
      phone = "90" + phone;
    }

    return `https://wa.me/${phone}`;
  }

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loader"></div>
        <p>{content?.loading_text || ""}</p>

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: grid;
            place-items: center;
            align-content: center;
            gap: 14px;
            background: var(--theme-background);
            color: var(--theme-primary);
            font-family: Arial, sans-serif;
          }

          .loader {
            width: 36px;
            height: 36px;
            border: 3px solid #e8ded2;
            border-top-color: var(--theme-accent);
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </main>
    );
  }

  if (!content || !content.is_active) {
    return (
      <main className="hiddenPage">
        <div>
          <span>{content?.hidden_brand_text || ""}</span>
          <h1>{content?.hidden_title || ""}</h1>
          <p>{content?.hidden_description || ""}</p>
          <a href={content?.hidden_button_link || ""}>{content?.hidden_button_text || ""}</a>
        </div>

        <style jsx>{`
          .hiddenPage {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 30px;
            background: var(--theme-background);
            color: var(--theme-primary);
            text-align: center;
            font-family: Arial, sans-serif;
          }

          .hiddenPage div {
            max-width: 650px;
          }

          .hiddenPage span {
            color: #a9845e;
            font-size: 10px;
            font-weight: 900;
            letter-spacing: 2px;
          }

          .hiddenPage h1 {
            margin: 15px 0;
            font-size: 42px;
          }

          .hiddenPage p {
            color: var(--theme-muted);
            line-height: 1.7;
          }

          .hiddenPage a {
            display: inline-block;
            margin-top: 18px;
            padding: 13px 18px;
            background: var(--theme-primary);
            color: white;
            border-radius: 10px;
            text-decoration: none;
            font-weight: 800;
          }
        `}</style>
      </main>
    );
  }

  const principles = [
    {
      number: "01",
      title: content.principle_1_title,
      text: content.principle_1_text,
    },
    {
      number: "02",
      title: content.principle_2_title,
      text: content.principle_2_text,
    },
    {
      number: "03",
      title: content.principle_3_title,
      text: content.principle_3_text,
    },
    {
      number: "04",
      title: content.principle_4_title,
      text: content.principle_4_text,
    },
  ];

  return (
    <main>
           <SiteHeader />

      {/* HERO */}
      <section className="hero">
        <div className="heroCircle circleOne"></div>
        <div className="heroCircle circleTwo"></div>

        <div className="container heroInner">
          <div className="breadcrumb">
            <a href="/">{content?.breadcrumb_home_text || ""}</a>
            <span>•</span>
            <span>{content?.breadcrumb_corporate_text || ""}</span>
            <span>•</span>
            <strong>{content?.breadcrumb_current_text || ""}</strong>
          </div>

          <div className="heroGrid">
            <div>
              <span className="eyebrow">
                {content.eyebrow || ""}
              </span>

              <h1>
                {content.title || ""}
              </h1>
            </div>

            <div className="heroDescription">
              <div className="goldLine"></div>

              <p>
                {content.description || ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* VISION / MISSION */}
      <section className="vmSection">
        <div className="container vmGrid">
          <article className="vmCard visionCard">
            <div className="vmTop">
              <span className="vmNumber">01</span>
              <span className="vmLabel">{content?.vision_label || ""}</span>
            </div>

            <div className="vmIcon">
              <span>{content?.vision_icon_text || ""}</span>
            </div>

            <h2>
              {content.vision_title || ""}
            </h2>

            <p>
              {content.vision_text || ""}
            </p>
          </article>

          <article className="vmCard missionCard">
            <div className="vmTop">
              <span className="vmNumber">02</span>
              <span className="vmLabel">{content?.mission_label || ""}</span>
            </div>

            <div className="vmIcon">
              <span>{content?.mission_icon_text || ""}</span>
            </div>

            <h2>
              {content.mission_title || ""}
            </h2>

            <p>
              {content.mission_text || ""}
            </p>
          </article>
        </div>
      </section>

      {/* IMAGE */}
      <section className="imageSection">
        <div className="container">
          <div className="imageWrap">
            {content.image_url ? (
              <img
                src={content.image_url}
                alt={content?.image_alt_text || ""}
              />
            ) : (
              <div className="imagePlaceholder">
                <span>{content?.image_placeholder_mark || ""}</span>
                <div>
                  <strong>{content?.image_placeholder_title || ""}</strong>
                  <small>{content?.image_placeholder_text || ""}</small>
                </div>
              </div>
            )}

            <div className="imageOverlay"></div>

            <div className="imageContent">
              <span>{content?.image_overlay_eyebrow || ""}</span>
              <h2>{content?.image_overlay_title || ""}</h2>
            </div>
          </div>
        </div>
      </section>

      {/* PRINCIPLES */}
      <section className="principlesSection">
        <div className="container">
          <div className="sectionHeading">
            <span className="eyebrow">{content?.principles_eyebrow || ""}</span>
            <h2>{content?.principles_title || ""}</h2>
            <p>{content?.principles_description || ""}</p>
          </div>

          <div className="principlesGrid">
            {principles.map((item) => (
              <article
                className="principleCard"
                key={item.number}
              >
                <div className="principleTop">
                  <span>{item.number}</span>
                  <i></i>
                </div>

                <h3>
                  {item.title || content?.principle_fallback_title || ""}
                </h3>

                <p>
                  {item.text || content?.principle_fallback_text || ""}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE / BRAND */}
      <section className="brandSection">
        <div className="container brandGrid">
          <div>
            <span className="lightEyebrow">{content?.brand_eyebrow || ""}</span>
            <h2>{content?.brand_title || ""}</h2>
          </div>

          <div className="brandPoints">
            <div>
              <span>01</span>
<p>{content?.brand_point_1_text || ""}</p>
            </div>

            <div>
              <span>02</span>
<p>{content?.brand_point_2_text || ""}</p>
            </div>

            <div>
              <span>03</span>
<p>{content?.brand_point_3_text || ""}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="ctaSection">
        <div className="container">
          <div className="ctaBox">
            <div>
<span className="lightEyebrow">{content?.cta_eyebrow || ""}</span>

              <h2>
                {content.cta_title || ""}
              </h2>

              <p>
                {content.cta_text || ""}
              </p>
            </div>

            <div className="ctaActions">
              <a
                href={
                  content.cta_button_link || ""
                }
                className="primaryCta"
              >
                {content.cta_button_text || ""}

                <span>{content?.cta_button_arrow_text ?? ""}</span>
              </a>

              {settings?.whatsapp && (
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="secondaryCta"
                >
                  {content?.whatsapp_button_text || ""}
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
          background: var(--theme-background);
          color: var(--theme-primary);
          font-family: Inter, Arial, Helvetica, sans-serif;
        }

        main {
          min-height: 100vh;
          overflow: hidden;
        }

        .container {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

        /* HEADER */

        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(248, 246, 242, 0.93);
          backdrop-filter: blur(18px);
          border-bottom: 1px solid rgba(76, 65, 55, 0.08);
        }

        .headerInner {
          width: min(1240px, calc(100% - 48px));
          min-height: 86px;
          margin: auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 28px;
        }

        .brand {
          display: flex;
          align-items: center;
          color: var(--theme-primary);
          text-decoration: none;
          flex-shrink: 0;
        }

        .brand img {
          width: 150px;
          max-height: 57px;
          object-fit: contain;
          object-position: left center;
        }

        .brandText {
          display: flex;
          flex-direction: column;
        }

        .brandText strong {
          font-size: 23px;
          letter-spacing: 2px;
        }

        .brandText span {
          margin-top: 3px;
          color: #8e8176;
          font-size: 8px;
          letter-spacing: 1px;
        }

        .nav {
          display: flex;
          align-items: center;
          gap: 26px;
        }

        .nav > a,
        .dropdownButton {
          color: #494440;
          font-size: 11px;
          font-weight: 750;
          text-decoration: none;
          white-space: nowrap;
        }

        .nav > a:hover,
        .dropdownButton:hover {
          color: #a47d56;
        }

        .dropdown {
          position: relative;
          padding: 25px 0;
        }

        .dropdownButton {
          display: flex;
          align-items: center;
          gap: 5px;
          background: transparent;
          border: 0;
          cursor: pointer;
          font-family: inherit;
        }

        .dropdownMenu {
          position: absolute;
          top: 70px;
          left: 50%;
          width: 250px;
          padding: 8px;
          background: white;
          border: 1px solid var(--theme-border);
          border-radius: 15px;
          box-shadow: 0 18px 50px rgba(48, 48, 47, 0.13);
          transform: translate(-50%, 8px);
          opacity: 0;
          visibility: hidden;
          transition: 0.2s ease;
        }

        .dropdown:hover .dropdownMenu {
          opacity: 1;
          visibility: visible;
          transform: translate(-50%, 0);
        }

        .dropdownMenu a {
          display: block;
          padding: 12px;
          border-radius: 10px;
          color: var(--theme-primary);
          text-decoration: none;
        }

        .dropdownMenu a:hover,
        .dropdownMenu .activeDrop {
          background: #f5f0ea;
        }

        .dropdownMenu strong {
          display: block;
          font-size: 11px;
        }

        .dropdownMenu small {
          display: block;
          margin-top: 3px;
          color: var(--theme-muted);
          font-size: 8px;
        }

        .appointmentButton {
          padding: 12px 17px;
          background: var(--theme-primary);
          color: white;
          border-radius: 9px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 850;
          flex-shrink: 0;
        }

        /* HERO */

        .hero {
          position: relative;
          padding: 75px 0 105px;
          background: #eee7de;
          overflow: hidden;
        }

        .heroCircle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }

        .circleOne {
          width: 500px;
          height: 500px;
          top: -280px;
          right: -70px;
          border: 1px solid rgba(166, 130, 93, 0.16);
        }

        .circleTwo {
          width: 330px;
          height: 330px;
          right: 20px;
          top: -190px;
          border: 1px solid rgba(166, 130, 93, 0.12);
        }

        .heroInner {
          position: relative;
          z-index: 2;
        }

        .breadcrumb {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 70px;
          color: #9a8b7d;
          font-size: 9px;
          font-weight: 700;
        }

        .breadcrumb a {
          color: inherit;
          text-decoration: none;
        }

        .breadcrumb strong {
          color: #736558;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
          gap: 90px;
          align-items: end;
        }

        .eyebrow,
        .lightEyebrow {
          display: block;
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2.1px;
        }

        .hero h1 {
          max-width: 800px;
          margin: 16px 0 0;
          font-size: clamp(44px, 5.8vw, 73px);
          line-height: 1;
          letter-spacing: -3.8px;
        }

        .heroDescription {
          padding-bottom: 8px;
        }

        .goldLine {
          width: 45px;
          height: 2px;
          margin-bottom: 20px;
          background: var(--theme-accent);
        }

        .heroDescription p {
          margin: 0;
          color: #716a64;
          font-size: 13px;
          line-height: 1.9;
        }

        /* VISION MISSION */

        .vmSection {
          padding: 110px 0;
          background: var(--theme-background);
        }

        .vmGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .vmCard {
          min-height: 490px;
          padding: 38px;
          border-radius: var(--theme-radius);
        }

        .visionCard {
          background: white;
          border: 1px solid #ebe3d9;
        }

        .missionCard {
          background: var(--theme-primary);
          color: white;
        }

        .vmTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .vmNumber {
          color: #b3926d;
          font-size: 10px;
          font-weight: 900;
        }

        .vmLabel {
          color: #9a9086;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 1.3px;
        }

        .missionCard .vmLabel {
          color: #8e8882;
        }

        .vmIcon {
          width: 72px;
          height: 72px;
          display: grid;
          place-items: center;
          margin-top: 80px;
          border-radius: 50%;
          background: #eee5da;
        }

        .missionCard .vmIcon {
          background: rgba(198, 164, 125, 0.13);
        }

        .vmIcon span {
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
          font-family: Georgia, serif;
          font-size: 27px;
          font-weight: 700;
        }

        .missionCard .vmIcon span {
          color: var(--theme-accent);
        }

        .vmCard h2 {
          margin: 28px 0 18px;
          font-size: 39px;
          letter-spacing: -2px;
        }

        .vmCard p {
          max-width: 500px;
          margin: 0;
          color: var(--theme-muted);
          font-size: 13px;
          line-height: 1.95;
          white-space: pre-line;
        }

        .missionCard p {
          color: #b5aea8;
        }

        /* IMAGE */

        .imageSection {
          padding: 0 0 110px;
          background: var(--theme-background);
        }

        .imageWrap {
          position: relative;
          height: 570px;
          overflow: hidden;
          border-radius: var(--theme-radius);
          background: #d8ccbd;
        }

        .imageWrap > img {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }

        .imagePlaceholder {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          gap: 17px;
          background:
            linear-gradient(
              135deg,
              #cdbda9,
              #eee6dc
            );
          color: #594c40;
        }

        .imagePlaceholder > span {
          width: 100px;
          height: 100px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(73, 58, 45, 0.2);
          border-radius: 50%;
          font-size: 25px;
          font-weight: 900;
        }

        .imagePlaceholder strong {
          display: block;
          text-align: center;
          font-size: 18px;
        }

        .imagePlaceholder small {
          display: block;
          margin-top: 6px;
          text-align: center;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .imageOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(
              90deg,
              rgba(30, 29, 28, 0.72),
              rgba(30, 29, 28, 0.15) 65%,
              rgba(30, 29, 28, 0.05)
            );
        }

        .imageContent {
          position: absolute;
          left: 55px;
          bottom: 55px;
          max-width: 560px;
          color: white;
        }

        .imageContent > span {
          color: #d0ae84;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .imageContent h2 {
          margin: 12px 0 0;
          font-size: 44px;
          line-height: 1.05;
          letter-spacing: -2.3px;
        }

        /* PRINCIPLES */

        .principlesSection {
          padding: 110px 0;
          background: white;
        }

        .sectionHeading {
          max-width: 660px;
          margin-bottom: 55px;
        }

        .sectionHeading h2 {
          margin: 12px 0;
          font-size: 47px;
          letter-spacing: -2.3px;
        }

        .sectionHeading p {
          margin: 0;
          color: #7e756d;
          font-size: 13px;
          line-height: 1.7;
        }

        .principlesGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .principleCard {
          min-height: 300px;
          padding: 27px;
          background: var(--theme-background);
          border: 1px solid #eee7de;
          border-radius: var(--theme-radius);
          transition: 0.2s ease;
        }

        .principleCard:hover {
          transform: translateY(-4px);
          box-shadow: 0 18px 40px rgba(50, 44, 38, 0.07);
        }

        .principleTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .principleTop span {
          color: #a98660;
          font-size: 9px;
          font-weight: 900;
        }

        .principleTop i {
          width: 8px;
          height: 8px;
          border: 2px solid var(--theme-accent);
          border-radius: 50%;
        }

        .principleCard h3 {
          margin: 95px 0 13px;
          font-size: 18px;
        }

        .principleCard p {
          margin: 0;
          color: #7b736c;
          font-size: 11px;
          line-height: 1.8;
        }

        /* BRAND */

        .brandSection {
          padding: 100px 0;
          background: var(--theme-primary);
          color: white;
        }

        .brandGrid {
          display: grid;
          grid-template-columns: 0.85fr 1.15fr;
          gap: 100px;
        }

        .lightEyebrow {
          color: var(--theme-accent);
        }

        .brandGrid h2 {
          max-width: 510px;
          margin: 15px 0 0;
          font-size: 45px;
          line-height: 1.05;
          letter-spacing: -2.3px;
        }

        .brandPoints {
          display: flex;
          flex-direction: column;
        }

        .brandPoints > div {
          display: grid;
          grid-template-columns: 45px 1fr;
          gap: 22px;
          padding: 22px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .brandPoints > div:first-child {
          padding-top: 0;
        }

        .brandPoints span {
          color: var(--theme-accent);
          font-size: 9px;
          font-weight: 900;
        }

        .brandPoints p {
          margin: 0;
          color: #b8b0a9;
          font-size: 12px;
          line-height: 1.8;
        }

        /* CTA */

        .ctaSection {
          padding: 90px 0;
          background: var(--theme-border);
        }

        .ctaBox {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 50px;
          padding: 55px;
          background: var(--theme-primary);
          color: white;
          border-radius: var(--theme-radius);
        }

        .ctaBox h2 {
          max-width: 650px;
          margin: 12px 0;
          font-size: 40px;
          line-height: 1.08;
          letter-spacing: -2px;
        }

        .ctaBox p {
          max-width: 650px;
          margin: 0;
          color: color-mix(in srgb, var(--theme-muted) 55%, white);
          font-size: 12px;
          line-height: 1.7;
        }

        .ctaActions {
          display: flex;
          flex-direction: column;
          min-width: 220px;
          gap: 8px;
        }

        .primaryCta,
        .secondaryCta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-radius: 9px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 850;
        }

        .primaryCta {
          background: var(--theme-accent);
          color: var(--theme-text);
        }

        .secondaryCta {
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.16);
          color: white;
        }

        /* FOOTER */

        .footer {
          padding: 70px 0 25px;
          background: var(--theme-text);
          color: white;
        }

        .footerGrid {
          display: grid;
          grid-template-columns: 1.5fr 0.8fr 0.8fr 1fr;
          gap: 55px;
          padding-bottom: 50px;
        }

        .footerBrand img {
          width: 150px;
          max-height: 60px;
          object-fit: contain;
          object-position: left center;
          filter: brightness(0) invert(1);
        }

        .footerBrand h3 {
          margin: 0;
          font-size: 24px;
          letter-spacing: 2px;
        }

        .footer p,
        .footer a {
          color: #a9a29b;
          font-size: 10px;
          line-height: 1.8;
          text-decoration: none;
        }

        .footer a {
          display: block;
          margin-bottom: 7px;
        }

        .footer a:hover {
          color: color-mix(in srgb, var(--theme-accent) 82%, white);
        }

        .footerBrand p {
          max-width: 330px;
          margin-top: 18px;
        }

        .footer h4 {
          margin: 0 0 16px;
          color: color-mix(in srgb, var(--theme-accent) 82%, white);
          font-size: 10px;
          letter-spacing: 1px;
        }

        .footerBottom {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding-top: 22px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: #77716c;
          font-size: 8px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .nav {
            display: none;
          }

          .heroGrid {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .vmGrid {
            grid-template-columns: 1fr;
          }

          .principlesGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .brandGrid {
            grid-template-columns: 1fr;
            gap: 55px;
          }

          .footerGrid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 780px) {
          .container {
            width: min(100% - 32px, 1180px);
          }

          .headerInner {
            width: min(100% - 32px, 1240px);
          }

          .hero {
            padding: 50px 0 70px;
          }

          .breadcrumb {
            margin-bottom: 45px;
          }

          .hero h1 {
            font-size: 47px;
            letter-spacing: -2.6px;
          }

          .vmSection,
          .principlesSection,
          .brandSection {
            padding: 75px 0;
          }

          .vmCard {
            min-height: auto;
          }

          .vmIcon {
            margin-top: 55px;
          }

          .imageWrap {
            height: 460px;
          }

          .imageContent {
            left: 30px;
            right: 30px;
            bottom: 30px;
          }

          .imageContent h2 {
            font-size: 36px;
          }

          .ctaBox {
            flex-direction: column;
            align-items: flex-start;
            padding: 35px 25px;
          }

          .ctaActions {
            width: 100%;
          }
        }

        @media (max-width: 560px) {
          .brand img {
            width: 120px;
          }

          .brandText strong {
            font-size: 18px;
          }

          .appointmentButton {
            padding: 10px 12px;
            font-size: 8px;
          }

          .hero h1 {
            font-size: 39px;
          }

          .vmCard {
            padding: 27px;
          }

          .vmCard h2 {
            font-size: 33px;
          }

          .imageWrap {
            height: 390px;
          }

          .principlesGrid {
            grid-template-columns: 1fr;
          }

          .sectionHeading h2,
          .brandGrid h2,
          .ctaBox h2 {
            font-size: 34px;
          }

          .footerGrid {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .footerBottom {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}