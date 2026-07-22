import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "@/components/QueryProvider";
import { StoreHydration } from "@/store/StoreHydration";
import { Toaster } from "@/components/ui/Toaster";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Kanban Task Management",
  description: "A Kanban task management application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="h-full min-h-full flex flex-col font-sans" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <QueryProvider>{children}</QueryProvider>
          <Toaster />
        </ThemeProvider>
        <StoreHydration />
      </body>
    </html>
  );
}
