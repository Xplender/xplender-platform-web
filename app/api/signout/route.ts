import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const AUTH_URL = process.env.XPLENDER_AUTH_URL ?? "http://localhost:8080";

export async function GET() {
  const cookieStore = await cookies();

  // Borrar todas las cookies de next-auth (HTTP y HTTPS)
  const authCookies = [
    "authjs.session-token",
    "authjs.callback-url",
    "authjs.csrf-token",
    "__Secure-authjs.session-token",
    "__Secure-authjs.callback-url",
    "__Secure-authjs.csrf-token",
  ];
  for (const name of authCookies) {
    cookieStore.delete(name);
  }

  // Redirigir a Spring AS para invalidar JSESSIONID
  return NextResponse.redirect(`${AUTH_URL}/do-logout`);
}
