"use client";

import { useEffect, useState } from "react";
import { createClient } from "./lib/supabaseClient";
import SiteHeader from "./components/SiteHeader";
import SiteFooter from "./components/SiteFooter";

export default function HomePage() {
  const [hero, setHero] = useState(null);
  const [services, setServices] = useState([]);
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [settings, setSettings] = useState(null);
  const [homepage, setHomepage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSite();
  }, []);

  async function loadSite() {
    const supabase = createClient();

    try {
      // Önce ana sayfa mikro ayarlarını yükle; böylece yükleme ekranı bile CMS'ten gelir.
      const earlyHomepageResult = await supabase
        .from("homepage_settings")
        .select("*")
        .eq("setting_key", "main")
        .single();

      if (earlyHomepageResult.data) {
        setHomepage(earlyHomepageResult.data);
      }

      const [
        heroResult,
        servicesResult,
        clinicResult,
        doctorsResult,
        galleryResult,
        testimonialsResult,
        settingsResult,
      ] = await Promise.all([
        supabase
          .from("site_content")
          .select("*")
          .eq("section", "hero")
          .single(),

        supabase
          .from("services")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("clinic_section")
          .select("*")
          .eq("section_key", "clinic")
          .single(),

        supabase
          .from("doctors")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("gallery")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("sort_order", { ascending: true }),

        supabase
          .from("site_settings")
          .select("*")
          .eq("setting_key", "main")
          .single(),
      ]);

      if (heroResult.data) setHero(heroResult.data);
      if (servicesResult.data) setServices(servicesResult.data);
      if (clinicResult.data) setClinic(clinicResult.data);
      if (doctorsResult.data) setDoctors(doctorsResult.data);
      if (galleryResult.data) setGallery(galleryResult.data);
      if (testimonialsResult.data) {
        setTestimonials(testimonialsResult.data);
      }
      if (settingsResult.data) setSettings(settingsResult.data);
    } catch (error) {
      console.error("Site yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
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

  function renderStars(rating = 5) {
    return Array.from({ length: 5 }).map((_, index) => (
      <span
        key={index}
        className={index < rating ? "star activeStar" : "star"}
      >
        ★
      </span>
    ));
  }

  if (loading) {
    return (
      <main className="loading">
        <div className="loadingLogo">{homepage?.loading_mark ?? ""}</div>
        <span>{homepage?.loading_text ?? ""}</span>

        <style jsx>{`
          .loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            gap: 14px;
            align-items: center;
            justify-content: center;
            background: var(--theme-background);
            color: var(--theme-primary);
            font-family: Arial, sans-serif;
          }

          .loadingLogo {
            width: 60px;
            height: 60px;
            border-radius: var(--theme-radius);
            background: var(--theme-primary);
            color: var(--theme-accent);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
          }

          .loading span {
            color: #817970;
            font-size: 13px;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main>
      {/* ORTAK SITE HEADER */}
      <SiteHeader />

      {/* HERO */}

      {hero?.is_active !== false &&
       homepage?.hero_visible !== false && (
        <section className="hero" id="anasayfa">
          <div className="container heroGrid">
            <div className="heroContent">
              <div className="heroEyebrow">
                <span />

                {hero?.subtitle || ""}
              </div>

              <h1>
                {hero?.title || ""}
              </h1>

              <p className="heroDescription">
                {hero?.description || ""}
              </p>

              <div className="heroActions">
                <a 
                  href={hero?.button_link || ""}
                  className="primaryButton"
                >
                  {hero?.button_text || ""}
                  <span>{homepage?.hero_primary_arrow_text ?? ""}</span>
                </a>

                <a
                  href={
                  homepage?.hero_secondary_button_link || ""
                  }
                  className="secondaryButton"
                >
                   {homepage?.hero_secondary_button_text || ""}
                  <span>{homepage?.hero_secondary_arrow_text ?? ""}</span>
                </a>
              </div>

              <div className="heroTrust">
                <div className="trustIcon">{homepage?.hero_trust_icon_text ?? ""}</div>

                <div>
                  <strong>
                    {settings?.clinic_name || ""}
                  </strong>

                  <span>
                    {settings?.clinic_subtitle || ""}
                  </span>
                </div>
              </div>
            </div>

            {/* ARTIK KAPSÜL YOK :) */}

            <div className="heroPhotoSide">
              {hero?.image_url ? (
                <img
                  src={hero.image_url}
                  alt={
                    settings?.clinic_name || ""
                  }
                  className="heroPhoto"
                />
              ) : (
                <div className="heroFallback">
                  <strong>{homepage?.hero_fallback_brand_top || ""}</strong>
                  <span>{homepage?.hero_fallback_brand_bottom || ""}</span>

                  <p>
                    {homepage?.hero_fallback_text || ""}
                  </p>
                </div>
              )}

              <div className="heroImageShade" />

              <div className="heroPhotoInfo">
                <div className="heroPhotoInfoIcon">✓</div>

                <div>
                  <strong>
                   {homepage?.hero_card_title || ""}
                  </strong>
                  <span>
                    {homepage?.hero_card_text || ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* İSTATİSTİK */}


{homepage?.stats_visible !== false && (
  <section className="stats">
    <div className="container statsGrid">
      <div className="statItem">
        <strong>
          {homepage?.stat_1_number || ""}
        </strong>
        <span>
          {homepage?.stat_1_text || ""}
        </span>
      </div>

      <div className="statItem">
        <strong>
          {homepage?.stat_2_number || ""}
        </strong>
        <span>
          {homepage?.stat_2_text || ""}
        </span>
      </div>

      <div className="statItem">
        <strong>
          {homepage?.stat_3_number || ""}
        </strong>
        <span>
          {homepage?.stat_3_text || ""}
        </span>
      </div>

      <div className="statItem">
        <strong>
          {homepage?.stat_4_number || ""}
        </strong>
        <span>
          {homepage?.stat_4_text || ""}
        </span>
      </div>
    </div>
  </section>
)}

{/* HİZMETLER */}
      {/* HİZMETLER */}

      {homepage?.services_visible !== false &&
  services.length > 0 && (
        <section
          className="section servicesSection"
          id="hizmetler"
        >
          <div className="container">
            <div className="sectionHeading">
              <div>
                <span className="sectionEyebrow">
  {homepage?.services_eyebrow || ""}
</span>

<h2>
  {homepage?.services_title || ""}
</h2>
              </div>

              <p>
               {homepage?.services_description || ""}
              </p>
            </div>

            <div className="servicesGrid">
              {services.map((service, index) => (
                <article
                  className="serviceCard"
                  key={service.id}
                >
                  <div className="serviceImage">
                    {service.image_url ? (
                      <img
                        src={service.image_url}
                        alt={service.title}
                      />
                    ) : (
                      <div className="servicePlaceholder">
                        <span>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    )}

                    <span className="serviceNumber">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="serviceContent">
                    <span className="cardLine" />

                    <h3>{service.title}</h3>

                    <p>{service.description}</p>

                    {service.button_text && (
                      <a
                        href={
                          service.button_link || ""
                        }
                        className="textLink"
                      >
                        {service.button_text}
                        <span>{homepage?.common_link_arrow_text ?? ""}</span>
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KLİNİK */}

      {homepage?.clinic_visible !== false &&
  clinic?.is_active && (
        <section
          className="section clinicSection"
          id="klinik"
        >
          <div className="container clinicGrid">
            <div className="clinicImage">
              {clinic.image_url ? (
                <img
                  src={clinic.image_url}
                  alt={homepage?.clinic_image_alt_text ?? ""}
                />
              ) : (
                <div className="clinicPlaceholder">
                  <span>{homepage?.clinic_placeholder_top ?? ""}</span>
                  <small>{homepage?.clinic_placeholder_bottom ?? ""}</small>
                </div>
              )}

              <div className="clinicImageBadge">
                <strong>{homepage?.clinic_image_badge_title || ""}</strong>
                <span>{homepage?.clinic_image_badge_text || ""}</span>
              </div>
            </div>

            <div className="clinicContent">
              <span className="sectionEyebrow">
                {clinic.eyebrow || ""}
              </span>

              <h2>
                {clinic.title || ""}
              </h2>

              <p className="clinicDescription">
                {clinic.description}
              </p>

              <div className="featureList">
                {clinic.feature_1 && (
                  <div className="featureItem">
                    <span>✓</span>
                    <p>{clinic.feature_1}</p>
                  </div>
                )}

                {clinic.feature_2 && (
                  <div className="featureItem">
                    <span>✓</span>
                    <p>{clinic.feature_2}</p>
                  </div>
                )}

                {clinic.feature_3 && (
                  <div className="featureItem">
                    <span>✓</span>
                    <p>{clinic.feature_3}</p>
                  </div>
                )}
              </div>

              <a
  href={
    homepage?.clinic_button_link || ""
  }
  className="darkButton"
>
  {homepage?.clinic_button_text || ""}
  <span>{homepage?.common_link_arrow_text ?? ""}</span>
</a>
            </div>
          </div>
        </section>
      )}

      {/* DOKTORLAR */}

      {homepage?.doctors_visible !== false &&
  doctors.length > 0 && (
        <section
          className="section doctorsSection"
          id="doktorlar"
        >
          <div className="container">
            <div className="splitHeading">
              <div><span className="sectionEyebrow">
  {homepage?.doctors_eyebrow || ""}
</span>

<h2>
  {homepage?.doctors_title || ""}
</h2>
              </div>

              <div className="splitHeadingRight">
                <span className="countBadge">
                  {String(doctors.length).padStart(2, "0")}
                </span>

                <div>
                  <p>
  {homepage?.doctors_description || ""}
</p>

                 <a
  href={
    homepage?.doctors_button_link || ""
  }
  className="headingLink"
>
  {homepage?.doctors_button_text || ""}
  <span>{homepage?.common_link_arrow_text ?? ""}</span>
</a>
                </div>
              </div>
            </div>

            <div className="doctorsGrid">
              {doctors.slice(0, 3).map((doctor, index) => (
                <article
                  className="doctorCard"
                  key={doctor.id}
                >
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

                    <div className="doctorSpecialtyFloating">
                      {doctor.specialty ||
                        homepage?.doctor_default_specialty || ""}
                    </div>
                  </div>

                  <div className="doctorContent">
                    <span className="doctorTitle">
                      {doctor.title ||
                        homepage?.doctor_default_title || ""}
                    </span>

                    <h3>{doctor.full_name}</h3>

                    {doctor.description && (
                      <p>{doctor.description}</p>
                    )}

                    <a
                      href={homepage?.doctor_card_button_link || ""}
                      className="doctorLink"
                    >
                      {homepage?.doctor_card_button_text || ""}
                      <span>{homepage?.common_link_arrow_text ?? ""}</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GALERİ */}

      {homepage?.gallery_visible !== false &&
  gallery.length > 0 && (
        <section
          className="section gallerySection"
          id="galeri"
        >
          <div className="container">
            <div className="splitHeading">
              <div>
                <span className="sectionEyebrow">
  {homepage?.gallery_eyebrow || ""}
</span>

<h2>
  {homepage?.gallery_title || ""}
</h2>
              </div>

              <div className="splitHeadingRight">
                <span className="countBadge">
                  {String(gallery.length).padStart(2, "0")}
                </span>

                <p>
  {homepage?.gallery_description || ""}
</p>
              </div>
            </div>

            <div className="galleryGrid">
              {gallery.slice(0, 6).map((item, index) => (
                <article
                  className={`galleryItem ${
                    index === 0 ? "galleryLarge" : ""
                  }`}
                  key={item.id}
                >
                  <img
                    src={item.image_url}
                    alt={
                      item.title ||
                      homepage?.gallery_default_alt_text || ""
                    }
                  />

                  <div className="galleryShade" />

                  <div className="galleryInfo">
                    {item.category && (
                      <span>{item.category}</span>
                    )}

                    {item.title && (
                      <h3>{item.title}</h3>
                    )}

                    {item.description && (
                      <p>{item.description}</p>
                    )}
                  </div>

                  <div className="galleryIndex">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* HASTA YORUMLARI */}

      {homepage?.testimonials_visible !== false &&
  testimonials.length > 0 && (
        <section
          className="section testimonialsSection"
          id="yorumlar"
        >
          <div className="container">
            <div className="testimonialHeading"><span className="sectionEyebrow">
  {homepage?.testimonials_eyebrow || ""}
</span>

<h2>
  {homepage?.testimonials_title || ""}
</h2>

<p>
  {homepage?.testimonials_description || ""}
</p>
            </div>

            <div className="testimonialsGrid">
              {testimonials.slice(0, 6).map((item) => (
                <article
                  className="testimonialCard"
                  key={item.id}
                >
                  <div className="testimonialQuote">“</div>

                  <div className="testimonialStars">
                    {renderStars(item.rating)}
                  </div>

                  <p className="testimonialText">
                    {item.comment}
                  </p>

                  <div className="testimonialPatient">
                    <div className="patientLetter">
                      {item.patient_name
                        ?.charAt(0)
                        ?.toUpperCase() || ""}
                    </div>

                    <div>
                      <strong>{item.patient_name}</strong>

                      {item.treatment && (
                        <span>{item.treatment}</span>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* RANDEVU CTA */}

{homepage?.appointment_visible !== false && (
<section className="appointmentStrip">
        <div className="container appointmentStripInner">
          <div>
            <span className="appointmentEyebrow">
  {homepage?.appointment_eyebrow || ""}
</span>

            <h2>
  {homepage?.appointment_title || ""}
</h2>
          </div>

          <div className="appointmentRight">
            <p>
  {homepage?.appointment_description || ""}
</p>

            <a
  href={
    homepage?.appointment_button_link || ""
  }
  className="appointmentButton"
>
  {homepage?.appointment_button_text || ""}
  <span>{homepage?.common_link_arrow_text ?? ""}</span>
</a>
          </div>
        </div>
      </section>
)}

{/* İLETİŞİM */}

      {homepage?.contact_visible !== false && (
<section className="contactSection" id="iletisim">
        <div className="container">
          <div className="contactCard">
            <div className="contactContent">
              <span className="contactEyebrow">
                {homepage?.contact_eyebrow ||
                  settings?.clinic_name || ""}
              </span>

              <h2>
                {homepage?.contact_title || ""}
              </h2>

              <p>
                {homepage?.contact_description || ""}
              </p>

              <div className="contactActions">
                <a
                  href={homepage?.contact_primary_button_link || ""}
                  className="goldButton"
                >
                  {homepage?.contact_primary_button_text || ""}
                  <span>{homepage?.common_link_arrow_text ?? ""}</span>
                </a>

                {settings?.phone && (
                  <a
                    href={phoneHref(settings.phone)}
                    className="outlineButton"
                  >
                    {homepage?.contact_phone_button_text || ""}
                  </a>
                )}

                {settings?.whatsapp && (
                  <a
                    href={whatsappHref(settings.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="outlineButton"
                  >
                    {homepage?.contact_whatsapp_button_text || ""}
                  </a>
                )}
              </div>
            </div>

            <div className="contactInfo">
              {settings?.phone && (
                <div className="contactInfoItem">
                  <span>{homepage?.contact_phone_label || ""}</span>
                  <strong>{settings.phone}</strong>
                </div>
              )}

              {settings?.email && (
                <div className="contactInfoItem">
                  <span>{homepage?.contact_email_label || ""}</span>

                  <a href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                </div>
              )}

              {settings?.address && (
                <div className="contactInfoItem">
                  <span>{homepage?.contact_address_label || ""}</span>
                  <strong>{settings.address}</strong>
                </div>
              )}

              {settings?.working_hours && (
                <div className="contactInfoItem">
                  <span>{homepage?.contact_hours_label || ""}</span>
                  <strong>{settings.working_hours}</strong>
                </div>
              )}
            </div>
          </div>
        </div>
        </section>
      )}

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
          font-family: Arial, Helvetica, sans-serif;
        }

        :global(.star) {
          color: #d8d0c7;
        }

        :global(.activeStar) {
          color: var(--theme-accent);
        }

        main {
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
        .dropdownButton:hover {
          color: #a17d55;
        }

        /* KURUMSAL DROPDOWN */

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
          font-size: 12px;
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

        /* HERO */

        .hero {
          min-height: 725px;
          display: flex;
          align-items: center;
          background: #f1ece5;
        }

        .heroGrid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 70px;
          align-items: center;
          padding: 62px 0;
        }

        .heroEyebrow {
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          gap: 11px;
          color: #9a7956;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 2.1px;
          text-transform: uppercase;
        }

        .heroEyebrow > span {
          width: 35px;
          height: 1px;
          background: var(--theme-accent);
        }

        .hero h1 {
          margin: 0;
          max-width: 650px;
          color: #2d2d2c;
          font-size: clamp(52px, 5.3vw, 76px);
          line-height: 0.99;
          letter-spacing: -4px;
        }

        .heroDescription {
          max-width: 555px;
          margin: 30px 0;
          color: #756f69;
          font-size: 15px;
          line-height: 1.85;
        }

        .heroActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .primaryButton,
        .secondaryButton,
        .darkButton,
        .goldButton,
        .outlineButton,
        .appointmentButton {
          display: inline-flex;
          align-items: center;
          justify-content: space-between;
          gap: 22px;
          padding: 15px 19px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
        }

        .primaryButton,
        .darkButton {
          background: var(--theme-primary);
          color: white;
        }

        .primaryButton span,
        .darkButton span {
          color: #d2b590;
        }

        .secondaryButton {
          border: 1px solid #d5c9bb;
          background: rgba(255, 255, 255, 0.52);
          color: #675d53;
        }

        .heroTrust {
          margin-top: 41px;
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .trustIcon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #e5d5c1;
          color: #896744;
          font-weight: 900;
        }

        .heroTrust > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .heroTrust strong {
          font-size: 12px;
        }

        .heroTrust span {
          color: #8c8176;
          font-size: 9px;
        }

        /* HERO FOTOĞRAF - GENİŞ, KAREYE YAKIN */

        .heroPhotoSide {
          position: relative;
          width: 100%;
          height: 610px;
          overflow: hidden;
          border-radius: var(--theme-radius);
          background: #ddd4c8;
          box-shadow: 0 32px 75px rgba(43, 38, 33, 0.14);
        }

        .heroPhoto {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          transition: transform 0.8s ease;
        }

        .heroPhotoSide:hover .heroPhoto {
          transform: scale(1.015);
        }

        .heroImageShade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(28, 27, 25, 0.32),
            transparent 42%
          );
          pointer-events: none;
        }

        .heroFallback {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--theme-primary);
          color: white;
        }

        .heroFallback strong {
          color: #c5a17a;
          font-size: 70px;
        }

        .heroFallback > span {
          letter-spacing: 8px;
          color: #d5ccc2;
        }

        .heroFallback p {
          margin-top: 25px;
          max-width: 260px;
          color: #aaa198;
          text-align: center;
          font-size: 10px;
        }

        .heroPhotoInfo {
          position: absolute;
          left: 24px;
          bottom: 24px;
          padding: 15px 18px;
          display: flex;
          align-items: center;
          gap: 12px;
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: var(--theme-radius);
          background: rgba(255, 255, 255, 0.93);
          backdrop-filter: blur(15px);
        }

        .heroPhotoInfoIcon {
          width: 37px;
          height: 37px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          background: color-mix(in srgb, var(--theme-accent) 25%, var(--theme-background));
          color: #8f6a43;
          font-weight: 900;
        }

        .heroPhotoInfo > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .heroPhotoInfo strong {
          color: var(--theme-primary);
          font-size: 11px;
        }

        .heroPhotoInfo span {
          color: #8c8278;
          font-size: 8px;
        }

        /* STATS */

        .stats {
          background: var(--theme-primary);
          color: white;
        }

        .statsGrid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
        }

        .statItem {
          padding: 29px 25px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .statItem strong {
          color: #d1b18a;
          font-size: 27px;
        }

        .statItem span {
          color: #c2b9af;
          font-size: 10px;
        }

        /* GENERAL */

        .section {
          padding: 105px 0;
        }

        .sectionEyebrow,
        .appointmentEyebrow {
          display: inline-block;
          margin-bottom: 16px;
          color: #a17f59;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .sectionHeading,
        .splitHeading {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 80px;
          align-items: end;
          margin-bottom: 55px;
        }

        .sectionHeading h2,
        .clinicContent h2,
        .splitHeading h2,
        .testimonialHeading h2,
        .appointmentStrip h2 {
          margin: 0;
          color: var(--theme-primary);
          font-size: clamp(39px, 5vw, 58px);
          line-height: 1.04;
          letter-spacing: -2.5px;
        }

        .sectionHeading > p,
        .splitHeadingRight p {
          max-width: 430px;
          margin: 0;
          color: #78716a;
          font-size: 13px;
          line-height: 1.8;
        }

        .splitHeadingRight {
          display: flex;
          gap: 22px;
          align-items: flex-start;
        }

        .countBadge {
          width: 54px;
          height: 54px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--theme-radius);
          background: #ebdfd0;
          color: #987654;
          font-weight: 900;
        }

        .headingLink {
          margin-top: 15px;
          display: inline-flex;
          gap: 15px;
          color: color-mix(in srgb, var(--theme-accent) 65%, var(--theme-primary));
          text-decoration: none;
          font-size: 10px;
          font-weight: 900;
        }

        /* SERVICES */

        .servicesSection,
        .doctorsSection,
        .testimonialsSection {
          background: color-mix(in srgb, var(--theme-background) 82%, white);
        }

        .servicesGrid,
        .doctorsGrid,
        .testimonialsGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .serviceCard,
        .doctorCard,
        .testimonialCard {
          overflow: hidden;
          border: 1px solid var(--theme-border);
          border-radius: var(--theme-radius);
          background: white;
          transition: 0.3s;
        }

        .serviceCard:hover,
        .doctorCard:hover,
        .testimonialCard:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 55px rgba(45, 40, 35, 0.07);
        }

        .serviceImage {
          position: relative;
          height: 235px;
          overflow: hidden;
          background: #ebe4da;
        }

        .serviceImage img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .servicePlaceholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ebe3d9;
        }

        .servicePlaceholder span {
          color: #ad9477;
          font-size: 40px;
          font-weight: 900;
        }

        .serviceNumber,
        .doctorNumber,
        .galleryIndex {
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(47, 47, 46, 0.92);
          color: #d3b48e;
          font-size: 9px;
          font-weight: 900;
        }

        .serviceNumber {
          top: 15px;
          left: 15px;
          width: 38px;
          height: 38px;
          border-radius: 9px;
        }

        .serviceContent,
        .doctorContent {
          padding: 25px;
        }

        .cardLine {
          display: block;
          width: 34px;
          height: 2px;
          margin-bottom: 17px;
          background: var(--theme-accent);
        }

        .serviceContent h3 {
          margin: 0 0 11px;
          font-size: 20px;
        }

        .serviceContent p,
        .doctorContent p {
          margin: 0;
          color: #807972;
          font-size: 12px;
          line-height: 1.7;
        }

        .serviceContent p {
          min-height: 60px;
        }

        .textLink,
        .doctorLink {
          display: inline-flex;
          gap: 14px;
          margin-top: 20px;
          color: color-mix(in srgb, var(--theme-accent) 65%, var(--theme-primary));
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
        }

        /* CLINIC */

        .clinicSection,
        .gallerySection {
          background: var(--theme-border);
        }

        .clinicGrid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .clinicImage {
          position: relative;
          height: 610px;
          overflow: hidden;
          border-radius: var(--theme-radius);
          background: #ddd3c7;
        }

        .clinicImage > img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .clinicPlaceholder {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: var(--theme-primary);
          color: white;
        }

        .clinicPlaceholder span {
          color: #c7a57c;
          font-size: 72px;
          font-weight: 900;
        }

        .clinicPlaceholder small {
          letter-spacing: 7px;
        }

        .clinicImageBadge {
          position: absolute;
          left: 20px;
          bottom: 20px;
          padding: 15px 20px;
          display: flex;
          flex-direction: column;
          border-radius: var(--theme-radius);
          background: rgba(255, 255, 255, 0.94);
        }

        .clinicImageBadge strong {
          font-size: 18px;
        }

        .clinicImageBadge span {
          color: #9a8063;
          font-size: 9px;
        }

        .clinicDescription {
          margin: 25px 0;
          color: #716a63;
          font-size: 14px;
          line-height: 1.85;
        }

        .featureList {
          margin: 28px 0;
        }

        .featureItem {
          padding: 13px 0;
          display: flex;
          align-items: center;
          gap: 12px;
          border-bottom: 1px solid #d8cdc0;
        }

        .featureItem > span {
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #d9c6ae;
          color: #795a39;
          font-weight: 900;
        }

        .featureItem p {
          margin: 0;
          font-size: 12px;
          font-weight: 700;
        }

        /* DOCTORS */

        .doctorImageWrap {
          position: relative;
          height: 420px;
          overflow: hidden;
          background: #e1d8cc;
        }

        .doctorImage {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center top;
        }

        .doctorPlaceholder {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #ded3c6;
        }

        .doctorPlaceholder span {
          color: rgba(60, 55, 50, 0.25);
          font-size: 90px;
          font-weight: 900;
        }

        .doctorNumber {
          top: 18px;
          left: 18px;
          width: 41px;
          height: 41px;
          border-radius: 10px;
        }

        .doctorSpecialtyFloating {
          position: absolute;
          left: 18px;
          right: 18px;
          bottom: 18px;
          padding: 12px 14px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.94);
          color: #8b6b49;
          font-size: 10px;
          font-weight: 900;
        }

        .doctorTitle {
          color: #98795a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .doctorContent h3 {
          margin: 8px 0 13px;
          font-size: 23px;
        }

        /* GALLERY */

        .galleryGrid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-auto-rows: 270px;
          gap: 16px;
        }

        .galleryItem {
          position: relative;
          overflow: hidden;
          border-radius: var(--theme-radius);
          background: #ddd4c8;
        }

        .galleryLarge {
          grid-column: span 2;
          grid-row: span 2;
        }

        .galleryItem img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: 0.5s;
        }

        .galleryItem:hover img {
          transform: scale(1.04);
        }

        .galleryShade {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(30, 29, 27, 0.82),
            transparent 62%
          );
        }

        .galleryInfo {
          position: absolute;
          z-index: 2;
          left: 22px;
          right: 22px;
          bottom: 20px;
          color: white;
        }

        .galleryInfo span {
          color: #d6b78f;
          font-size: 9px;
          font-weight: 900;
        }

        .galleryInfo h3 {
          margin: 7px 0 0;
        }

        .galleryInfo p {
          color: #ddd8d1;
          font-size: 10px;
        }

        .galleryIndex {
          z-index: 2;
          top: 16px;
          right: 16px;
          width: 36px;
          height: 36px;
          border-radius: 9px;
        }

        /* TESTIMONIALS */

        .testimonialHeading {
          max-width: 760px;
          margin-bottom: 50px;
        }

        .testimonialHeading > p {
          color: #7c756e;
          font-size: 13px;
          line-height: 1.8;
        }

        .testimonialCard {
          position: relative;
          min-height: 295px;
          padding: 28px;
          display: flex;
          flex-direction: column;
        }

        .testimonialCard:first-child {
          background: var(--theme-primary);
          color: white;
        }

        .testimonialQuote {
          position: absolute;
          top: -18px;
          right: 18px;
          color: rgba(194, 161, 123, 0.16);
          font-family: Georgia, serif;
          font-size: 120px;
        }

        .testimonialText {
          flex: 1;
          margin: 26px 0 30px;
          color: #68615a;
          font-family: Georgia, serif;
          font-size: 16px;
          line-height: 1.7;
        }

        .testimonialCard:first-child .testimonialText {
          color: #ded9d3;
        }

        .testimonialPatient {
          display: flex;
          align-items: center;
          gap: 11px;
        }

        .patientLetter {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #e8d9c7;
          color: #80613f;
          font-weight: 900;
        }

        .testimonialPatient > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .testimonialPatient strong {
          font-size: 12px;
        }

        .testimonialPatient span {
          color: #a19182;
          font-size: 9px;
        }

        /* APPOINTMENT */

        .appointmentStrip {
          padding: 85px 0;
          background: #e8dccd;
        }

        .appointmentStripInner {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          gap: 80px;
          align-items: end;
        }

        .appointmentRight p {
          max-width: 440px;
          margin: 0 0 20px;
          color: #6f685f;
          font-size: 13px;
          line-height: 1.8;
        }

        .appointmentButton {
          background: var(--theme-primary);
          color: white;
        }

        .appointmentButton span {
          color: color-mix(in srgb, var(--theme-accent) 82%, white);
        }

        /* CONTACT */

        .contactSection {
          padding: 90px 0;
          background: color-mix(in srgb, var(--theme-background) 82%, white);
        }

        .contactCard {
          padding: 65px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          border-radius: var(--theme-radius);
          background: var(--theme-primary);
          color: white;
        }

        .contactEyebrow {
          color: #d0ad84;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .contactContent h2 {
          margin: 20px 0 0;
          font-size: clamp(44px, 5vw, 65px);
          line-height: 1;
          letter-spacing: -3px;
        }

        .contactContent p {
          max-width: 520px;
          color: #c8c1b9;
          font-size: 13px;
          line-height: 1.8;
        }

        .contactActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .goldButton {
          background: var(--theme-accent);
          color: #2e2d2c;
        }

        .outlineButton {
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: white;
        }

        .contactInfo {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .contactInfoItem {
          padding: 19px 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.09);
        }

        .contactInfoItem > span {
          color: #bb9a75;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 1.4px;
        }

        .contactInfoItem strong,
        .contactInfoItem a {
          color: white;
          text-decoration: none;
          font-size: 12px;
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
          max-width: 170px;
          object-fit: contain;
          background: white;
          border-radius: 7px;
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
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: #8c857d;
          font-size: 9px;
        }

        /* RESPONSIVE */

        @media (max-width: 1050px) {
          .nav {
            display: none;
          }

          .heroGrid {
            grid-template-columns: 1fr;
          }

          .heroPhotoSide {
            height: 600px;
          }

          .servicesGrid,
          .doctorsGrid,
          .testimonialsGrid {
            grid-template-columns: repeat(2, 1fr);
          }

          .clinicGrid,
          .sectionHeading,
          .splitHeading,
          .appointmentStripInner,
          .contactCard {
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

          .hero {
            min-height: auto;
          }

          .heroGrid {
            padding: 55px 0 65px;
            gap: 45px;
          }

          .hero h1 {
            font-size: 47px;
            letter-spacing: -2.7px;
          }

          .heroPhotoSide {
            height: 470px;
            border-radius: var(--theme-radius);
          }

          .statsGrid {
            grid-template-columns: 1fr 1fr;
          }

          .section {
            padding: 75px 0;
          }

          .servicesGrid,
          .doctorsGrid,
          .testimonialsGrid {
            grid-template-columns: 1fr;
          }

          .clinicImage {
            height: 430px;
          }

          .doctorImageWrap {
            height: 460px;
          }

          .galleryGrid {
            grid-template-columns: 1fr;
            grid-auto-rows: 330px;
          }

          .galleryLarge {
            grid-column: auto;
            grid-row: auto;
          }

          .appointmentStrip {
            padding: 65px 0;
          }

          .contactCard {
            padding: 35px 25px;
          }

          .footerMain {
            grid-template-columns: 1fr;
          }

          .footerBottom {
            flex-direction: column;
            gap: 8px;
          }
        }

        @media (max-width: 420px) {
          .hero h1 {
            font-size: 41px;
          }

          .heroActions {
            flex-direction: column;
          }

          .heroActions a {
            width: 100%;
          }

          .heroPhotoSide {
            height: 410px;
          }

          .heroPhotoInfo {
            left: 12px;
            right: 12px;
            bottom: 12px;
          }
        }
      `}</style>
    </main>
  );
}