import type { Metadata, Viewport } from "next";
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
import {
  defaultLocale,
  LOCALE_COOKIE_NAME,
  isValidLocale,
  type Locale,
} from "@/lib/i18n";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://voltahr.com"),
  title: {
    default:
      "Volta HR - All-in-One HR & Payroll Platform for African Businesses",
    template: "%s | Volta HR",
  },
  description:
    "Streamline employee management, time tracking, leave requests, and payroll processing. Secure, scalable, and built for growth. Powered by Dorico Dynamics.",
  keywords: [
    "HR software",
    "payroll system",
    "time tracking",
    "leave management",
    "employee management",
    "HR platform Africa",
    "payroll software Mozambique",
    "HRIS",
    "human resources management",
    "multi-tenant HR",
    "cloud HR platform",
    "automated payroll",
    "compliance management",
  ],
  authors: [{ name: "Dorico Dynamics" }],
  creator: "Dorico Dynamics",
  publisher: "Dorico Dynamics",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://voltahr.com",
    title: "Volta HR - All-in-One HR & Payroll Platform",
    description:
      "Streamline your entire employee lifecycle with automated time tracking, leave management, and comprehensive reporting.",
    siteName: "Volta HR",
    images: [
      {
        url: "/logo/volta-og-image.png",
        width: 1200,
        height: 630,
        alt: "Volta HR Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Volta HR - All-in-One HR & Payroll Platform",
    description:
      "Streamline employee management, time tracking, and payroll. Start your free trial today.",
    images: ["/logo/volta-og-image.png"],
    creator: "@voltahr",
  },
  icons: {
    icon: [{ url: "/icon.png" }, { url: "/favicon.ico", sizes: "any" }],
    apple: [{ url: "/apple-icon.png" }],
  },
  manifest: "/manifest.webmanifest",
  alternates: {
    canonical: "https://voltahr.com",
  },
  category: "business",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
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
  const headerLocale = headersList.get("x-locale");
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
  const [user, locale] = await Promise.all([getUser(), getLocale()]);

  // Initialize i18n for server components
  await initializeI18n(locale);
  const messages = await getMessagesForLocale(locale);

  // Convert server User to safe ClientUser (remove sensitive fields)
  const clientUser: ClientUser | null = user
    ? {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        organization_id: user.organization_id,
        company_id: user.company_id,
        avatar: user.avatar,
        profile_photo_url: user.profile_photo_url,
        created_at: user.created_at,
        updated_at: user.updated_at,
      }
    : null;

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Volta HR",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              offers: {
                "@type": "AggregateOffer",
                priceCurrency: "USD",
                lowPrice: "29",
                highPrice: "79",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "150",
              },
              description:
                "Streamline employee management, time tracking, leave requests, and payroll processing.",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LinguiClientProvider
            initialLocale={locale}
            initialMessages={messages}
          >
            <SessionProvider initialUser={clientUser}>
              <ToastProvider>
                <ModalProvider>
                  <SidebarProvider>{children}</SidebarProvider>
                </ModalProvider>
              </ToastProvider>
            </SessionProvider>
          </LinguiClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
