import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/supabase/database.types";

const AUTH_ERROR_QUERY = "auth_error";
const SESSION_EXCHANGE_FAILED = "session_exchange";

export function GET(request: NextRequest) {
  return handleOAuthCallback(request);
}

function resolvedInternalRedirect(
  request: NextRequest,
  rawNext: string | null,
): URL {
  const fallback = new URL("/", request.url);
  if (!rawNext?.trim()) return fallback;

  try {
    const decoded = decodeURIComponent(rawNext.trim());
    if (
      !decoded.startsWith("/") ||
      decoded.startsWith("//") ||
      decoded.includes("\\")
    )
      return fallback;

    const pathOnly = decoded.split(/[?#]/)[0];
    if (!pathOnly.startsWith("/") || pathOnly.startsWith("//"))
      return fallback;

    try {
      return new URL(decoded, request.url);
    } catch {
      return fallback;
    }
  } catch {
    return fallback;
  }
}

async function handleOAuthCallback(request: NextRequest) {
  const url = request.nextUrl.clone();
  const code = url.searchParams.get("code");
  const safeDest = resolvedInternalRedirect(
    request,
    url.searchParams.get("next"),
  );

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const redirectTarget = safeDest;
  let response = NextResponse.redirect(redirectTarget);

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.redirect(redirectTarget);
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OAuth callback exchangeCodeForSession:", error.message);
    const failure = new URL("/", request.url);
    failure.searchParams.set(AUTH_ERROR_QUERY, SESSION_EXCHANGE_FAILED);
    return NextResponse.redirect(failure);
  }

  return response;
}
