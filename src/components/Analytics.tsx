"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { analytics } from "@/services/analytics";
import { initializeJourneyTracking } from "@/services/journeyTrack";

function AnalyticsContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Initialize journey tracking once on app load
    useEffect(() => {
        initializeJourneyTracking();
    }, []);

    useEffect(() => {
        if (pathname) {
            const url = pathname + searchParams.toString();
            analytics.trackPageView(url);
        }
    }, [pathname, searchParams]);

    return null;
}

export function Analytics() {
    return (
        <Suspense fallback={null}>
            <AnalyticsContent />
        </Suspense>
    );
}
