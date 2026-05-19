"use client";
import { Search, Star, CreditCard, Users, TrendingUp } from "lucide-react";
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
  joining_fee: string;
  annual_fee: string;
  networks: string;
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

  // Fill remaining slots with API order if curated cards weren't found
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

// ── Stats ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: "130+",  label: "Cards Listed",   icon: CreditCard },
  { value: "50K+",  label: "Users Helped",   icon: Users },
  { value: "₹12K",  label: "Avg. Savings/yr",icon: TrendingUp },
  { value: "4.9★",  label: "User Rating",    icon: Star },
];

// ── Card component ───────────────────────────────────────────────────────────
function CardTile({ card }: { card: CardItem }) {
  const networkList = card.networks
    ? card.networks.split(",").map((n) => n.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white border border-[#E5EAF0] rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200">
      {/* Image — full width, flush to top */}
      <div className="h-44 bg-[#FFF5E6] flex items-center justify-center overflow-hidden">
        <img
          src={card.image}
          alt={card.name}
          loading="lazy"
          className="w-full h-full object-contain scale-110"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-4 flex flex-col flex-1">
        {/* Network badges */}
        {networkList.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {networkList.map((n) => (
              <span key={n} className="text-[10px] border border-gray-300 rounded-full px-2 py-0.5 text-gray-500">
                {n === "AmericanExpress" ? "Amex" : n}
              </span>
            ))}
          </div>
        )}

        <h3 className="text-sm font-bold text-[#111] leading-snug line-clamp-2 mb-3">{card.name}</h3>

        {/* Button */}
        <div className="mt-auto">
          <Link
            to={card.alias ? `/cards/${card.alias}` : "/cards"}
            className="block w-full text-center text-xs font-semibold py-2.5 rounded-lg border border-[#004E92] text-[#004E92] hover:bg-[#EEF4FF] transition-colors"
          >
            Details
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
      <div className="h-44 bg-gray-100" />
      <div className="px-4 pt-3 pb-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/4" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-12 bg-gray-100 rounded-lg mt-2" />
        <div className="flex gap-2 mt-2">
          <div className="h-9 bg-gray-100 rounded-lg flex-1" />
          <div className="h-9 bg-gray-100 rounded-lg flex-1" />
        </div>
      </div>
    </div>
  );
}

// ── Curated card aliases per tab (ordered) ───────────────────────────────────
const CURATED_ALIASES: Record<TabKey, string[]> = {
  picks: [
    "hdfc-regalia-gold-credit-card",
    "sbi-cashback-credit-card",
    "axis-bank-magnus-credit-card",
    "hdfc-millenia-credit-card",
    "icici-amazon-pay-credit-card",
    "axis-atlas-credit-card",
    "idfc-first-wealth-credit-card",
    "tata-neu-infinity-sbi-credit-card",
    "axis-flipkart-credit-card",
  ],
  best: [
    "hdfc-infinia-credit-card",
    "axis-bank-magnus-credit-card",
    "axis-atlas-credit-card",
    "hdfc-diners-club-black",
    "hdfc-regalia-gold-credit-card",
    "sbi-aurum-credit-card",
    "icici-emeralde-private-metal-credit-card",
    "hdfc-marriott-bonvoy-credit-card",
    "axis-bank-reserve-credit-card",
  ],
  beginner: [
    "icici-amazon-pay-credit-card",
    "idfc-first-select-credit-card",
    "axis-neo-credit-card",
    "scapia-credit-card",
    "hdfc-pixel-play-credit-card",
    "kiwi-klick-credit-card",
    "kotak-811-dream-different-credit-card",
    "rbl-bank-play-credit-card",
    "idfc-first-classic-credit-card",
  ],
  cashback: [
    "sbi-cashback-credit-card",
    "hdfc-millenia-credit-card",
    "icici-amazon-pay-credit-card",
    "axis-flipkart-credit-card",
    "axis-cashback-credit-card",
    "hdfc-swiggy-credit-card",
    "hdfc-pixel-play-credit-card",
    "flipkart-sbi-credit-card",
    "hdfc-tata-neu-plus-credit-card",
  ],
};

// ── Tab config with fetch params ─────────────────────────────────────────────
const TAB_CONFIG: Record<TabKey, { label: string; slug: string; free_cards: string; sort_by: string }> = {
  picks:    { label: "BankExpert's Picks", slug: "",                          free_cards: "",     sort_by: "priority" },
  best:     { label: "Best Cards",         slug: "best-travel-credit-card",   free_cards: "",     sort_by: "priority" },
  beginner: { label: "Beginner Cards",     slug: "",                          free_cards: "true", sort_by: "priority" },
  cashback: { label: "Best Cashback",      slug: "best-shopping-credit-card", free_cards: "",     sort_by: "priority" },
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
