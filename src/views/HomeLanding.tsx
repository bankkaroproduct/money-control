"use client";
import { Search, Star, CreditCard, Users, TrendingUp, ArrowRight, Sparkles, Swords, LayoutGrid, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Link } from "@/components/Link";
import { getCardStatus } from "@/utils/cardStatus";
import { authManager } from "@/services/authManager";
import {
  trackHomePageView,
  trackPicksSectionViewed,
  trackPicksTabSelected,
  trackPicksCardClicked,
  trackPicksCardDetailsClicked,
  trackHeroExplorePicksAnchorClicked,
  trackHeroSearchBarFocused,
  trackSearchSubmitted,
  trackSearchQueryTyped,
  trackHeroExploreAllCardsClicked,
  trackToolsSectionViewed,
  trackHomepageSuperCardGeniusClicked,
  trackHomepageBeatMyCardClicked,
  trackHomepageCategoryCardGeniusClicked,
} from "@/services/journeyTrack";

type CardItem = {
  name: string;
  bank: string;
  alias: string;
  image: string;
  joining_fee: string;
  annual_fee: string;
  networks: string;
};

type TabKey = "picks" | "best" | "beginner" | "cashback";

const BANK_MAP: Record<string, string> = {
  hdfc: "HDFC Bank", sbi: "SBI Card", axis: "Axis Bank", icici: "ICICI Bank",
  kotak: "Kotak Bank", idfc: "IDFC FIRST", hsbc: "HSBC", amex: "Amex",
  "american express": "Amex", scapia: "Federal Bank", kiwi: "Kiwi",
  indusind: "IndusInd Bank", yes: "Yes Bank", rbl: "RBL Bank",
  au: "AU Small Finance", bob: "Bank of Baroda", swiggy: "HDFC Bank",
  flipkart: "SBI Card", myntra: "Kotak Bank", tata: "SBI Card",
};

function extractBank(cardName: string): string {
  const lower = cardName.toLowerCase();
  for (const [key, val] of Object.entries(BANK_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "Bank";
}

function parseRawCards(data: any): any[] {
  if (Array.isArray(data?.data?.cards)) return data.data.cards;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

function formatFee(raw: any): string {
  const s = String(raw ?? "").trim();
  if (!s || s === "0" || s.toLowerCase() === "free") return "Free";
  return `₹${s}`;
}

function toCardItem(c: any): CardItem {
  const alias = c.seo_card_alias || c.card_alias || "";
  const name = c.name || c.card_name || "";
  const bank = c.bank_name || c.bank || extractBank(name);
  const image = c.card_bg_image || c.image || "";
  const joining_fee = formatFee(c.joining_fee_text ?? c.joining_fee);
  const annual_fee = formatFee(c.annual_fee_text ?? c.annual_fee);
  const networks = c.card_type || "";
  return { name, bank, alias, image, joining_fee, annual_fee, networks };
}

function curateCards(raw: any[], aliases: string[]): CardItem[] {
  const byAlias = new Map<string, any>();
  raw.forEach((c) => {
    const a = c.seo_card_alias || c.card_alias || "";
    if (a && !byAlias.has(a)) byAlias.set(a, c);
  });
  const result: CardItem[] = [];
  const used = new Set<string>();
  for (const alias of aliases) {
    if (byAlias.has(alias)) {
      result.push(toCardItem(byAlias.get(alias)));
      used.add(alias);
    }
  }
  if (result.length < 9) {
    for (const c of raw) {
      if (result.length >= 9) break;
      const a = c.seo_card_alias || c.card_alias || "";
      if (!used.has(a)) {
        result.push(toCardItem(c));
        used.add(a);
      }
    }
  }
  return result.slice(0, 9);
}

const STATS = [
  { value: "130+", label: "Cards Listed", icon: CreditCard },
  { value: "50K+", label: "Users Helped", icon: Users },
  { value: "₹12K", label: "Avg. Savings/yr", icon: TrendingUp },
  { value: "4.9★", label: "User Rating", icon: Star },
];

function CardTile({ card, index }: { card: CardItem; index: number }) {
  const networkList = card.networks
    ? card.networks.split(",").map((n) => n.trim()).filter(Boolean)
    : [];
  const status = getCardStatus(card);

  const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
    lifetime_free: { label: "LTF", bg: "bg-[#52B974]", text: "text-white" },
    invite_only: { label: "Invite Only", bg: "bg-[#F59E0B]", text: "text-white" },
    discontinued: { label: "Discontinued", bg: "bg-[#EF4444]", text: "text-white" },
  };

  return (
    <div
      className="group relative bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
      style={{ borderRadius: "12px" }}
      onClick={() => trackPicksCardClicked(card.alias, card.name, card.bank, 'picks')}
    >
      <div className="relative aspect-[16/10] bg-gradient-to-br from-[#f0f4f8] to-[#e8edf3] flex items-center justify-center overflow-hidden">
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {index < 3 && (
            <span
              className="font-lato text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 bg-[#1A6DA4] text-white"
              style={{ borderRadius: "4px" }}
            >
              Top Pick
            </span>
          )}
          {status && statusConfig[status] && (
            <span
              className={`font-lato text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 ${statusConfig[status].bg} ${statusConfig[status].text}`}
              style={{ borderRadius: "4px" }}
            >
              {statusConfig[status].label}
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pt-3.5 pb-4">
        <p className="font-roboto text-[11px] text-[#1A6DA4] font-medium mb-1">{card.bank}</p>
        <h3 className="font-lato text-[15px] font-bold text-[#1a1a2e] leading-snug line-clamp-2 mb-3">{card.name}</h3>

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <span className="block font-roboto text-[10px] text-[#999] uppercase tracking-wider">Joining</span>
            <span className="block font-lato text-sm font-bold text-[#1a1a2e]">{card.joining_fee}</span>
          </div>
          <div className="w-px bg-[#eee]" />
          <div className="flex-1">
            <span className="block font-roboto text-[10px] text-[#999] uppercase tracking-wider">Annual</span>
            <span className="block font-lato text-sm font-bold text-[#1a1a2e]">{card.annual_fee}</span>
          </div>
        </div>

        <Link
          to={card.alias ? `/cards/${card.alias}` : "/cards"}
          onClick={() => trackPicksCardDetailsClicked(card.alias, card.name, 'picks')}
          className="flex items-center justify-center gap-2 w-full font-lato text-xs font-bold tracking-wide uppercase py-3 min-h-[44px] text-[#1A6DA4] bg-[#1A6DA4]/[0.06] hover:bg-[#1A6DA4] hover:text-white transition-all duration-200"
          style={{ borderRadius: "8px" }}
        >
          View Details <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white overflow-hidden" style={{ borderRadius: "12px" }}>
      <div className="h-44 bg-[#f0f4f8] animate-pulse" />
      <div className="px-4 pt-3.5 pb-4 space-y-3">
        <div className="h-2 bg-[#eee] rounded w-1/3" />
        <div className="h-4 bg-[#eee] rounded w-3/4" />
        <div className="flex gap-3">
          <div className="h-10 bg-[#eee] flex-1 rounded" />
          <div className="h-10 bg-[#eee] flex-1 rounded" />
        </div>
        <div className="h-9 bg-[#eee] rounded-lg" />
      </div>
    </div>
  );
}

const CURATED_ALIASES: Record<TabKey, string[]> = {
  picks: [
    "hdfc-regalia-gold-credit-card", "sbi-cashback-credit-card",
    "axis-bank-magnus-credit-card", "hdfc-millenia-credit-card",
    "icici-amazon-pay-credit-card", "axis-atlas-credit-card",
    "idfc-first-wealth-credit-card", "tata-neu-infinity-sbi-credit-card",
    "axis-flipkart-credit-card",
  ],
  best: [
    "hdfc-infinia-credit-card", "axis-bank-magnus-credit-card",
    "axis-atlas-credit-card", "hdfc-diners-club-black",
    "hdfc-regalia-gold-credit-card", "sbi-aurum-credit-card",
    "icici-emeralde-private-metal-credit-card", "hdfc-marriott-bonvoy-credit-card",
    "axis-bank-reserve-credit-card",
  ],
  beginner: [
    "icici-amazon-pay-credit-card", "idfc-first-select-credit-card",
    "axis-neo-credit-card", "scapia-credit-card",
    "hdfc-pixel-play-credit-card", "kiwi-klick-credit-card",
    "kotak-811-dream-different-credit-card", "rbl-bank-play-credit-card",
    "idfc-first-classic-credit-card",
  ],
  cashback: [
    "sbi-cashback-credit-card", "hdfc-millenia-credit-card",
    "icici-amazon-pay-credit-card", "axis-flipkart-credit-card",
    "axis-cashback-credit-card", "hdfc-swiggy-credit-card",
    "hdfc-pixel-play-credit-card", "flipkart-sbi-credit-card",
    "hdfc-tata-neu-plus-credit-card",
  ],
};

const TAB_CONFIG: Record<TabKey, { label: string; slug: string; free_cards: string; sort_by: string }> = {
  picks:    { label: "Moneycontrol Picks", slug: "",                          free_cards: "",     sort_by: "priority" },
  best:     { label: "Best Cards",         slug: "best-travel-credit-card",   free_cards: "",     sort_by: "priority" },
  beginner: { label: "Beginner Cards",     slug: "",                          free_cards: "true", sort_by: "priority" },
  cashback: { label: "Best Cashback",      slug: "best-shopping-credit-card", free_cards: "",     sort_by: "priority" },
};

const TOOLS = [
  {
    icon: Sparkles,
    title: "Super Card Genius",
    description: "AI-powered card recommendations based on your spending habits",
    to: "/card-genius",
    onTrack: () => trackHomepageSuperCardGeniusClicked("Super Card Genius", "tools_section"),
    gradient: "from-[#1A6DA4] to-[#0e4d7a]",
  },
  {
    icon: Swords,
    title: "Beat My Card",
    description: "Find a better card than the one you already have",
    to: "/beat-my-card",
    onTrack: () => trackHomepageBeatMyCardClicked("Beat My Card", "tools_section"),
    gradient: "from-[#52B974] to-[#3d7a1a]",
  },
  {
    icon: LayoutGrid,
    title: "Category Card Genius",
    description: "Discover the best card for any spending category",
    to: "/card-genius-category",
    onTrack: () => trackHomepageCategoryCardGeniusClicked("Category Card Genius", "tools_section"),
    gradient: "from-[#0e2230] to-[#1a3a50]",
  },
];

function PicksSection() {
  const [activeTab, setActiveTab] = useState<TabKey>("picks");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Partial<Record<TabKey, CardItem[]>>>({});

  const fetchCardsForTab = (tabKey: TabKey) => {
    if (cache.current[tabKey]) {
      setCards(cache.current[tabKey]!);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    setCards([]);
    const config = TAB_CONFIG[tabKey];
    const qs = new URLSearchParams({ sort_by: config.sort_by, limit: "200" });
    if (config.slug) qs.set("slug", config.slug);
    if (config.free_cards) qs.set("free_cards", config.free_cards);
    authManager
      .makeAuthenticatedRequest(`/api/proxy/cardgenius/cards?${qs}`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        const raw = parseRawCards(data);
        const curated = curateCards(raw, CURATED_ALIASES[tabKey]);
        cache.current[tabKey] = curated;
        setCards(curated);
      })
      .catch(() => {
        setError(`Failed to load ${TAB_CONFIG[tabKey].label}. Please try again.`);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    trackHomePageView();
    fetchCardsForTab("picks");
    trackPicksSectionViewed();
  }, []); // eslint-disable-line

  const handleTabClick = (tabKey: TabKey) => {
    setActiveTab(tabKey);
    fetchCardsForTab(tabKey);
    trackPicksTabSelected(tabKey);
  };

  return (
    <section id="picks-section" className="py-16 md:py-24 bg-[#f5f7fa]">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <span className="inline-block font-lato text-[11px] font-bold tracking-[0.2em] uppercase text-[#1A6DA4] mb-2">
              Curated Selection
            </span>
            <h2 className="font-montserrat text-2xl md:text-[2rem] font-bold text-[#1a1a2e] tracking-tight leading-tight">
              Moneycontrol Picks
            </h2>
          </div>
          <Link
            to="/cards"
            className="inline-flex items-center gap-1.5 font-lato text-sm font-bold text-[#1A6DA4] hover:text-[#155d8c] transition-colors"
            onClick={() => trackHeroExploreAllCardsClicked('picks_section')}
          >
            View all cards <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Tab pills */}
        <div className="flex gap-2 mb-8 overflow-x-auto scrollbar-none pb-1">
          {(Object.keys(TAB_CONFIG) as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={`flex-shrink-0 px-5 py-3 min-h-[44px] font-lato text-[13px] font-bold tracking-wide transition-all whitespace-nowrap ${
                activeTab === key
                  ? "bg-[#1A6DA4] text-white shadow-md shadow-[#1A6DA4]/25"
                  : "bg-white text-[#666] hover:bg-[#eef3f8] hover:text-[#1A6DA4] border border-[#e0e4ea]"
              }`}
              style={{ borderRadius: "100px" }}
            >
              {TAB_CONFIG[key].label}
            </button>
          ))}
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center py-16 gap-4 bg-white" style={{ borderRadius: "16px" }}>
            <p className="font-roboto text-sm text-[#999]">{error}</p>
            <button
              onClick={() => fetchCardsForTab(activeTab)}
              className="font-lato text-sm font-bold px-6 py-2.5 bg-[#1A6DA4] text-white hover:bg-[#155d8c] transition-colors"
              style={{ borderRadius: "100px" }}
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card, i) => (
              <CardTile key={card.alias || card.name} card={card} index={i} />
            ))}
          </div>
        )}

        {!loading && !error && cards.length === 0 && (
          <div className="flex flex-col items-center py-16 bg-white" style={{ borderRadius: "16px" }}>
            <p className="font-roboto text-sm text-[#999]">No cards found for this category.</p>
          </div>
        )}
      </div>
    </section>
  );
}

function ToolsSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const viewedRef = useRef(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !viewedRef.current) {
          viewedRef.current = true;
          trackToolsSectionViewed();
          observer.disconnect();
        }
      });
    }, { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-5 md:px-8">
        <div className="text-center mb-12">
          <span className="inline-block font-lato text-[11px] font-bold tracking-[0.2em] uppercase text-[#52B974] mb-2">
            AI-Powered Tools
          </span>
          <h2 className="font-montserrat text-2xl md:text-[2rem] font-bold text-[#1a1a2e] tracking-tight">
            Three Ways to Find Your Card
          </h2>
          <p className="font-roboto text-[15px] text-[#888] mt-2 max-w-md mx-auto">
            Answer a few questions, check a spending category, or see if your current card is still worth it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TOOLS.map((tool) => (
            <Link
              to={tool.to}
              key={tool.title}
              onClick={() => tool.onTrack()}
              className={`group relative overflow-hidden bg-gradient-to-br ${tool.gradient} p-6 md:p-8 flex flex-col text-white hover:shadow-2xl transition-all duration-300`}
              style={{ borderRadius: "16px", minHeight: "220px" }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.05] rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/[0.04] rounded-full translate-y-1/2 -translate-x-1/2" />

              <div
                className="relative inline-flex items-center justify-center h-12 w-12 bg-white/[0.15] mb-5"
                style={{ borderRadius: "12px" }}
              >
                <tool.icon className="h-6 w-6 text-white" />
              </div>

              <h3 className="relative font-lato text-lg font-bold mb-2">{tool.title}</h3>
              <p className="relative font-roboto text-sm text-white/70 leading-relaxed mb-6 flex-1">
                {tool.description}
              </p>

              <span className="relative inline-flex items-center gap-2 font-lato text-sm font-bold text-white/90 group-hover:text-white transition-colors">
                Try Now <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

const HomeLanding = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    trackSearchSubmitted(query.trim());
    window.location.href = query.trim() ? `/cards?q=${encodeURIComponent(query.trim())}` : "/cards";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navigation />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="relative overflow-hidden pt-24 pb-0 md:pt-28" style={{ backgroundColor: "#0e2230" }}>
          {/* Abstract background shapes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hero-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1A6DA4" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#1A6DA4" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="hero-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#52B974" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#52B974" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Large angled plane top-right */}
            <polygon points="600,0 1440,0 1440,500 900,300" fill="url(#hero-grad-1)" />
            {/* Diagonal stripe */}
            <polygon points="0,400 400,200 450,220 50,420" fill="url(#hero-grad-2)" />
            {/* Floating ring top-right */}
            <circle cx="85%" cy="18%" r="80" fill="none" stroke="#1A6DA4" strokeWidth="1" opacity="0.12" />
            <circle cx="85%" cy="18%" r="60" fill="none" stroke="#1A6DA4" strokeWidth="0.5" opacity="0.08" />
            {/* Small dot grid pattern */}
            {[...Array(6)].map((_, row) =>
              [...Array(8)].map((_, col) => (
                <circle key={`dot-${row}-${col}`} cx={`${10 + col * 11}%`} cy={`${15 + row * 14}%`} r="1" fill="#fff" opacity="0.04" />
              ))
            )}
            {/* Diamond shape bottom-left */}
            <polygon points="120,500 180,440 240,500 180,560" fill="none" stroke="#52B974" strokeWidth="1" opacity="0.1" />
            {/* Accent line */}
            <line x1="60%" y1="0" x2="40%" y2="100%" stroke="#1A6DA4" strokeWidth="0.5" opacity="0.06" />
            <line x1="62%" y1="0" x2="42%" y2="100%" stroke="#52B974" strokeWidth="0.5" opacity="0.04" />
          </svg>

          {/* Radial glows */}
          <div className="absolute top-[-20%] left-[50%] -translate-x-1/2 w-[60vw] h-[60vw] rounded-full opacity-[0.06]" style={{ background: "radial-gradient(circle, #1A6DA4, transparent 60%)" }} />
          <div className="absolute bottom-[-30%] right-[-10%] w-[35vw] h-[35vw] rounded-full opacity-[0.05]" style={{ background: "radial-gradient(circle, #52B974, transparent 60%)" }} />

          <div className="relative z-10 max-w-[800px] mx-auto px-5 md:px-8 text-center py-16 md:py-24">
            <span className="inline-block font-lato text-[11px] font-bold tracking-[0.25em] uppercase text-[#52B974] mb-6 px-4 py-1.5 bg-[#52B974]/[0.1] border border-[#52B974]/20" style={{ borderRadius: "100px" }}>
              Unbiased Card Comparisons
            </span>

            <h1 className="font-montserrat text-[clamp(2.2rem,5vw,3.8rem)] font-extrabold text-white leading-[1.08] tracking-tight mb-5">
              Find the Credit Card
              <br />
              <span className="text-[#52B974]">That Actually Fits</span>{" "}
              <span className="text-white/50 font-light">Your Spending</span>
            </h1>

            <p className="font-roboto text-base md:text-lg text-white/50 leading-[1.7] max-w-[52ch] mx-auto mb-10">
              Compare fees, rewards, and eligibility across 130+ cards from 20+ banks — ranked by what you'd actually save.
            </p>

            {/* Search bar */}
            <div className="max-w-lg mx-auto">
              <div
                className="flex items-center bg-white overflow-hidden shadow-2xl shadow-black/20"
                style={{ borderRadius: "12px" }}
              >
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#aaa]" />
                  <input
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); trackSearchQueryTyped(e.target.value); }}
                    onFocus={() => trackHeroSearchBarFocused()}
                    onKeyDown={handleKeyDown}
                    placeholder="Search cards or banks..."
                    className="w-full pl-11 pr-3 h-13 text-sm text-[#1a1a2e] bg-transparent outline-none placeholder:text-[#bbb] font-roboto"
                    style={{ height: "52px" }}
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="h-10 px-5 mr-1.5 font-lato text-xs font-bold tracking-wider uppercase text-white bg-[#1A6DA4] hover:bg-[#155d8c] transition-colors flex-shrink-0"
                  style={{ borderRadius: "8px" }}
                >
                  Search
                </button>
              </div>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {["HDFC", "SBI", "Axis", "ICICI"].map((bank) => (
                  <a
                    key={bank}
                    href={`/cards?q=${encodeURIComponent(bank)}`}
                    className="px-4 py-2.5 min-h-[44px] font-roboto text-xs text-white/50 border border-white/10 hover:border-white/30 hover:text-white/80 transition-all inline-flex items-center"
                    style={{ borderRadius: "100px" }}
                    onClick={() => {
                      trackSearchQueryTyped(bank);
                      trackSearchSubmitted(bank);
                    }}
                  >
                    {bank}
                  </a>
                ))}
              </div>
            </div>

            {/* Stats strip */}
            <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-0 md:divide-x md:divide-white/[0.08]">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center py-3">
                  <span className="font-montserrat text-2xl md:text-3xl font-bold text-white">{s.value}</span>
                  <span className="font-roboto text-[11px] text-white/40 mt-1">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Curved bottom */}
          <div className="relative h-12 md:h-16 -mb-1 overflow-hidden">
            <svg viewBox="0 0 1440 60" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
              <path d="M0,60 L0,20 Q720,60 1440,20 L1440,60 Z" fill="#f5f7fa" />
            </svg>
          </div>
        </section>

        {/* Quick links strip */}
        <div className="bg-[#f5f7fa]">
          <div className="max-w-[1200px] mx-auto px-5 md:px-8">
            <div className="flex items-center justify-center gap-4 md:gap-8 py-4 overflow-x-auto scrollbar-none">
              <Link
                to="/cards"
                className="flex items-center gap-2 font-lato text-xs font-bold text-[#1A6DA4] hover:text-[#155d8c] transition-colors whitespace-nowrap"
                onClick={() => trackHeroExploreAllCardsClicked('strip')}
              >
                <CreditCard className="h-3.5 w-3.5" />
                Explore All Cards
              </Link>
              <span className="text-[#ccc]">|</span>
              <Link
                to="/card-genius"
                className="flex items-center gap-2 font-lato text-xs font-bold text-[#52B974] hover:text-[#4a8c22] transition-colors whitespace-nowrap"
              >
                <Sparkles className="h-3.5 w-3.5" />
                AI Card Genius
              </Link>
              <span className="text-[#ccc] hidden md:inline">|</span>
              <button
                className="hidden md:flex items-center gap-2 font-lato text-xs font-bold text-[#888] hover:text-[#1A6DA4] transition-colors whitespace-nowrap"
                onClick={() => {
                  trackHeroExplorePicksAnchorClicked('strip');
                  document.getElementById('picks-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <Star className="h-3.5 w-3.5" />
                Curated Picks
              </button>
            </div>
          </div>
        </div>

        <PicksSection />
        <ToolsSection />
      </main>

      <Footer />
    </div>
  );
};

export default HomeLanding;
