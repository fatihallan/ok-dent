"use client";

import { useEffect, useState } from "react";
import { createClient } from "../../lib/supabaseClient";
import SiteHeader from "../../components/SiteHeader";
import SiteFooter from "../../components/SiteFooter";

export default function AboutPage() {
  const [about, setAbout] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    const supabase = createClient();

    try {
      const [aboutResult, settingsResult] = await Promise.all([
        supabase
          .from("about_page")
          .select("*")
          .eq("section_key", "main")
          .single(),

        supabase
          .from("site_settings")
          .select("*")
          .eq("setting_key", "main")
          .single(),
      ]);

      if (aboutResult.error) {
        console.error("Hakkımızda hatası:", aboutResult.error);
      }

      if (settingsResult.error) {
        console.error("Site ayarları hatası:", settingsResult.error);
      }

      setAbout(aboutResult.data || null);
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
        <p>{about?.loading_text || ""}</p>

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

  if (!about || !about.is_active) {
    return (
      <main className="hiddenPage">
        <div>
          <span>{about?.hidden_brand_text || ""}</span>
          <h1>{about?.hidden_title || ""}</h1>
          <p>{about?.hidden_description || ""}</p>
          <a href={about?.hidden_button_link || ""}>{about?.hidden_button_text || ""}</a>
        </div>

        <style jsx>{`
          .hiddenPage {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 30px;
            text-align: center;
            background: var(--theme-background);
            color: var(--theme-primary);
            font-family: Arial, sans-serif;
          }

          .hiddenPage div {
            max-width: 650px;
          }

          .hiddenPage span {
            color: #a9845e;
            font-size: 11px;
            font-weight: 900;
            letter-spacing: 2px;
          }

          .hiddenPage h1 {
            margin: 14px 0;
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

  return (
    <main>
      
      {/* ORTAK SITE HEADER */}
      <SiteHeader />

      <section className="hero">
        <div className="heroGlow"></div>

        <div className="container heroContent">
          <div className="breadcrumb">
            <a href="/">{about?.breadcrumb_home_text || ""}</a>
            <span>•</span>
            <span>{about?.breadcrumb_corporate_text || ""}</span>
            <span>•</span>
            <strong>{about?.breadcrumb_current_text || ""}</strong>
          </div>

          <div className="heroGrid">
            <div className="heroText">
              <span className="eyebrow">
                {about.eyebrow || ""}
              </span>

              <h1>
                {about.title || ""}
              </h1>

              <p>
                {about.description || ""}
              </p>
            </div>

            <div className="heroBadge">
              <span>{about?.hero_badge_mark || ""}</span>
              <div>
                <strong>{about?.hero_badge_title || ""}</strong>
                <small>{about?.hero_badge_text || ""}</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="storySection">
        <div className="container storyGrid">
          <div className="storyImageWrap">
            {about.image_url ? (
              <img
                src={about.image_url}
                alt={about.story_title || ""}
                className="storyImage"
              />
            ) : (
              <div className="storyPlaceholder">
                <div className="placeholderTooth">{about?.image_placeholder_mark || ""}</div>

                <div>
                  <strong>{about?.image_placeholder_title || ""}</strong>
                  <span>{about?.image_placeholder_text || ""}</span>
                </div>
              </div>
            )}

            <div className="imageCard">
              <strong>{about?.image_card_title || ""}</strong>
              <span>{about?.image_card_text || ""}</span>
            </div>
          </div>

          <div className="storyText">
            <span className="sectionEyebrow">
              {about?.story_eyebrow || ""}
            </span>

            <h2>
              {about.story_title || ""}
            </h2>

            <div className="goldLine"></div>

            <p>
              {about.story_text || ""}
            </p>

            <div className="storyNote">
              <div className="noteMark">“</div>

              <p>
{about?.story_note || ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="valuesSection">
        <div className="container">
          <div className="sectionHeading">
            <span className="sectionEyebrow">
              {about?.values_eyebrow || ""}
            </span>

            <h2>{about?.values_title || ""}</h2>

            <p>
{about?.values_description || ""}
            </p>
          </div>

          <div className="valueCards">
            <ValueCard
              number="01"
              title={about.value_1_title}
              text={about.value_1_text}
            />

            <ValueCard
              number="02"
              title={about.value_2_title}
              text={about.value_2_text}
            />

            <ValueCard
              number="03"
              title={about.value_3_title}
              text={about.value_3_text}
            />
          </div>
        </div>
      </section>

      <section className="principlesSection">
        <div className="container principlesGrid">
          <div>
            <span className="sectionEyebrow light">
              {about?.principles_eyebrow || ""}
            </span>

            <h2>
{about?.principles_title || ""}
            </h2>
          </div>

          <div className="principles">
            <div className="principle">
              <span>01</span>
              <div>
                <strong>{about?.principle_1_title || ""}</strong>
                <p>
{about?.principle_1_text || ""}
                </p>
              </div>
            </div>

            <div className="principle">
              <span>02</span>
              <div>
                <strong>{about?.principle_2_title || ""}</strong>
                <p>
{about?.principle_2_text || ""}
                </p>
              </div>
            </div>

            <div className="principle">
              <span>03</span>
              <div>
                <strong>{about?.principle_3_title || ""}</strong>
                <p>
{about?.principle_3_text || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ctaSection">
        <div className="container">
          <div className="ctaBox">
            <div>
              <span className="sectionEyebrow light">
                {about?.cta_eyebrow || ""}
              </span>

              <h2>
                {about.cta_title || ""}
              </h2>

              <p>
                {about.cta_text || ""}
              </p>
            </div>

            <div className="ctaActions">
              <a
                href={
                  about.cta_button_link || ""
                }
                className="primaryCta"
              >
                {about.cta_button_text || ""}
                <span>{about?.cta_button_arrow_text ?? ""}</span>
              </a>

              {settings?.whatsapp && (
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noreferrer"
                  className="secondaryCta"
                >
                  {about?.whatsapp_button_text || ""}
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
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        main {
          min-height: 100vh;
          overflow: hidden;
        }

        .container {
          width: min(1180px, calc(100% - 48px));
          margin: 0 auto;
        }

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
          text-decoration: none;
          color: var(--theme-primary);
          display: flex;
          align-items: center;
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
          font-size: 8px;
          letter-spacing: 1px;
          color: #8e8176;
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
          gap: 5px;
          align-items: center;
          background: transparent;
          border: 0;
          cursor: pointer;
          font-family: inherit;
        }

        .dropdownButton span {
          font-size: 13px;
          transform: translateY(-1px);
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

        .hero {
          position: relative;
          background: #eee7de;
          padding: 72px 0 84px;
          overflow: hidden;
        }

        .heroGlow {
          position: absolute;
          right: -160px;
          top: -230px;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle,
              rgba(194, 161, 123, 0.2),
              rgba(194, 161, 123, 0)
            );
        }

        .heroContent {
          position: relative;
          z-index: 2;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 65px;
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
          grid-template-columns: minmax(0, 1fr) 350px;
          gap: 90px;
          align-items: flex-end;
        }

        .eyebrow,
        .sectionEyebrow {
          display: block;
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2.1px;
        }

        .heroText h1 {
          max-width: 770px;
          margin: 15px 0 22px;
          font-size: clamp(45px, 6vw, 76px);
          line-height: 0.98;
          letter-spacing: -4px;
          font-weight: 700;
        }

        .heroText p {
          max-width: 690px;
          margin: 0;
          color: #746d66;
          font-size: 16px;
          line-height: 1.8;
        }

        .heroBadge {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 19px;
          background: rgba(255, 255, 255, 0.65);
          border: 1px solid rgba(255, 255, 255, 0.9);
          border-radius: var(--theme-radius);
          backdrop-filter: blur(10px);
        }

        .heroBadge > span {
          width: 54px;
          height: 54px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: var(--theme-accent);
          color: var(--theme-primary);
          font-size: 13px;
          font-weight: 900;
        }

        .heroBadge strong {
          display: block;
          font-size: 11px;
        }

        .heroBadge small {
          display: block;
          margin-top: 5px;
          color: #8b7e72;
          font-size: 8px;
          line-height: 1.5;
        }

        .storySection {
          padding: 110px 0;
          background: var(--theme-background);
        }

        .storyGrid {
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
          gap: 90px;
          align-items: center;
        }

        .storyImageWrap {
          position: relative;
        }

        .storyImage,
        .storyPlaceholder {
          width: 100%;
          height: 600px;
          border-radius: var(--theme-radius);
        }

        .storyImage {
          display: block;
          object-fit: cover;
        }

        .storyPlaceholder {
          background:
            linear-gradient(
              140deg,
              #dfd3c4,
              #f1ebe4
            );
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 15px;
          text-align: center;
          color: #6b5c4e;
        }

        .placeholderTooth {
          width: 95px;
          height: 95px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(85, 69, 54, 0.18);
          border-radius: 50%;
          font-size: 24px;
          font-weight: 900;
        }

        .storyPlaceholder strong {
          display: block;
          font-size: 18px;
        }

        .storyPlaceholder span {
          display: block;
          margin-top: 5px;
          font-size: 9px;
          letter-spacing: 1px;
        }

        .imageCard {
          position: absolute;
          right: -20px;
          bottom: 35px;
          min-width: 190px;
          padding: 20px;
          border-radius: var(--theme-radius);
          background: var(--theme-primary);
          color: white;
          box-shadow: 0 15px 45px rgba(48, 48, 47, 0.2);
        }

        .imageCard strong {
          display: block;
          color: #d0ad82;
          font-size: 16px;
        }

        .imageCard span {
          display: block;
          margin-top: 4px;
          color: #c3bbb3;
          font-size: 9px;
        }

        .storyText h2 {
          max-width: 520px;
          margin: 14px 0 17px;
          font-size: clamp(35px, 4vw, 52px);
          line-height: 1.03;
          letter-spacing: -2.5px;
        }

        .goldLine {
          width: 47px;
          height: 2px;
          margin: 25px 0;
          background: var(--theme-accent);
        }

        .storyText > p {
          margin: 0;
          color: #756e68;
          font-size: 14px;
          line-height: 1.95;
          white-space: pre-line;
        }

        .storyNote {
          display: grid;
          grid-template-columns: 45px 1fr;
          gap: 16px;
          margin-top: 35px;
          padding: 23px;
          background: var(--theme-border);
          border-radius: var(--theme-radius);
        }

        .noteMark {
          color: var(--theme-accent);
          font-family: Georgia, serif;
          font-size: 58px;
          line-height: 0.8;
        }

        .storyNote p {
          margin: 0;
          color: #655e58;
          font-size: 12px;
          line-height: 1.8;
        }

        .valuesSection {
          padding: 100px 0 115px;
          background: white;
        }

        .sectionHeading {
          max-width: 670px;
          margin: 0 auto 55px;
          text-align: center;
        }

        .sectionHeading h2 {
          margin: 11px 0 14px;
          font-size: 45px;
          letter-spacing: -2px;
        }

        .sectionHeading p {
          margin: 0;
          color: #7d746c;
          font-size: 13px;
          line-height: 1.7;
        }

        .valueCards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .principlesSection {
          padding: 100px 0;
          background: var(--theme-primary);
          color: white;
        }

        .principlesGrid {
          display: grid;
          grid-template-columns: 0.8fr 1.2fr;
          gap: 100px;
          align-items: start;
        }

        .sectionEyebrow.light {
          color: var(--theme-accent);
        }

        .principlesGrid > div:first-child h2 {
          max-width: 520px;
          margin: 15px 0 0;
          font-size: 44px;
          line-height: 1.05;
          letter-spacing: -2.2px;
        }

        .principles {
          display: flex;
          flex-direction: column;
        }

        .principle {
          display: grid;
          grid-template-columns: 50px 1fr;
          gap: 25px;
          padding: 25px 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .principle:first-child {
          padding-top: 0;
        }

        .principle > span {
          color: var(--theme-accent);
          font-size: 10px;
          font-weight: 900;
        }

        .principle strong {
          display: block;
          margin-bottom: 8px;
          font-size: 16px;
        }

        .principle p {
          margin: 0;
          color: #aaa39d;
          font-size: 11px;
          line-height: 1.7;
        }

        .ctaSection {
          padding: 90px 0;
          background: var(--theme-border);
        }

        .ctaBox {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 50px;
          padding: 55px;
          border-radius: var(--theme-radius);
          background: var(--theme-primary);
          color: white;
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
          min-width: 210px;
          gap: 8px;
        }

        .primaryCta,
        .secondaryCta {
          display: flex;
          justify-content: space-between;
          align-items: center;
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

        @media (max-width: 1050px) {
          .nav {
            display: none;
          }

          .heroGrid {
            grid-template-columns: 1fr;
            gap: 35px;
          }

          .heroBadge {
            width: fit-content;
          }

          .storyGrid {
            grid-template-columns: 1fr;
            gap: 60px;
          }

          .storyImage,
          .storyPlaceholder {
            height: 520px;
          }

          .imageCard {
            right: 20px;
          }

          .principlesGrid {
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

          .appointmentButton {
            padding: 10px 12px;
          }

          .hero {
            padding: 50px 0 60px;
          }

          .breadcrumb {
            margin-bottom: 42px;
          }

          .heroText h1 {
            font-size: 47px;
            letter-spacing: -2.6px;
          }

          .heroText p {
            font-size: 13px;
          }

          .storySection,
          .valuesSection,
          .principlesSection {
            padding: 75px 0;
          }

          .storyImage,
          .storyPlaceholder {
            height: 440px;
          }

          .valueCards {
            grid-template-columns: 1fr;
          }

          .ctaBox {
            flex-direction: column;
            align-items: flex-start;
            padding: 35px 25px;
          }

          .ctaActions {
            width: 100%;
          }

          .footerGrid {
            grid-template-columns: 1fr;
            gap: 35px;
          }
        }

        @media (max-width: 520px) {
          .brand img {
            width: 120px;
          }

          .brandText strong {
            font-size: 18px;
          }

          .appointmentButton {
            font-size: 8px;
          }

          .heroText h1 {
            font-size: 39px;
          }

          .heroBadge {
            width: 100%;
          }

          .storyImage,
          .storyPlaceholder {
            height: 360px;
          }

          .imageCard {
            position: relative;
            right: auto;
            bottom: auto;
            width: 100%;
            margin-top: 10px;
          }

          .storyText h2,
          .sectionHeading h2,
          .principlesGrid > div:first-child h2,
          .ctaBox h2 {
            font-size: 34px;
          }

          .footerBottom {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}

function ValueCard({ number, title, text }) {
  return (
    <article className="valueCard">
      <span>{number}</span>

      <div className="iconCircle">
        <div></div>
      </div>

      <h3>{title || ""}</h3>

      <p>
        {text || ""}
      </p>

      <style jsx>{`
        .valueCard {
          position: relative;
          min-height: 280px;
          padding: 30px;
          background: var(--theme-background);
          border: 1px solid #eee7de;
          border-radius: 17px;
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .valueCard:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 45px rgba(60, 51, 43, 0.08);
        }

        .valueCard > span {
          position: absolute;
          top: 22px;
          right: 24px;
          color: #c7b39c;
          font-size: 9px;
          font-weight: 900;
        }

        .iconCircle {
          width: 49px;
          height: 49px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #eadfd2;
        }

        .iconCircle div {
          width: 17px;
          height: 17px;
          border: 2px solid color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
          border-radius: 50% 50% 48% 52%;
        }

        h3 {
          margin: 47px 0 11px;
          color: var(--theme-primary);
          font-size: 18px;
        }

        p {
          margin: 0;
          color: #79716a;
          font-size: 11px;
          line-height: 1.8;
        }
      `}</style>
    </article>
  );
}