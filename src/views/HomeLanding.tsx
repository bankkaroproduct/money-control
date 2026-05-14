"use client";
import { Search, Star, CreditCard, Users, TrendingUp, ExternalLink } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import AdvisorToolsGrid from "@/components/AdvisorToolsGrid";
import Footer from "@/components/Footer";
import { Link } from "@/components/Link";
import { authManager } from "@/services/authManager";

// ── Types ────────────────────────────────────────────────────────────────────
type CardItem = {
  name: string;
  bank: string;
  alias: string;
  image: string;
  annual_fee: string;
  benefit: string;
};

type TabKey = "picks" | "best" | "beginner" | "cashback";

// ── Helpers ──────────────────────────────────────────────────────────────────
const BANK_MAP: Record<string, string> = {
  hdfc: "HDFC Bank",
  sbi: "SBI Card",
  axis: "Axis Bank",
  icici: "ICICI Bank",
  kotak: "Kotak Bank",
  idfc: "IDFC FIRST",
  hsbc: "HSBC",
  amex: "Amex",
  "american express": "Amex",
  scapia: "Federal Bank",
  kiwi: "Kiwi",
  indusind: "IndusInd Bank",
  yes: "Yes Bank",
  rbl: "RBL Bank",
  au: "AU Small Finance",
  bob: "Bank of Baroda",
  swiggy: "HDFC Bank",
  flipkart: "SBI Card",
  myntra: "Kotak Bank",
  tata: "SBI Card",
};

function extractBank(cardName: string): string {
  const lower = cardName.toLowerCase();
  for (const [key, val] of Object.entries(BANK_MAP)) {
    if (lower.includes(key)) return val;
  }
  return "Bank";
}

function cleanBenefit(raw: string): string {
  return raw.trim().replace(/\s{2,}/g, " ").replace(/on\s*$/, "").replace(/\s+on\s*$/, "").trim();
}

function parseCards(data: any): CardItem[] {
  let raw: any[] = [];
  if (Array.isArray(data?.data?.cards)) raw = data.data.cards;
  else if (Array.isArray(data?.data)) raw = data.data;
  else if (Array.isArray(data)) raw = data;

  return raw.slice(0, 9).map((c: any) => {
    const alias = c.seo_card_alias || c.card_alias || "";
    const name = c.name || c.card_name || "";
    const bank = c.bank_name || c.bank || extractBank(name);
    const image = c.card_bg_image || c.image || "";
    const feeRaw = c.annual_fee || c.joining_fee_text || "";
    const annual_fee = feeRaw === "0" || feeRaw === "Free" || feeRaw === "" ? "Free" : `₹${feeRaw}/yr`;
    const benefits: string[] = Array.isArray(c.key_benefits) ? c.key_benefits : [];
    const benefit = benefits.map(cleanBenefit).find((b) => b.length > 8) || "";
    return { name, bank, alias, image, annual_fee, benefit };
  });
}

// ── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "130+",  label: "Cards Listed",   icon: CreditCard },
  { value: "50K+",  label: "Users Helped",   icon: Users },
  { value: "₹12K",  label: "Avg. Savings/yr",icon: TrendingUp },
  { value: "4.9★",  label: "User Rating",    icon: Star },
];

// ── Card component ───────────────────────────────────────────────────────────
function CardTile({ card }: { card: CardItem }) {
  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Image */}
      <div className="px-4 pt-4">
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="w-full h-36 object-cover rounded-lg bg-[#F5F5F5]"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
        <p className="text-xs text-gray-400 mb-0.5">{card.bank}</p>
        <h3 className="text-sm font-semibold text-[#111] leading-snug line-clamp-2 mb-2">{card.name}</h3>

        {card.benefit && (
          <span className="inline-block self-start text-[11px] font-semibold bg-[#EEF4FF] text-[#004E92] px-3 py-1 rounded-full mb-3 line-clamp-1">
            {card.benefit}
          </span>
        )}

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xs text-gray-400">{card.annual_fee}</span>
          <Link
            to={card.alias ? `/cards/${card.alias}` : "/cards"}
            className="inline-flex items-center gap-1 text-xs font-semibold px-4 py-2 rounded-lg border border-[#004E92] text-[#004E92] hover:bg-[#004E92] hover:text-white transition-colors"
          >
            View Details <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl overflow-hidden animate-pulse">
      <div className="px-4 pt-4">
        <div className="w-full h-36 rounded-lg bg-gray-100" />
      </div>
      <div className="px-4 pt-3 pb-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-6 bg-gray-100 rounded-full w-1/2" />
        <div className="h-8 bg-gray-100 rounded w-1/3 ml-auto mt-2" />
      </div>
    </div>
  );
}

// ── Tab config with fetch params ─────────────────────────────────────────────
const TAB_CONFIG: Record<TabKey, { label: string; slug: string; free_cards: string; sort_by: string }> = {
  picks:    { label: "Shubham's Picks", slug: "",                          free_cards: "",     sort_by: "priority" },
  best:     { label: "Best Cards",      slug: "best-travel-credit-card",   free_cards: "",     sort_by: "priority" },
  beginner: { label: "Beginner Cards",  slug: "",                          free_cards: "true", sort_by: "priority" },
  cashback: { label: "Best Cashback",   slug: "best-shopping-credit-card", free_cards: "",     sort_by: "priority" },
};

// ── Tabbed picks section ─────────────────────────────────────────────────────
function ShubhamPicks() {
  const [activeTab, setActiveTab] = useState<TabKey>("picks");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cache = useRef<Partial<Record<TabKey, CardItem[]>>>({});

  const fetchCardsForTab = (tabKey: TabKey) => {
    // Return cached result immediately
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
    const qs = new URLSearchParams({ sort_by: config.sort_by });
    if (config.slug) qs.set("slug", config.slug);
    if (config.free_cards) qs.set("free_cards", config.free_cards);

    authManager
      .makeAuthenticatedRequest(`/api/proxy/cardgenius/cards?${qs}`, { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        const parsed = parseCards(data);
        cache.current[tabKey] = parsed;
        setCards(parsed);
      })
      .catch(() => {
        setError(`Failed to load ${TAB_CONFIG[tabKey].label}. Please try again.`);
      })
      .finally(() => setLoading(false));
  };

  // Load default tab on mount
  useEffect(() => { fetchCardsForTab("picks"); }, []); // eslint-disable-line

  const handleTabClick = (tabKey: TabKey) => {
    setActiveTab(tabKey);
    fetchCardsForTab(tabKey);
  };

  return (
    <section className="py-14 bg-[#F9FAFB]">
      <div className="container max-w-5xl mx-auto px-4">
        {/* Section header */}
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.18em] uppercase text-gray-400 mb-1">
            Curated by BankExpert
          </p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#004E92]">
            Explore BankExpert's Picks
          </h2>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-8 scrollbar-none">
          {(Object.keys(TAB_CONFIG) as TabKey[]).map((key) => (
            <button
              key={key}
              onClick={() => handleTabClick(key)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === key
                  ? "bg-[#004E92] text-white"
                  : "bg-white border border-[#E5EAF0] text-gray-500 hover:text-[#004E92] hover:border-[#004E92]"
              }`}
            >
              {TAB_CONFIG[key].label}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 9 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="flex flex-col items-center py-16 gap-4">
            <p className="text-gray-500 text-sm">{error}</p>
            <button
              onClick={() => fetchCardsForTab(activeTab)}
              className="px-6 py-2.5 rounded-lg bg-[#004E92] text-white text-sm font-semibold hover:bg-[#003A6E] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Card grid */}
        {!loading && !error && cards.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cards.map((card) => (
              <CardTile key={card.alias || card.name} card={card} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && cards.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            No cards found for this category.
          </div>
        )}
      </div>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
const HomeLanding = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    router.push(query.trim() ? `/cards?q=${encodeURIComponent(query.trim())}` : "/cards");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section
          className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.06,
              backgroundImage: "radial-gradient(circle, #004E92 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="container relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-4">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-4" style={{ color: "#666666" }}>
              India's Trusted Card Advisor
            </p>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-5" style={{ color: "#004E92" }}>
              Build Wealth Through{" "}
              <em className="not-italic" style={{ fontStyle: "italic" }}>
                Smarter Credit Cards
              </em>
            </h1>

            <p className="text-base md:text-lg mb-3 max-w-lg" style={{ color: "#666666" }}>
              Learn which cards work best for you. No bias. No spam.
            </p>

            <p className="text-sm font-medium mb-8" style={{ color: "#004E92" }}>
              ↓ Explore BankExpert's Picks Below
            </p>

            {/* Search bar */}
            <div className="w-full max-w-lg">
              <div className="flex items-center gap-0 bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search by card name or bank…"
                    className="w-full pl-11 pr-4 h-12 text-sm text-gray-800 bg-transparent outline-none placeholder:text-gray-400"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  className="h-12 px-6 text-sm font-semibold text-white flex-shrink-0 transition-colors"
                  style={{ backgroundColor: "#004E92" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#003A6E")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#004E92")}
                >
                  Search
                </button>
              </div>

              <div className="mt-3 flex justify-center">
                <Link
                  to="/cards"
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-6 py-3 rounded-lg transition-colors"
                  style={{ border: "1.5px solid #004E92", color: "#004E92", backgroundColor: "transparent" }}
                >
                  Explore All Cards →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stat Strip ── */}
        <section style={{ backgroundColor: "#004E92" }}>
          <div className="container max-w-4xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/20">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center text-center py-1">
                  <span className="text-2xl md:text-3xl font-extrabold leading-none text-white">{s.value}</span>
                  <span className="text-xs mt-1 font-medium tracking-wide" style={{ color: "#F5F5F5" }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Shubham's Picks (tabbed) ── */}
        <ShubhamPicks />

        {/* ── Tools ── */}
        <AdvisorToolsGrid />
      </main>

      <Footer />
    </div>
  );
};

export default HomeLanding;
