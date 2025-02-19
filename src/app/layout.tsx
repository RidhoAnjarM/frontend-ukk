import type { Metadata } from "next";
import { Ruda } from "next/font/google";
import { Sansita } from "next/font/google";
import "./globals.css";

const ruda = Ruda({
  variable: "--font-ruda",
  subsets: ["latin"],     
  weight: ["400", "700"], 
});

const sansita = Sansita({
  variable: "--font-sansita",
  subsets: ["latin"],
  weight: ["400", "700"],
})

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${ruda.variable} antialiased`} >
        {children}
      </body>
    </html>
  );
}