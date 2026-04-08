import type { Metadata } from "next";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/500.css";
import "@fontsource/montserrat/600.css";
import "@fontsource/montserrat/700.css";
import "@/styles/globals.css";
import { getDictionary } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "SamenRoute",
  description: "Bewaar plekken, plan slim, vink samen af."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const { locale } = await getDictionary();

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
