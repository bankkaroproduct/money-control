import type { Metadata } from "next";
import { Lato, Montserrat, Roboto, Lora } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Analytics } from "@/components/Analytics";
import { brandConfig } from "@/config/brand.config";
import { BrandStyles } from "@/components/BrandStyles";
import { SEOTags } from "@/components/SEOTags";

const lato = Lato({
    subsets: ["latin"],
    weight: ["400", "700", "900"],
    variable: "--font-lato",
});
const montserrat = Montserrat({
    subsets: ["latin"],
    weight: ["300", "400", "700", "900"],
    style: ["normal", "italic"],
    variable: "--font-montserrat",
});
const roboto = Roboto({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-roboto",
});
const lora = Lora({
    subsets: ["latin"],
    weight: ["400", "700"],
    variable: "--font-lora",
});

export const metadata: Metadata = {
    title: `${brandConfig.name} - ${brandConfig.tagline}`,
    description: brandConfig.tagline,
    icons: {
        icon: [
            { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
            { url: brandConfig.favicon, sizes: '128x128', type: 'image/png' },
        ],
        shortcut: '/favicon-32.png',
        apple: '/favicon-192.png',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <head>
                <BrandStyles />
            </head>
            <body className={`${lato.variable} ${montserrat.variable} ${roboto.variable} ${lora.variable} ${montserrat.className}`}>
                <SEOTags />
                <Analytics />
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
