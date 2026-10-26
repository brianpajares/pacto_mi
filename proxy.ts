import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intl = createMiddleware(routing);

// Enlaces cortos (/m, /r, /v, /unete, /linkedin): resuelven su propio idioma con Accept-Language.
const SHORT = /^\/(m|r|v)\/|^\/(unete|linkedin)\/?$/;

export default function proxy(req: NextRequest) {
  if (SHORT.test(req.nextUrl.pathname)) return NextResponse.next();
  return intl(req);
}

export const config = {
  // Matcher oficial de next-intl: excluye API, estáticos y archivos con extensión.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
