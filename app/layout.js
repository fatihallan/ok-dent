import './globals.css'
import SiteThemeProvider from './components/SiteThemeProvider'

async function getSiteSettings() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  try {
    const response = await fetch(`${url}/rest/v1/site_settings?setting_key=eq.main&select=seo_title,seo_description,favicon_url&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    })
    if (!response.ok) return null
    const rows = await response.json()
    return rows?.[0] || null
  } catch {
    return null
  }
}

export async function generateMetadata() {
  const settings = await getSiteSettings()
  const metadata = {
    title: settings?.seo_title || '',
    description: settings?.seo_description || '',
  }
  if (settings?.favicon_url) metadata.icons = { icon: settings.favicon_url }
  return metadata
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body><SiteThemeProvider>{children}</SiteThemeProvider></body>
    </html>
  )
}
