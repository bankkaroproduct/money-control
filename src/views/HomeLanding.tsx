"use client";
import { Search, Star, CreditCard, Users, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/Navigation";
import ExpertPicks from "@/components/ExpertPicks";
import AdvisorToolsGrid from "@/components/AdvisorToolsGrid";
import Footer from "@/components/Footer";
import { Link } from "@/components/Link";

const STATS = [
  { value: "130+", label: "Cards Listed", icon: CreditCard },
  { value: "50K+", label: "Users Helped", icon: Users },
  { value: "₹12K", label: "Avg. Savings/yr", icon: TrendingUp },
  { value: "4.9★", label: "User Rating", icon: Star },
];

const HomeLanding = () => {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    if (query.trim()) {
      router.push(`/cards?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/cards");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section
          className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-20"
          style={{ backgroundColor: "#F5F5F5" }}
        >
          {/* Dot-grid overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              opacity: 0.06,
              backgroundImage: "radial-gradient(circle, #004E92 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="container relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto px-4">
            {/* Eyebrow */}
            <p
              className="text-xs font-semibold tracking-[0.2em] uppercase mb-4"
              style={{ color: "#666666" }}
            >
              India's Trusted Card Advisor
            </p>

            {/* Headline — Playfair Display */}
            <h1
              className="font-playfair text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] tracking-tight mb-5"
              style={{ color: "#004E92" }}
            >
              Find the card that rewards{" "}
              <em className="not-italic" style={{ fontStyle: "italic" }}>
                your life
              </em>
            </h1>

            <p
              className="text-base md:text-lg mb-8 max-w-lg"
              style={{ color: "#666666" }}
            >
              Compare 130+ credit cards across rewards, fees and benefits —
              personalised by BankExpert.
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

              {/* Explore Cards button */}
              <div className="mt-3 flex justify-center">
                <Link
                  to="/cards"
                  className="inline-flex items-center gap-1.5 text-sm font-medium px-6 py-2.5 rounded-lg transition-colors"
                  style={{
                    border: "1.5px solid #004E92",
                    color: "#004E92",
                    backgroundColor: "transparent",
                  }}
                >
                  Explore Cards →
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stat Strip ───────────────────────────────────────── */}
        <section style={{ backgroundColor: "#004E92" }}>
          <div className="container max-w-4xl mx-auto px-4 py-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x md:divide-white/20">
              {STATS.map((s) => (
                <div key={s.label} className="flex flex-col items-center text-center py-1">
                  <span
                    className="text-2xl md:text-3xl font-extrabold leading-none"
                    style={{ color: "#FFFFFF" }}
                  >
                    {s.value}
                  </span>
                  <span
                    className="text-xs mt-1 font-medium tracking-wide"
                    style={{ color: "#F5F5F5" }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

<ExpertPicks />
        <AdvisorToolsGrid />
      </main>

      <Footer />
    </div>
  );
};

export default HomeLanding;
