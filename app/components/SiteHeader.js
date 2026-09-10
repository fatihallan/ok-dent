"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../lib/supabaseClient";

const defaultNavigation = {
  show_logo: true,

  home_text: "",
  home_link: "",
  home_visible: true,
  home_sort: 1,

  services_text: "",
  services_link: "",
  services_visible: true,
  services_sort: 2,

  doctors_text: "",
  doctors_link: "",
  doctors_visible: true,
  doctors_sort: 3,

  corporate_text: "",
  corporate_visible: true,
  corporate_sort: 4,

  about_text: "",
  about_description: "",
  about_link: "",
  about_visible: true,
  about_sort: 1,

  vision_mission_text: "",
  vision_mission_description: "",
  vision_mission_link: "",
  vision_mission_visible: true,
  vision_mission_sort: 2,

  contact_text: "",
  contact_link: "",
  contact_visible: true,
  contact_sort: 5,

  appointment_text: "",
  appointment_link: "",
  appointment_arrow_text: "",
  appointment_visible: true,

  header_sticky: true,
  is_active: true,
};

export default function SiteHeader() {
  const [navigation, setNavigation] = useState(defaultNavigation);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileCorporateOpen, setMobileCorporateOpen] =
    useState(false);

  useEffect(() => {
    loadHeader();
  }, []);

  async function loadHeader() {
    const supabase = createClient();

    try {
      const [navigationResult, settingsResult] =
        await Promise.all([
          supabase
            .from("navigation_settings")
            .select("*")
            .eq("setting_key", "main")
            .single(),

          supabase
            .from("site_settings")
            .select("*")
            .eq("setting_key", "main")
            .single(),
        ]);

      if (navigationResult.error) {
        console.error(
          "Navigation settings error:",
          navigationResult.error
        );
      }

      if (settingsResult.error) {
        console.error(
          "Site settings error:",
          settingsResult.error
        );
      }

      if (navigationResult.data) {
        setNavigation({
          ...defaultNavigation,
          ...navigationResult.data,
        });
      }

      if (settingsResult.data) {
        setSettings(settingsResult.data);
      }
    } catch (error) {
      console.error("Header loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  const mainMenu = useMemo(() => {
    return [
      {
        key: "home",
        text: navigation.home_text,
        link: navigation.home_link,
        visible: navigation.home_visible,
        sort: navigation.home_sort,
      },

      {
        key: "services",
        text: navigation.services_text,
        link: navigation.services_link,
        visible: navigation.services_visible,
        sort: navigation.services_sort,
      },

      {
        key: "doctors",
        text: navigation.doctors_text,
        link: navigation.doctors_link,
        visible: navigation.doctors_visible,
        sort: navigation.doctors_sort,
      },

      {
        key: "corporate",
        text: navigation.corporate_text,
        link: "#",
        visible: navigation.corporate_visible,
        sort: navigation.corporate_sort,
      },

      {
        key: "contact",
        text: navigation.contact_text,
        link: navigation.contact_link,
        visible: navigation.contact_visible,
        sort: navigation.contact_sort,
      },
    ]
      .filter((item) => item.visible)
      .sort((a, b) => Number(a.sort) - Number(b.sort));
  }, [navigation]);

  const corporateMenu = useMemo(() => {
    return [
      {
        key: "about",
        text: navigation.about_text,
        description: navigation.about_description,
        link: navigation.about_link,
        visible: navigation.about_visible,
        sort: navigation.about_sort,
      },

      {
        key: "vision-mission",
        text: navigation.vision_mission_text,
        description:
          navigation.vision_mission_description,
        link: navigation.vision_mission_link,
        visible: navigation.vision_mission_visible,
        sort: navigation.vision_mission_sort,
      },
    ]
      .filter((item) => item.visible)
      .sort((a, b) => Number(a.sort) - Number(b.sort));
  }, [navigation]);

  function closeMobile() {
    setMobileOpen(false);
    setMobileCorporateOpen(false);
  }

  if (loading) {
    return (
      <div className="headerSkeleton">
        <div className="skeletonInner">
          <div className="skeletonLogo"></div>

          <div className="skeletonMenu">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className="skeletonButton"></div>
        </div>

        <style jsx>{`
          .headerSkeleton {
            height: 86px;
            background: var(--theme-background);
            border-bottom: 1px solid #ece5dc;
          }

          .skeletonInner {
            width: min(1240px, calc(100% - 48px));
            height: 100%;
            margin: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }

          .skeletonLogo {
            width: 135px;
            height: 33px;
            background: #ece6df;
            border-radius: 8px;
          }

          .skeletonMenu {
            display: flex;
            gap: 18px;
          }

          .skeletonMenu span {
            width: 55px;
            height: 10px;
            background: #ece6df;
            border-radius: var(--theme-radius);
          }

          .skeletonButton {
            width: 90px;
            height: 35px;
            background: #e1d8ce;
            border-radius: 8px;
          }

          @media (max-width: 1050px) {
            .skeletonMenu {
              display: none;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!navigation.is_active) {
    return null;
  }

  return (
    <>
      <header
        className={`siteHeader ${
          navigation.header_sticky ? "stickyHeader" : ""
        }`}
      >
        <div className="headerInner">
          <a
            href="/"
            className="brand"
            onClick={closeMobile}
          >
            {navigation.show_logo ? (
              settings?.logo_url ? (
                <img
                  src={settings.logo_url}
                  alt={settings?.clinic_name || ""}
                />
              ) : (
                <div className="brandText">
                  <strong>
                    {settings?.clinic_name || ""}
                  </strong>

                  <span>
                    {settings?.clinic_subtitle || ""}
                  </span>
                </div>
              )
            ) : (
              <div className="brandText">
                <strong>
                  {settings?.clinic_name || ""}
                </strong>
              </div>
            )}
          </a>

          <nav className="desktopNav">
            {mainMenu.map((item) => {
              if (item.key === "corporate") {
                return (
                  <div
                    className="dropdown"
                    key={item.key}
                  >
                    <button
                      type="button"
                      className="dropdownButton"
                    >
                      {item.text || ""}

                      <span>⌄</span>
                    </button>

                    {corporateMenu.length > 0 && (
                      <div className="dropdownMenu">
                        {corporateMenu.map((subItem) => (
                          <a
                            href={subItem.link || ""}
                            key={subItem.key}
                          >
                            <strong>
                              {subItem.text || ""}
                            </strong>

                            {subItem.description && (
                              <small>
                                {subItem.description}
                              </small>
                            )}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <a
                  href={item.link || ""}
                  key={item.key}
                >
                  {item.text || ""}
                </a>
              );
            })}
          </nav>

          <div className="headerRight">
            {navigation.appointment_visible && (
              <a
                href={
                  navigation.appointment_link || ""
                }
                className="appointmentButton"
              >
                {navigation.appointment_text || ""}
              </a>
            )}

            <button
              type="button"
              className={`mobileButton ${
                mobileOpen ? "active" : ""
              }`}
              aria-label="Menüyü aç veya kapat"
              onClick={() =>
                setMobileOpen((prev) => !prev)
              }
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>

        <div
          className={`mobileMenu ${
            mobileOpen ? "open" : ""
          }`}
        >
          <div className="mobileMenuInner">
            {mainMenu.map((item) => {
              if (item.key === "corporate") {
                return (
                  <div
                    className="mobileCorporate"
                    key={item.key}
                  >
                    <button
                      type="button"
                      className="mobileCorporateButton"
                      onClick={() =>
                        setMobileCorporateOpen(
                          (prev) => !prev
                        )
                      }
                    >
                      <span>
                        {item.text || ""}
                      </span>

                      <strong>
                        {mobileCorporateOpen ? "−" : "+"}
                      </strong>
                    </button>

                    {mobileCorporateOpen &&
                      corporateMenu.length > 0 && (
                        <div className="mobileSubMenu">
                          {corporateMenu.map((subItem) => (
                            <a
                              href={subItem.link || ""}
                              key={subItem.key}
                              onClick={closeMobile}
                            >
                              <strong>
                                {subItem.text || ""}
                              </strong>

                              {subItem.description && (
                                <small>
                                  {subItem.description}
                                </small>
                              )}
                            </a>
                          ))}
                        </div>
                      )}
                  </div>
                );
              }

              return (
                <a
                  href={item.link || ""}
                  key={item.key}
                  onClick={closeMobile}
                  className="mobileLink"
                >
                  {item.text || ""}
                </a>
              );
            })}

            {navigation.appointment_visible && (
              <a
                href={
                  navigation.appointment_link || ""
                }
                className="mobileAppointment"
                onClick={closeMobile}
              >
                {navigation.appointment_text || ""}
                <span>{navigation.appointment_arrow_text ?? ""}</span>
              </a>
            )}
          </div>
        </div>
      </header>

      <style jsx>{`
        .siteHeader {
          position: relative;
          z-index: 1000;
          background: rgba(248, 246, 242, 0.94);
          border-bottom: 1px solid
            rgba(76, 65, 55, 0.08);
          backdrop-filter: blur(18px);
        }

        .stickyHeader {
          position: sticky;
          top: 0;
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
          flex-shrink: 0;
          color: var(--theme-primary);
          text-decoration: none;
        }

        .brand img {
          width: 150px;
          max-height: 57px;
          display: block;
          object-fit: contain;
          object-position: left center;
        }

        .brandText {
          display: flex;
          flex-direction: column;
        }

        .brandText strong {
          color: var(--theme-primary);
          font-size: 23px;
          font-weight: 900;
          letter-spacing: 2px;
        }

        .brandText span {
          margin-top: 3px;
          color: #8e8176;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 1px;
        }

        .desktopNav {
          display: flex;
          align-items: center;
          gap: 26px;
        }

        .desktopNav > a,
        .dropdownButton {
          position: relative;
          color: #494440;
          font-family: inherit;
          font-size: 11px;
          font-weight: 750;
          line-height: 1;
          text-decoration: none;
          white-space: nowrap;
          transition: color 0.2s ease;
        }

        .desktopNav > a::after,
        .dropdownButton::after {
          content: "";
          position: absolute;
          left: 0;
          right: 100%;
          bottom: -8px;
          height: 1px;
          background: #b38d64;
          transition: right 0.2s ease;
        }

        .desktopNav > a:hover,
        .dropdownButton:hover {
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
        }

        .desktopNav > a:hover::after,
        .dropdownButton:hover::after {
          right: 0;
        }

        .dropdown {
          position: relative;
          padding: 30px 0;
        }

        .dropdownButton {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0;
          background: transparent;
          border: 0;
          cursor: pointer;
        }

        .dropdownButton > span {
          position: relative;
          top: -1px;
          color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
          font-size: 12px;
        }

        .dropdownMenu {
          position: absolute;
          top: 72px;
          left: 50%;
          width: 265px;
          padding: 8px;
          background: white;
          border: 1px solid var(--theme-border);
          border-radius: 15px;
          box-shadow: 0 22px 60px
            rgba(48, 48, 47, 0.13);
          transform: translate(-50%, 10px);
          opacity: 0;
          visibility: hidden;
          transition:
            opacity 0.2s ease,
            transform 0.2s ease,
            visibility 0.2s ease;
        }

        .dropdown:hover .dropdownMenu {
          transform: translate(-50%, 0);
          opacity: 1;
          visibility: visible;
        }

        .dropdownMenu a {
          display: block;
          padding: 13px;
          color: var(--theme-primary);
          border-radius: 10px;
          text-decoration: none;
          transition: background 0.2s ease;
        }

        .dropdownMenu a:hover {
          background: #f5f0ea;
        }

        .dropdownMenu strong {
          display: block;
          font-size: 11px;
        }

        .dropdownMenu small {
          display: block;
          margin-top: 4px;
          color: var(--theme-muted);
          font-size: 8px;
          line-height: 1.5;
        }

        .headerRight {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .appointmentButton {
          padding: 12px 17px;
          background: var(--theme-primary);
          color: white;
          border-radius: 9px;
          text-decoration: none;
          font-size: 10px;
          font-weight: 850;
          transition:
            background 0.2s ease,
            transform 0.2s ease;
        }

        .appointmentButton:hover {
          background: var(--theme-accent);
          color: var(--theme-text);
          transform: translateY(-1px);
        }

        .mobileButton {
          width: 42px;
          height: 42px;
          display: none;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
          padding: 0;
          background: transparent;
          border: 1px solid #ded6cc;
          border-radius: 9px;
          cursor: pointer;
        }

        .mobileButton span {
          width: 17px;
          height: 1px;
          display: block;
          background: var(--theme-primary);
          transition: 0.2s ease;
        }

        .mobileButton.active span:nth-child(1) {
          transform: translateY(6px) rotate(45deg);
        }

        .mobileButton.active span:nth-child(2) {
          opacity: 0;
        }

        .mobileButton.active span:nth-child(3) {
          transform: translateY(-6px) rotate(-45deg);
        }

        .mobileMenu {
          display: none;
        }

        @media (max-width: 1050px) {
          .headerInner {
            width: min(100% - 32px, 1240px);
            min-height: 76px;
          }

          .desktopNav {
            display: none;
          }

          .mobileButton {
            display: flex;
          }

          .brand img {
            width: 135px;
            max-height: 52px;
          }

          .mobileMenu {
            display: grid;
            grid-template-rows: 0fr;
            overflow: hidden;
            background: var(--theme-background);
            border-top: 1px solid transparent;
            transition:
              grid-template-rows 0.3s ease,
              border-color 0.3s ease;
          }

          .mobileMenu.open {
            grid-template-rows: 1fr;
            border-top-color: var(--theme-border);
          }

          .mobileMenuInner {
            min-height: 0;
            width: min(100% - 32px, 1240px);
            margin: auto;
            overflow: hidden;
          }

          .mobileLink,
          .mobileCorporateButton {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            background: transparent;
            color: var(--theme-primary);
            border: 0;
            border-bottom: 1px solid #e9e1d7;
            font-family: inherit;
            font-size: 12px;
            font-weight: 800;
            text-align: left;
            text-decoration: none;
            cursor: pointer;
          }

          .mobileCorporateButton strong {
            color: color-mix(in srgb, var(--theme-accent) 68%, var(--theme-primary));
            font-size: 17px;
            font-weight: 400;
          }

          .mobileSubMenu {
            padding: 8px 0 8px 14px;
            border-bottom: 1px solid #e9e1d7;
          }

          .mobileSubMenu a {
            display: block;
            padding: 10px 0;
            color: var(--theme-primary);
            text-decoration: none;
          }

          .mobileSubMenu strong {
            display: block;
            font-size: 11px;
          }

          .mobileSubMenu small {
            display: block;
            margin-top: 4px;
            color: var(--theme-muted);
            font-size: 8px;
          }

          .mobileAppointment {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin: 14px 0 18px;
            padding: 14px 16px;
            background: var(--theme-primary);
            color: white;
            border-radius: 9px;
            font-size: 11px;
            font-weight: 850;
            text-decoration: none;
          }
        }

        @media (max-width: 560px) {
          .headerInner {
            min-height: 70px;
          }

          .brand img {
            width: 118px;
          }

          .brandText strong {
            font-size: 18px;
          }

          .brandText span {
            font-size: 6px;
          }

          .appointmentButton {
            display: none;
          }

          .mobileButton {
            width: 39px;
            height: 39px;
          }
        }
      `}</style>
    </>
  );
}