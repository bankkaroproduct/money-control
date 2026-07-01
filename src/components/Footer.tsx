"use client";
import { Link } from "@/components/Link";
import { useMemo, useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { brandConfig } from "@/config/brand.config";
import { analytics } from "@/services/analytics";
import {
  trackFooterSectionViewed,
  trackFooterQuickLinkClicked,
  trackFooterEmailClicked,
  trackFooterBankKaroLogoClicked,
  trackFooterPrivacyPolicyClicked,
  trackFooterTermsClicked,
} from "@/services/journeyTrack";

const Footer = () => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const footerRef = useRef<HTMLElement | null>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    const el = footerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          trackFooterSectionViewed();
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const quickLinks = useMemo(() => [
    { label: "Home", to: "/" },
    { label: "Discover Cards", to: "/cards" },
    { label: "AI Card Genius", to: "/card-genius" },
    { label: "Category Card Genius", to: "/card-genius-category" },
    { label: "Beat My Card", to: "/beat-my-card" },
    { label: "Blogs", to: "/blogs" },
  ], []);

  return (
    <footer ref={footerRef} className="text-white safe-area-inset-bottom" style={{ backgroundColor: "#0e2230" }}>
      <div className="max-w-[1200px] mx-auto px-5 md:px-8 pt-14 md:pt-20 pb-8">
        {/* Desktop */}
        <div className="hidden md:grid md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-1">
            <img src={brandConfig.logo} alt={brandConfig.name} className="h-7 w-auto mb-4 opacity-90" />
            <p className="font-roboto text-sm text-white/50 leading-relaxed mb-5">
              Helping users make smarter credit card decisions with AI-powered recommendations.
            </p>
            <div className="flex items-center gap-2 text-white/30 hover:text-white/50 transition-colors cursor-pointer" onClick={() => trackFooterBankKaroLogoClicked()}>
              <span className="font-lato text-[9px] font-bold tracking-[0.15em] uppercase">Powered by</span>
              <img src="/bankkaro-powered.svg" alt="BankKaro" className="h-4 w-auto opacity-40" />
            </div>
          </div>

          <div>
            <h4 className="font-lato text-[11px] font-bold tracking-[0.15em] uppercase text-white/40 mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.slice(0, 3).map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="font-roboto text-sm text-white/60 hover:text-white transition-colors" onClick={() => { analytics.trackFooterClick(link.label); trackFooterQuickLinkClicked(link.label); }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-lato text-[11px] font-bold tracking-[0.15em] uppercase text-white/40 mb-4">Tools</h4>
            <ul className="space-y-2.5">
              {quickLinks.slice(3).map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="font-roboto text-sm text-white/60 hover:text-white transition-colors" onClick={() => { analytics.trackFooterClick(link.label); trackFooterQuickLinkClicked(link.label); }}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-lato text-[11px] font-bold tracking-[0.15em] uppercase text-white/40 mb-4">Contact</h4>
            <p className="font-roboto text-sm text-white/50 mb-2">Have questions?</p>
            <a href={`mailto:${brandConfig.email}`} className="font-lato text-sm font-bold text-[#1A6DA4] hover:text-[#52B974] transition-colors" onClick={() => trackFooterEmailClicked(brandConfig.email)}>
              {brandConfig.email}
            </a>
          </div>
        </div>

        {/* Mobile: Accordion */}
        <div className="md:hidden space-y-0 mb-8 border border-white/[0.08] overflow-hidden" style={{ borderRadius: "12px" }}>
          {[
            {
              id: "about", title: brandConfig.name,
              content: (
                <div className="space-y-3">
                  <p className="font-roboto text-sm text-white/50 leading-relaxed">Helping users make smarter credit card decisions with AI-powered recommendations.</p>
                  <div className="flex items-center gap-2 text-white/30" onClick={() => trackFooterBankKaroLogoClicked()}>
                    <span className="font-lato text-[9px] font-bold tracking-[0.15em] uppercase">Powered by</span>
                    <img src="/bankkaro-powered.svg" alt="BankKaro" className="h-4 w-auto opacity-40" />
                  </div>
                </div>
              ),
            },
            {
              id: "links", title: "Quick Links",
              content: (
                <ul className="space-y-2">
                  {quickLinks.map(link => (
                    <li key={link.to}>
                      <Link to={link.to} className="font-roboto text-sm text-white/50 hover:text-white transition-colors" onClick={() => { analytics.trackFooterClick(link.label); trackFooterQuickLinkClicked(link.label); }}>{link.label}</Link>
                    </li>
                  ))}
                </ul>
              ),
            },
            {
              id: "contact", title: "Get In Touch",
              content: (
                <div className="space-y-2">
                  <p className="font-roboto text-sm text-white/50">Have questions?</p>
                  <a href={`mailto:${brandConfig.email}`} className="font-lato text-sm font-bold text-[#1A6DA4]" onClick={() => trackFooterEmailClicked(brandConfig.email)}>{brandConfig.email}</a>
                </div>
              ),
            },
          ].map((section) => {
            const isOpen = openSection === section.id;
            return (
              <div key={section.id} className="border-b border-white/[0.06] last:border-b-0">
                <button
                  className="w-full flex items-center justify-between px-5 py-4 touch-target"
                  onClick={() => setOpenSection(isOpen ? null : section.id)}
                  aria-expanded={isOpen}
                >
                  <span className="font-lato text-sm font-bold text-white/80">{section.title}</span>
                  <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOpen && <div className="px-5 pb-5">{section.content}</div>}
              </div>
            );
          })}
        </div>

        {/* Copyright */}
        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-roboto text-xs text-white/30">
            © {new Date().getFullYear()} Pouring Pounds India Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex items-center gap-5 font-roboto text-xs text-white/30">
            <a href="https://bankkaro.com/privacy-policy" target="_blank" className="hover:text-white/60 transition-colors" onClick={() => trackFooterPrivacyPolicyClicked()}>Privacy Policy</a>
            <span>·</span>
            <a href="https://bankkaro.com/terms-conditions" target="_blank" className="hover:text-white/60 transition-colors" onClick={() => trackFooterTermsClicked()}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
