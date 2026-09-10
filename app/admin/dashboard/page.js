"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabaseClient";

const menuItems = [
  {
    icon: "⌂",
    label: "Dashboard",
    href: "/admin/dashboard",
    active: true,
  },
  {
    icon: "✦",
    label: "Ana Sayfa",
    href: "/admin/dashboard/home",
  },
  {
    icon: "◈",
    label: "Hizmetler",
    href: "/admin/dashboard/services",
  },
  {
    icon: "▤",
    label: "Klinik",
    href: "/admin/dashboard/clinic",
  },
  {
    icon: "♙",
    label: "Doktorlar",
    href: "/admin/dashboard/doctors",
  },
  {
    icon: "▣",
    label: "Galeri",
    href: "/admin/dashboard/gallery",
  },
  {
    icon: "★",
    label: "Hasta Yorumları",
    href: "/admin/dashboard/testimonials",
  },
  {
    icon: "◷",
    label: "Randevu Talepleri",
    href: "/admin/dashboard/appointments",
  },
  {
    icon: "▦",
    label: "Randevu Sayfası",
    href: "/admin/dashboard/appointment-page",
  },
  {
    icon: "◫",
    label: "Hakkımızda",
    href: "/admin/dashboard/about",
  },
  {
    icon: "◎",
    label: "Vizyon & Misyon",
    href: "/admin/dashboard/vision-mission",
  },
  {
    icon: "⚙",
    label: "Site Ayarları",
    href: "/admin/dashboard/settings",
  },
];

const cards = [
  {
    title: "Ana Sayfa",
    description:
      "Başlıkları, açıklamaları ve ana görselleri yönetin.",
    icon: "✦",
    href: "/admin/dashboard/home",
  },
  {
    title: "Hizmetler",
    description:
      "Tedavileri ekleyin, düzenleyin veya yayından kaldırın.",
    icon: "◈",
    href: "/admin/dashboard/services",
  },
  {
    title: "Klinik",
    description:
      "Klinik tanıtım alanını, özellikleri ve görselleri yönetin.",
    icon: "▤",
    href: "/admin/dashboard/clinic",
  },
  {
    title: "Doktorlar",
    description:
      "Hekim profillerini ve uzmanlık bilgilerini yönetin.",
    icon: "♙",
    href: "/admin/dashboard/doctors",
  },
  {
    title: "Galeri",
    description:
      "Klinik ve tedavi görsellerini yönetin.",
    icon: "▣",
    href: "/admin/dashboard/gallery",
  },
  {
    title: "Hasta Yorumları",
    description:
      "Hasta yorumlarını yayınlayın, gizleyin veya silin.",
    icon: "★",
    href: "/admin/dashboard/testimonials",
  },
  {
    title: "Randevu Talepleri",
    description:
      "Yeni randevu taleplerini inceleyin, durumlarını güncelleyin ve hastalarla iletişime geçin.",
    icon: "◷",
    href: "/admin/dashboard/appointments",
  },
  {
    title: "Randevu Sayfası",
    description:
      "Online randevu sayfasındaki metinleri, seçenekleri ve saatleri düzenleyin.",
    icon: "▦",
    href: "/admin/dashboard/appointment-page",
  },
  {
    title: "Hakkımızda",
    description:
      "Kurumsal Hakkımızda sayfasının içeriklerini yönetin.",
    icon: "◫",
    href: "/admin/dashboard/about",
  },
  {
    title: "Vizyon & Misyon",
    description:
      "Vizyon, misyon ve kurumsal değerlerinizi yönetin.",
    icon: "◎",
    href: "/admin/dashboard/vision-mission",
  },
  {
    title: "Site Ayarları",
    description:
      "Logo, telefon, WhatsApp, adres ve genel site bilgilerini yönetin.",
    icon: "⚙",
    href: "/admin/dashboard/settings",
  },
];

export default function DashboardPage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/admin");
    router.refresh();
  }

  function goTo(href) {
    router.push(href);
  }

  return (
    <div className="adminShell">
      <aside className="sidebar">
        <div>
          <button
            className="brand"
            onClick={() => goTo("/admin/dashboard")}
          >
            <div className="brandMark">OK</div>

            <div>
              <strong>OK Dent</strong>
              <span>Yönetim Paneli</span>
            </div>
          </button>

          <div className="menuLabel">YÖNETİM</div>

          <nav>
            {menuItems.map((item) => (
              <button
                className={`navItem ${
                  item.active ? "active" : ""
                }`}
                key={item.label}
                onClick={() => goTo(item.href)}
              >
                <span className="navIcon">
                  {item.icon}
                </span>

                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="sidebarBottom">
          <div className="adminProfile">
            <div className="avatar">A</div>

            <div>
              <strong>Yönetici</strong>
              <span>OK Dent Admin</span>
            </div>
          </div>

          <button
            className="logout"
            onClick={handleLogout}
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <span className="eyebrow">
              OK DENT / YÖNETİM
            </span>

            <h1>Yönetim Paneli</h1>

            <p>
              Kliniğinizin dijital dünyasını buradan
              yönetebilirsiniz.
            </p>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="visitButton"
          >
            Siteyi Görüntüle ↗
          </a>
        </header>

        <section className="statusGrid">
          <div className="statusCard">
            <span>Site Durumu</span>

            <strong>
              <i className="statusDot"></i>
              Yayında
            </strong>

            <small>
              OK Dent web sitesi aktif
            </small>
          </div>

          <button
            className="statusCard clickable"
            onClick={() =>
              goTo("/admin/dashboard/services")
            }
          >
            <span>Hizmetler</span>
            <strong>6</strong>
            <small>Aktif hizmet</small>
          </button>

          <button
            className="statusCard clickable"
            onClick={() =>
              goTo("/admin/dashboard/doctors")
            }
          >
            <span>Doktorlar</span>
            <strong>3</strong>
            <small>Yayınlanan profil</small>
          </button>

          <button
            className="statusCard appointmentCard clickable"
            onClick={() =>
              goTo("/admin/dashboard/appointments")
            }
          >
            <span>Randevu Talepleri</span>
            <strong>→</strong>
            <small>
              Gelen talepleri görüntüle
            </small>
          </button>
        </section>

        <section className="management">
          <div className="sectionHeading">
            <div>
              <span className="eyebrow">
                İÇERİK YÖNETİMİ
              </span>

              <h2>
                Web sitenizi yönetin
              </h2>
            </div>

            <p>
              Sitedeki tüm içerikleri tek yönetim
              panelinden düzenleyebilirsiniz.
            </p>
          </div>

          <div className="managementGrid">
            {cards.map((card) => (
              <button
                className="managementCard"
                key={card.title}
                onClick={() => goTo(card.href)}
              >
                <div className="cardIcon">
                  {card.icon}
                </div>

                <div>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>

                <span className="arrow">
                  →
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="welcomePanel">
          <div>
            <span className="eyebrow light">
              OK DENT
            </span>

            <h2>
              Her şey tek panelde.
            </h2>

            <p>
              Ana sayfa, hizmetler, klinik,
              doktorlar, galeri, hasta yorumları,
              randevular ve kurumsal sayfaları
              buradan yöneteceğiz.
            </p>
          </div>

          <div className="tooth">
            ✦
          </div>
        </section>
      </main>

      <style jsx>{`
        :global(*) {
          box-sizing: border-box;
        }

        :global(body) {
          margin: 0;
        }

        button {
          font-family: inherit;
        }

        .adminShell {
          min-height: 100vh;
          background: #f8f6f2;
          color: #30302f;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 270px;
          padding: 28px 20px 22px;
          background: #242423;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow-y: auto;
        }

        .brand {
          width: 100%;
          border: 0;
          background: transparent;
          color: white;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 0 8px 30px;
          text-align: left;
          cursor: pointer;
        }

        .brandMark {
          width: 45px;
          height: 45px;
          border-radius: 13px;
          background: #c6a47d;
          color: #242423;
          display: grid;
          place-items: center;
          font-weight: 900;
          letter-spacing: -1px;
        }

        .brand strong {
          display: block;
          font-size: 18px;
        }

        .brand span,
        .adminProfile span {
          display: block;
          color: #aaa29a;
          font-size: 12px;
          margin-top: 3px;
        }

        .menuLabel {
          color: #817970;
          font-size: 10px;
          letter-spacing: 1.7px;
          padding: 0 12px 10px;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .navItem {
          width: 100%;
          border: 0;
          background: transparent;
          color: #bdb5ad;
          padding: 12px 13px;
          border-radius: 10px;
          text-align: left;
          font-size: 13px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: 0.2s;
        }

        .navItem:hover {
          color: white;
          background: rgba(
            255,
            255,
            255,
            0.06
          );
        }

        .navItem.active {
          background: #c6a47d;
          color: #242423;
          font-weight: 800;
        }

        .navIcon {
          width: 20px;
          text-align: center;
          font-size: 17px;
        }

        .sidebarBottom {
          border-top: 1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );
          padding-top: 18px;
          margin-top: 25px;
        }

        .adminProfile {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 0 5px 15px;
        }

        .avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #c6a47d;
          color: #242423;
          display: grid;
          place-items: center;
          font-weight: 900;
        }

        .adminProfile strong {
          font-size: 13px;
        }

        .logout {
          width: 100%;
          padding: 10px;
          border: 1px solid
            rgba(
              255,
              255,
              255,
              0.12
            );
          border-radius: 9px;
          background: transparent;
          color: #d5cec6;
          cursor: pointer;
        }

        .content {
          margin-left: 270px;
          padding: 42px 48px 70px;
          max-width: 1600px;
        }

        .topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 35px;
          gap: 25px;
        }

        .eyebrow {
          color: #9b7955;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.8px;
        }

        .topbar h1 {
          font-size: 34px;
          margin: 8px 0 7px;
          letter-spacing: -1.3px;
        }

        .topbar p {
          margin: 0;
          color: #817970;
          font-size: 14px;
        }

        .visitButton {
          text-decoration: none;
          background: white;
          color: #30302f;
          border: 1px solid #e1d9cf;
          padding: 12px 17px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 700;
        }

        .statusGrid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 15px;
        }

        .statusCard {
          min-height: 120px;
          background: white;
          border: 1px solid #e7dfd5;
          border-radius: 15px;
          padding: 20px;
          text-align: left;
          color: inherit;
        }

        button.statusCard {
          width: 100%;
        }

        .clickable {
          cursor: pointer;
          transition: 0.2s;
        }

        .clickable:hover {
          transform: translateY(-2px);
          border-color: #c6a47d;
          box-shadow:
            0 10px 30px
            rgba(
              48,
              48,
              47,
              0.06
            );
        }

        .statusCard > span {
          display: block;
          color: #817970;
          font-size: 12px;
          margin-bottom: 13px;
        }

        .statusCard strong {
          min-height: 28px;
          font-size: 22px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .statusCard small {
          display: block;
          color: #9a9188;
          margin-top: 7px;
          font-size: 11px;
        }

        .statusDot {
          width: 8px;
          height: 8px;
          background: #5d8b6b;
          border-radius: 50%;
        }

        .appointmentCard {
          background: #30302f;
          color: white;
          border-color: #30302f;
        }

        .appointmentCard > span,
        .appointmentCard small {
          color: #c2bab2;
        }

        .appointmentCard strong {
          color: #c6a47d;
        }

        .management {
          margin-top: 50px;
        }

        .sectionHeading {
          display: flex;
          justify-content:
            space-between;
          align-items: end;
          margin-bottom: 20px;
          gap: 30px;
        }

        .sectionHeading h2 {
          font-size: 25px;
          margin: 7px 0 0;
          letter-spacing: -0.7px;
        }

        .sectionHeading > p {
          color: #8c837b;
          font-size: 12px;
          max-width: 380px;
          text-align: right;
        }

        .managementGrid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 14px;
        }

        .managementCard {
          border: 1px solid #e4ddd4;
          background: white;
          border-radius: 15px;
          padding: 21px;
          text-align: left;
          display: grid;
          grid-template-columns:
            46px 1fr auto;
          align-items: center;
          gap: 15px;
          cursor: pointer;
          color: inherit;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }

        .managementCard:hover {
          transform: translateY(-2px);
          box-shadow:
            0 10px 30px
            rgba(
              48,
              48,
              47,
              0.07
            );
        }

        .cardIcon {
          width: 46px;
          height: 46px;
          background: #eee4d7;
          color: #8a6846;
          border-radius: 12px;
          display: grid;
          place-items: center;
          font-size: 20px;
        }

        .managementCard h3 {
          margin: 0 0 6px;
          font-size: 15px;
        }

        .managementCard p {
          margin: 0;
          color: #8b827a;
          font-size: 11px;
          line-height: 1.5;
        }

        .arrow {
          color: #a3825e;
          font-size: 19px;
        }

        .welcomePanel {
          margin-top: 30px;
          background: #30302f;
          color: white;
          padding: 31px 35px;
          border-radius: 18px;
          display: flex;
          justify-content:
            space-between;
          align-items: center;
          overflow: hidden;
        }

        .eyebrow.light {
          color: #c6a47d;
        }

        .welcomePanel h2 {
          margin: 8px 0;
          font-size: 24px;
        }

        .welcomePanel p {
          color: #b7afa7;
          max-width: 610px;
          font-size: 12px;
          line-height: 1.6;
          margin: 0;
        }

        .tooth {
          font-size: 80px;
          color: rgba(
            198,
            164,
            125,
            0.15
          );
        }

        @media (max-width: 1000px) {
          .sidebar {
            width: 220px;
          }

          .content {
            margin-left: 220px;
            padding: 30px 25px;
          }

          .statusGrid {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .managementGrid {
            grid-template-columns:
              1fr;
          }
        }

        @media (max-width: 720px) {
          .sidebar {
            position: relative;
            width: 100%;
            min-height: auto;
          }

          .content {
            margin-left: 0;
            padding: 25px 18px;
          }

          .topbar,
          .sectionHeading {
            align-items: flex-start;
            flex-direction: column;
            gap: 18px;
          }

          .sectionHeading > p {
            text-align: left;
          }

          .statusGrid {
            grid-template-columns:
              1fr;
          }
        }
      `}</style>
    </div>
  );
}