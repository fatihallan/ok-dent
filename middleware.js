import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const ADMIN_UID = "7f0d9850-44f4-40e4-9a43-4ee57735e400";

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          response = NextResponse.next({
            request,
          });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAdminLogin = pathname === "/admin";
  const isAdminArea = pathname.startsWith("/admin/dashboard");

  // Dashboard: yalnızca gerçek OK Dent admin hesabı girebilir.
  if (isAdminArea) {
    if (!user || user.id !== ADMIN_UID) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      return NextResponse.redirect(url);
    }

    return response;
  }

  // Gerçek admin zaten giriş yaptıysa login sayfasına dönmesin.
  if (isAdminLogin && user?.id === ADMIN_UID) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/dashboard";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/admin", "/admin/dashboard/:path*"],
};
