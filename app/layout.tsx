import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/dashboard/sidebar";
import { SessionProvider } from "@/components/auth/session-context";
import { getUser } from "@/lib/auth/dal";
import type { ClientUser } from "@/lib/auth/types";
import { ToastProvider } from "@/components/ui/toast";
import { ModalProvider } from "@/components/ui/modal";
import { LinguiClientProvider } from "@/lib/i18n/LinguiClientProvider";
import { initializeI18n, getMessagesForLocale } from "@/lib/i18n/server";
import { defaultLocale, LOCALE_COOKIE_NAME, isValidLocale, type Locale } from "@/lib/i18n";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NEXUpayroll",
  description: "manage your payroll and HR with ease",
};

/**
 * Get the current locale from cookies or headers
 */
async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const headersList = await headers();

  // 1. Check cookie (user preference)
  const cookieLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale;
  }

  // 2. Check header set by middleware
  const headerLocale = headersList.get('x-locale');
  if (headerLocale && isValidLocale(headerLocale)) {
    return headerLocale;
  }

  // 3. Default fallback
  return defaultLocale;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get user and locale in parallel
  const [user, locale] = await Promise.all([
    getUser(),
    getLocale(),
  ]);

  // Initialize i18n for server components
  await initializeI18n(locale);
  const messages = await getMessagesForLocale(locale);

  // Convert server User to safe ClientUser (remove sensitive fields)
  const clientUser: ClientUser | null = user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  } : null

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LinguiClientProvider initialLocale={locale} initialMessages={messages}>
            <SessionProvider initialUser={clientUser}>
              <ToastProvider>
                <ModalProvider>
                  <SidebarProvider>
                    {children}
                  </SidebarProvider>
                </ModalProvider>
              </ToastProvider>
            </SessionProvider>
          </LinguiClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
