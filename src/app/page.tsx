import { Suspense } from "react";
import type { Metadata } from "next";
import CardListing from "@/views/CardListing";
import { brandConfig } from "@/config/brand.config";

export const metadata: Metadata = {
  title: `${brandConfig.name} — Discover India's Best Credit Cards`,
  description:
    `Compare credit cards from 20+ banks by ${brandConfig.name}. Filter by category, check eligibility, and find the card that fits your spending.`,
  robots: "index, follow",
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL || "https://money-control-beryl.vercel.app" },
};

export default function RootPage() {
  return (
    <Suspense fallback={<div>Loading cards...</div>}>
      <CardListing />
    </Suspense>
  );
}
