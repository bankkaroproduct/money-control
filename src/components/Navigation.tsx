"use client";
import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, X, Menu } from "lucide-react";
import { Link } from "@/components/Link";
import NavLink from "@/components/NavLink";
import { analytics } from "@/services/analytics";
import {
  trackNavHomeClicked,
  trackNavDiscoverClicked,
  trackNavAboutClicked,
  trackNavToolsDropdownOpened,
  trackNavToolSelected,
  trackNavBlogsClicked,
  trackNavSocialsDropdownOpened,
  trackNavSocialSelected,
  trackNavLogoClicked,
} from "@/services/journeyTrack";
import { brandConfig } from "@/config/brand.config";
import { useAutoHideNav } from "@/hooks/useAutoHideNav";

type MobileNavItem = {
  label: string;
  to?: string;
  description?: string;
  action?: () => void;
};

type MobileSection = {
  title: string;
  items: MobileNavItem[];
};

interface MobileMenuOverlayProps {
  open: boolean;
  onClose: () => void;
  sections: MobileSection[];
  logoSrc: string;
  triggerRef: React.RefObject<HTMLButtonElement>;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const MobileMenuOverlay = ({
  open,
  onClose,
  sections,
  logoSrc,
  triggerRef,
}: MobileMenuOverlayProps) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const firstFocusRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  if (typeof document === "undefined") return null;

  useEffect(() => {
    if (!open) return;
    previousFocusedElementRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const first = focusable[0] || dialog;
    first.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key === "Tab") {
        const focusables = dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
        if (focusables.length === 0) { event.preventDefault(); dialog.focus(); return; }
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];
        const current = document.activeElement as HTMLElement | null;
        if (!current) return;
        if (!event.shiftKey && current === lastEl) { event.preventDefault(); firstEl.focus(); }
        else if (event.shiftKey && current === firstEl) { event.preventDefault(); lastEl.focus(); }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open && previousFocusedElementRef.current) previousFocusedElementRef.current.focus();
  }, [open]);

  if (!open) return null;

  const content = (
    <>
      <div className="menu-backdrop lg:hidden" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        className="menu-overlay open safe-area-inset-top lg:hidden"
        onClick={onClose}
      >
        <div className="relative flex flex-col flex-1 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[#eee]">
            <img src={logoSrc} alt={brandConfig.name} className="h-7 w-auto object-contain" />
            <button
              ref={firstFocusRef}
              className="touch-target flex items-center justify-center h-9 w-9 rounded-lg hover:bg-[#f5f5f5] transition-colors"
              onClick={onClose}
              aria-label="Close menu"
            >
              <X className="w-5 h-5 text-[#333]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
            <Link to="/home" className="block px-3 py-3 font-lato text-[15px] font-bold text-[#1a1a2e] hover:bg-[#f5f7fa] rounded-lg transition-all" onClick={() => { trackNavHomeClicked('home'); onClose(); }}>Home</Link>
            <Link to="/cards" className="block px-3 py-3 font-lato text-[15px] font-bold text-[#1a1a2e] hover:bg-[#f5f7fa] rounded-lg transition-all" onClick={() => { trackNavDiscoverClicked('discover'); onClose(); }}>Discover</Link>

            <div className="pt-3" onMouseEnter={() => trackNavToolsDropdownOpened()}>
              <span className="block px-3 font-lato text-[10px] font-bold tracking-[0.2em] uppercase text-[#999] mb-1">Tools</span>
              {sections.find((s) => s.title === "Tools")?.items.map((tool) =>
                tool.to ? (
                  <Link key={tool.to} to={tool.to} className="block px-3 py-2.5 hover:bg-[#f5f7fa] rounded-lg transition-all" onClick={() => { trackNavToolSelected(tool.label); onClose(); }}>
                    <div className="font-lato text-[15px] font-bold text-[#1a1a2e]">{tool.label}</div>
                    {tool.description && <p className="font-roboto text-xs text-[#999] mt-0.5">{tool.description}</p>}
                  </Link>
                ) : null
              )}
            </div>

            <Link to="/blogs" className="block px-3 py-3 font-lato text-[15px] font-bold text-[#1a1a2e] hover:bg-[#f5f7fa] rounded-lg transition-all" onClick={() => { trackNavBlogsClicked('blogs'); onClose(); }}>Blogs</Link>

          </div>
        </div>
      </div>
    </>
  );
  return createPortal(content, document.body);
};

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);
  const scrollYRef = useRef(0);

  const { style, isVisible } = useAutoHideNav({ threshold: 10, duration: 300 });
  const navHeight = isVisible ? '7rem' : '0rem';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const body = document.body;
    if (isMobileMenuOpen) {
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      body.classList.add('menu-scroll-lock');
      body.style.top = `-${scrollYRef.current}px`;
    } else {
      const prevTop = body.style.top;
      body.classList.remove('menu-scroll-lock');
      body.style.top = '';
      if (prevTop) { const y = Math.abs(parseInt(prevTop, 10)) || scrollYRef.current; window.scrollTo(0, y); }
    }
    return () => { body.classList.remove('menu-scroll-lock'); body.style.top = ''; };
  }, [isMobileMenuOpen]);

  const navLinks: MobileNavItem[] = useMemo(() => ([
    { label: 'Home', to: '/home', action: () => { analytics.trackMenuClick('Home'); trackNavHomeClicked('home'); } },
    { label: 'Discover', to: '/cards', action: () => { analytics.trackMenuClick('Discover'); trackNavDiscoverClicked('discover'); } },
    { label: 'About', to: '/about', action: () => { analytics.trackMenuClick('About'); trackNavAboutClicked('about'); } },
  ]), []);

  const toolLinks: MobileNavItem[] = useMemo(() => ([
    { label: 'Super Card Genius', description: 'AI finds the right card for you.', to: '/card-genius', action: () => { analytics.trackMenuClick('Super Card Genius'); trackNavToolSelected('Super Card Genius'); } },
    { label: 'Category Card Genius', description: 'Find the best card for your spend style.', to: '/card-genius-category', action: () => { analytics.trackMenuClick('Category Card Genius'); trackNavToolSelected('Category Card Genius'); } },
    { label: 'Beat My Card', description: 'See if you can upgrade your card.', to: '/beat-my-card', action: () => { analytics.trackMenuClick('Beat My Card'); trackNavToolSelected('Beat My Card'); } },
  ]), []);

  const mobileSections: MobileSection[] = useMemo(() => ([
    { title: 'Navigate', items: navLinks },
    { title: 'Tools', items: toolLinks },
  ]), [navLinks, toolLinks]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 will-change-transform transition-all duration-300 ${scrolled ? 'shadow-lg shadow-black/10' : ''}`}
      style={{
        ...style,
        '--nav-height': navHeight,
        backgroundColor: scrolled ? 'rgba(14,34,48,0.97)' : '#0e2230',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
      } as React.CSSProperties}
    >
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center" onClick={() => trackNavLogoClicked()}>
            <img src={brandConfig.logo} alt={brandConfig.name} className="h-7 w-auto object-contain" />
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.label}
                to={link.to!}
                className="px-4 py-2 font-lato text-[13px] font-bold text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]"
                activeClassName="text-white bg-white/[0.08]"
                onClick={link.action}
              >
                {link.label}
              </NavLink>
            ))}

            <div className="relative group" onMouseEnter={() => trackNavToolsDropdownOpened()}>
              <button className="px-4 py-2 font-lato text-[13px] font-bold text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06] flex items-center gap-1" onFocus={() => trackNavToolsDropdownOpened()}>
                Tools <ChevronDown className="w-3.5 h-3.5" />
              </button>
              <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 absolute top-full right-0 mt-1 w-72 bg-white border border-[#e8e8e8] shadow-xl py-1.5 z-[100]" style={{ borderRadius: "12px" }}>
                {toolLinks.map(tool => (
                  <Link key={tool.to} to={tool.to!} className="block px-4 py-2.5 hover:bg-[#f5f7fa] transition-colors" onClick={tool.action}>
                    <div className="font-lato text-sm font-bold text-[#1a1a2e]">{tool.label}</div>
                    <div className="font-roboto text-xs text-[#999] mt-0.5">{tool.description}</div>
                  </Link>
                ))}
              </div>
            </div>

            <NavLink to="/blogs" className="px-4 py-2 font-lato text-[13px] font-bold text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/[0.06]" activeClassName="text-white bg-white/[0.08]" onClick={() => trackNavBlogsClicked('blogs')}>Blogs</NavLink>
          </div>

          <div className="flex items-center lg:hidden">
            <button
              ref={menuTriggerRef}
              className="flex items-center justify-center h-10 w-10 rounded-lg bg-white/[0.08] hover:bg-white/[0.15] transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <MobileMenuOverlay
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        sections={mobileSections}
        logoSrc={brandConfig.logo}
        triggerRef={menuTriggerRef}
      />
    </nav>
  );
};
export default Navigation;
