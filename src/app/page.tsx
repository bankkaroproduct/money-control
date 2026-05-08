import { Suspense } from "react";
import type { Metadata } from "next";
import HomeLanding from "@/views/HomeLanding";
import { brandConfig } from "@/config/brand.config";

export const metadata: Metadata = {
  title: `${brandConfig.name} — Credit Card Expert`,
  description:
    `Expert credit card recommendations by ${brandConfig.name}. Discover India's best credit cards for rewards, travel, cashback, and lifestyle.`,
  robots: "index, follow",
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL || "https://bankexpert.bankkaro.com" },
};

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomeLanding />
    </Suspense>
  );
}
