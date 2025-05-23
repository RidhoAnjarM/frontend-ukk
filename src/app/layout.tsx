import type { Metadata } from "next";
import { Ruda } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";

const ruda = Ruda({
  variable: "--font-ruda",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "ForuMedia",
  description: "Generated by Ridho Anjar Maulana",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${ruda.variable} antialiased`} >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}