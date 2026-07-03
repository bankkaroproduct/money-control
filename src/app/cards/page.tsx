import { Suspense } from "react";
import type { Metadata } from "next";
import CardListing from "@/views/CardListing";

export const metadata: Metadata = {
  robots: 'noindex, follow',
  alternates: { canonical: process.env.NEXT_PUBLIC_APP_URL || "https://money-control-beryl.vercel.app" },
};

export default function CardsPage() {
    return (
        <Suspense fallback={<div>Loading cards...</div>}>
            <CardListing />
        </Suspense>
    );
}
