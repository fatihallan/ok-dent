"use client";

import { useEffect, useState } from "react";
import { createClient } from "../lib/supabaseClient";

export default function SiteFooter() {
  const [settings, setSettings] = useState(null);
  const [navigation, setNavigation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFooter();
  }, []);

  async function loadFooter() {
    const supabase = createClient();

    try {
      const [settingsResult, navigationResult] = await Promise.all([
        supabase
          .from("site_settings")
          .select("*")
          .eq("setting_key", "main")
          .single(),

        supabase
          .from("navigation_settings")
          .select("*")
          .eq("setting_key", "main")
          .single(),
      ]);

      if (settingsResult.data) {
        setSettings(settingsResult.data);
      }

      if (navigationResult.data) {
        setNavigation(navigationResult.data);
      }
    } catch (error) {
      console.error("Footer yüklenirken hata:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return null;
  }

  const clinicName = settings?.clinic_name || "";

  return (
    <>
      <footer className="footer">
        <div className="footerContainer">
          <div className="footerTop">
            <div className="footerBrand">
              <a href="/" className="footerLogo">
                {settings?.logo_url ? (
                  <img
                    src={settings.logo_url}
                    alt={clinicName}
                  />
                ) : (
                  <div className="footerBrandText">
                    <strong>{clinicName}</strong>

                    <span>
                      {settings?.clinic_subtitle || ""}
                    </span>
                  </div>
                )}
              </a>

              <p>
                {settings?.footer_text || ""}
              </p>
            </div>

            <div className="footerColumn">
              <strong>{settings?.footer_quick_links_title ?? ""}</strong>

              {navigation?.home_visible !== false && (
                <a href={navigation?.home_link || ""}>
                  {navigation?.home_text || ""}
                </a>
              )}

              {navigation?.services_visible !== false && (
                <a href={navigation?.services_link || ""}>
                  {navigation?.services_text || ""}
                </a>
              )}

              {navigation?.doctors_visible !== false && (
                <a href={navigation?.doctors_link || ""}>
                  {navigation?.doctors_text || ""}
                </a>
              )}

              {navigation?.appointment_visible !== false && (
                <a href={navigation?.appointment_link || ""}>
                  {navigation?.appointment_text || ""}
                </a>
              )}
            </div>

            <div className="footerColumn">
              <strong>{settings?.footer_corporate_title ?? ""}</strong>

              {navigation?.about_visible !== false && (
                <a href={navigation?.about_link || ""}>
                  {navigation?.about_text || ""}
                </a>
              )}

              {navigation?.vision_mission_visible !== false && (
                <a
                  href={
                    navigation?.vision_mission_link || ""
                  }
                >
                  {navigation?.vision_mission_text || ""}
                </a>
              )}

              {navigation?.contact_visible !== false && (
                <a href={navigation?.contact_link || ""}>
                  {navigation?.contact_text || ""}
                </a>
              )}
            </div>

            <div className="footerColumn">
              <strong>{settings?.footer_contact_title ?? ""}</strong>

              {settings?.phone && (
                <a href={`tel:${settings.phone}`}>
                  {settings.phone}
                </a>
              )}

              {settings?.email && (
                <a href={`mailto:${settings.email}`}>
                  {settings.email}
                </a>
              )}

              {settings?.address && (
                <span>
                  {settings.address}
                </span>
              )}

              {settings?.working_hours && (
                <span>
                  {settings.working_hours}
                </span>
              )}
            </div>
          </div>

          <div className="footerDivider" />

          <div className="footerBottom">
            <div className="footerCopyright">
              {settings?.footer_copyright_prefix ?? ""} {new Date().getFullYear()} {clinicName}
            </div>

            <div className="footerNote">
              {settings?.footer_note || ""}
            </div>

            <div className="socialLinks">
              {settings?.instagram_url && (
                <a
                  href={settings.instagram_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {settings?.instagram_label ?? ""}{settings?.social_external_mark ?? ""}
                </a>
              )}

              {settings?.facebook_url && (
                <a
                  href={settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {settings?.facebook_label ?? ""}{settings?.social_external_mark ?? ""}
                </a>
              )}

              {settings?.youtube_url && (
                <a
                  href={settings.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {settings?.youtube_label ?? ""}{settings?.social_external_mark ?? ""}
                </a>
              )}

              {settings?.tiktok_url && (
                <a
                  href={settings.tiktok_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {settings?.tiktok_label ?? ""}{settings?.social_external_mark ?? ""}
                </a>
              )}
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{styles}</style>
    </>
  );
}

const styles = `
  .footer {
    background: var(--theme-text);
    color: var(--theme-background);
    padding: 72px 0 28px;
    font-family: Arial, Helvetica, sans-serif;
  }

  .footerLoading {
    padding: 30px 0;
  }

  .footerContainer {
    width: min(1240px, calc(100% - 50px));
    margin: 0 auto;
  }

  .footerTop {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1.15fr;
    gap: 50px;
  }

  .footerBrand {
    max-width: 380px;
  }

  .footerLogo {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: white;
  }

  .footerLogo img {
    width: 185px;
    max-height: 72px;
    object-fit: contain;
    object-position: left center;
  }

  .footerBrandText {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .footerBrandText strong {
    font-size: 24px;
    letter-spacing: -0.7px;
  }

  .footerBrandText span {
    font-size: 10px;
    letter-spacing: 1.2px;
    text-transform: uppercase;
    color: var(--theme-accent);
  }

  .footerBrand p {
    margin: 22px 0 0;
    font-size: 14px;
    line-height: 1.8;
    color: #bcb5ad;
  }

  .footerColumn {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .footerColumn strong {
    margin-bottom: 8px;
    font-size: 11px;
    letter-spacing: 1.6px;
    color: var(--theme-accent);
  }

  .footerColumn a,
  .footerColumn span {
    color: #d8d2cb;
    text-decoration: none;
    font-size: 13px;
    line-height: 1.6;
    transition: 0.2s ease;
  }

  .footerColumn a:hover {
    color: white;
    transform: translateX(3px);
  }

  .footerDivider {
    height: 1px;
    margin: 52px 0 24px;
    background: rgba(255, 255, 255, 0.09);
  }

  .footerBottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 25px;
    flex-wrap: wrap;
  }

  .footerCopyright,
  .footerNote {
    font-size: 11px;
    color: #8f8982;
  }

  .socialLinks {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
  }

  .socialLinks a {
    color: var(--theme-accent);
    text-decoration: none;
    font-size: 11px;
    font-weight: 700;
  }

  .socialLinks a:hover {
    color: white;
  }

  @media (max-width: 1000px) {
    .footerTop {
      grid-template-columns: 1fr 1fr;
    }
  }

  @media (max-width: 620px) {
    .footer {
      padding: 55px 0 25px;
    }

    .footerContainer {
      width: min(100% - 30px, 1240px);
    }

    .footerTop {
      grid-template-columns: 1fr;
      gap: 34px;
    }

    .footerBottom {
      align-items: flex-start;
      flex-direction: column;
    }

    .footerDivider {
      margin: 38px 0 22px;
    }
  }
`;