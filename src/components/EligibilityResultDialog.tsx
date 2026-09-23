"use client";

import React from "react";
import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { openRedirectInterstitial } from '@/utils/redirectHandler';
import { useRouter } from 'next/navigation';
import { Link } from "@/components/Link";

interface EligibilityResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: any;
  cardName: string;
  cardAlias: string;
  networkUrl?: string;
  onRecheck: () => void;
}

export default function EligibilityResultDialog({
  open,
  onOpenChange,
  result,
  cardName,
  cardAlias,
  networkUrl,
  onRecheck
}: EligibilityResultDialogProps) {
  const router = useRouter();

  // Robust eligibility detection across possible response shapes
  const raw = result?.data;
  let cards: any[] = [];
  let singleCard: any = null;
  if (Array.isArray(raw)) cards = raw;
  else if (raw && typeof raw === 'object') {
    if (Array.isArray(raw.cards)) cards = raw.cards;
    else if (Array.isArray(raw.items)) cards = raw.items;
    else if (Array.isArray(raw.results)) cards = raw.results;
    else singleCard = raw; // single card object
  }
  const matchedFromArray = cards.some((c: any) => (c?.seo_card_alias || c?.card_alias) === cardAlias);
  const matchedSingle = !!singleCard && ((singleCard.seo_card_alias || singleCard.card_alias) === cardAlias);
  const isEligible = result?.status === 'success' && (matchedFromArray || matchedSingle);
  const hasData = result !== null && result !== undefined;

  useEffect(() => {
    if (open && isEligible) {
      // Trigger confetti for eligible result
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#0B7A8A', '#E0F7F9', '#60A5FA', '#085F6D']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#0B7A8A', '#E0F7F9', '#60A5FA', '#085F6D']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();

      // Mark as seen in session storage
      sessionStorage.setItem(`hasSeenEligibilityResult_${cardAlias}`, 'true');
    }
  }, [open, isEligible, cardAlias]);

  // Find the matched card from the eligibility response to extract bank/URL details
  const matchedCard = (() => {
    if (singleCard && ((singleCard.seo_card_alias || singleCard.card_alias) === cardAlias)) return singleCard;
    if (cards.length > 0) return cards.find((c: any) => (c.seo_card_alias || c.card_alias) === cardAlias) || null;
    return null;
  })();

  // Resolve the best available URL: prop > matched card fields
  const resolvedUrl = networkUrl ||
    matchedCard?.network_url ||
    matchedCard?.cg_network_url ||
    matchedCard?.ck_store_url ||
    matchedCard?.card_apply_link ||
    '';

  // Resolve bank name: matched card > prop fallback
  const banks = matchedCard?.banks;
  const resolvedBankName = (Array.isArray(banks) ? banks[0]?.name : banks?.name) ||
    matchedCard?.bank_name ||
    cardName?.split(' ')[0] ||
    'Bank';

  const resolvedBankLogo = (Array.isArray(banks) ? banks[0]?.logo : banks?.logo) ||
    matchedCard?.bank_logo ||
    undefined;

  const resolvedCardId = matchedCard?.id;

  const handleApply = () => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'eligibility_apply_click', {
        card_alias: cardAlias,
        from_eligibility_check: true
      });
    }

    if (resolvedUrl) {
      openRedirectInterstitial({
        networkUrl: resolvedUrl,
        bankName: resolvedBankName,
        bankLogo: resolvedBankLogo,
        cardName,
        cardId: resolvedCardId
      });
    }
  };

  // Auto-redirect eligible users to the bank — no second "Apply Now" click needed
  const REDIRECT_DELAY_SECONDS = 3;
  const [countdown, setCountdown] = useState(REDIRECT_DELAY_SECONDS);
  const [hasRedirected, setHasRedirected] = useState(false);
  const redirectFiredRef = useRef(false);

  useEffect(() => {
    if (!open) {
      redirectFiredRef.current = false;
      setHasRedirected(false);
      setCountdown(REDIRECT_DELAY_SECONDS);
      return;
    }
    if (!isEligible || !resolvedUrl || redirectFiredRef.current) return;

    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    const timeout = setTimeout(() => {
      redirectFiredRef.current = true;
      handleApply();
      setHasRedirected(true);
    }, REDIRECT_DELAY_SECONDS * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, isEligible, resolvedUrl]);

  const handleViewAlternatives = () => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'eligibility_alternatives_click', {
        card_alias: cardAlias
      });
    }

    // Navigate to cards listing page with smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      router.push('/cards');
    }, 300);
  };

  const handleRecheckClick = () => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'eligibility_recheck', {
        card_alias: cardAlias
      });
    }

    // Call onRecheck directly — do NOT call onOpenChange(false) which would
    // propagate to parent and clear pendingApplyCard
    onRecheck();
  };

  // Eligible Result
  if (isEligible) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#E0F7F9]/10 flex items-center justify-center">
                <CheckCircle className="w-7 h-7 text-[#0B7A8A]" />
              </div>
              <DialogTitle className="text-2xl text-[#0B7A8A]">
                You're eligible! 🎉
              </DialogTitle>
            </div>
            <DialogDescription>
              You meet the initial eligibility criteria for this card.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">Matched Criteria</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#0B7A8A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Location:</span> Your pincode is supported
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#0B7A8A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Income:</span> Meets minimum requirement
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-[#0B7A8A] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Employment:</span> Eligible status
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {resolvedUrl && (
              <div className="w-full rounded-lg bg-[#E0F7F9] px-4 py-3 text-center">
                {hasRedirected ? (
                  <p className="text-sm text-foreground">
                    Opened {resolvedBankName} in a new tab.{' '}
                    <button
                      type="button"
                      onClick={handleApply}
                      className="font-semibold text-[#0B7A8A] underline underline-offset-2"
                    >
                      Didn't open? Continue
                      <ExternalLink className="ml-1 inline w-3.5 h-3.5 align-[-2px]" />
                    </button>
                  </p>
                ) : (
                  <p className="flex items-center justify-center gap-2 text-sm font-medium text-foreground">
                    <Loader2 className="w-4 h-4 animate-spin text-[#0B7A8A]" />
                    Redirecting you to {resolvedBankName} in {countdown}s…
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleViewAlternatives}
                className="flex-1"
              >
                View Alternatives
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Not Eligible Result
  if (hasData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <AlertCircle className="w-7 h-7 text-amber-500" />
              </div>
              <DialogTitle className="text-2xl text-foreground">
                Sorry — you're not eligible right now
              </DialogTitle>
            </div>
            <DialogDescription>
              Based on the details you provided, this card isn't a match at the moment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3">What You Can Do</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Check if your income meets the card's minimum requirement
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Verify your pincode is in the serviceable area
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    Explore other cards that match your profile
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleViewAlternatives}
              className="w-full"
              size="lg"
            >
              See Recommended Cards
            </Button>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleRecheckClick}
                className="flex-1"
              >
                Recheck
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
