"use client";
import { useState, useEffect } from "react";
import { ExternalLink, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/components/Link";
import { brandConfig } from "@/config/brand.config";
import { authManager } from "@/services/authManager";

type DisplayCard = {
  name: string;
  bank: string;
  tag: string;
  reward: string;
  fee: string;
  image: string;
  alias: string;
};

const PICKS: DisplayCard[] = [
  { name: "HDFC Infinia", bank: "HDFC Bank", tag: "Premium", reward: "3.3% reward rate", fee: "₹12,500/yr", image: "/cards/hdfc-infinia.png", alias: "" },
  { name: "Axis Magnus", bank: "Axis Bank", tag: "Best All-Rounder", reward: "5% on partner spends", fee: "₹10,000/yr", image: "/cards/axis-magnus.png", alias: "" },
  { name: "SBI Elite", bank: "SBI Card", tag: "Value Champion", reward: "2x rewards on travel", fee: "₹4,999/yr", image: "/cards/sbi-elite.png", alias: "" },
  { name: "ICICI Sapphiro", bank: "ICICI Bank", tag: "Lifestyle", reward: "4x on dining & movies", fee: "₹6,500/yr", image: "/cards/icici-sapphiro.png", alias: "" },
  { name: "Scapia", bank: "Federal Bank", tag: "Travel", reward: "Unlimited lounge access", fee: "Free", image: "/placeholder.svg", alias: "" },
];

type ApiCard = {
  id: number;
  name: string;
  card_bg_image?: string;
  image?: string;
  seo_card_alias?: string;
  card_alias?: string;
};

const NAME_MATCHERS: { keyword: RegExp; index: number }[] = [
  { keyword: /infinia/i, index: 0 },
  { keyword: /magnus/i, index: 1 },
  { keyword: /\bsbi\b.*elite|elite.*\bsbi\b/i, index: 2 },
  { keyword: /sapphiro/i, index: 3 },
  { keyword: /scapia/i, index: 4 },
];

function resolveFromApi(apiCards: ApiCard[]): DisplayCard[] {
  const updated = PICKS.map((p) => ({ ...p }));
  for (const apiCard of apiCards) {
    const match = NAME_MATCHERS.find((m) => m.keyword.test(apiCard.name));
    if (match) {
      const img = apiCard.card_bg_image || apiCard.image;
      const alias = apiCard.seo_card_alias || apiCard.card_alias || "";
      updated[match.index] = {
        ...updated[match.index],
        ...(img ? { image: img } : {}),
        ...(alias ? { alias } : {}),
      };
    }
  }
  return updated;
}

const ExpertPicks = () => {
  const [cards, setCards] = useState<DisplayCard[]>(PICKS);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    authManager
      .makeAuthenticatedRequest("/api/proxy/cardgenius/cards", { method: "GET" })
      .then((r) => r.json())
      .then((data) => {
        let apiCards: ApiCard[] = [];
        if (data?.status === "success" && Array.isArray(data?.data?.cards)) apiCards = data.data.cards;
        else if (Array.isArray(data?.data)) apiCards = data.data;
        else if (Array.isArray(data)) apiCards = data;
        if (apiCards.length > 0) setCards(resolveFromApi(apiCards));
      })
      .catch(() => {});
  }, []);

  const prev = () => setCurrent((c) => (c - 1 + cards.length) % cards.length);
  const next = () => setCurrent((c) => (c + 1) % cards.length);

  const visible = [
    cards[current % cards.length],
    cards[(current + 1) % cards.length],
    cards[(current + 2) % cards.length],
  ];

  return (
    <section className="py-14 md:py-20 bg-white">
      <div className="container max-w-5xl mx-auto px-4">
        <div className="text-center mb-10 md:mb-14">
          <p
            className="text-xs font-semibold tracking-[0.18em] uppercase mb-2"
            style={{ color: "#666666" }}
          >
            Handpicked Selection
          </p>
          <h2
            className="text-3xl md:text-4xl font-extrabold tracking-tight"
            style={{ color: "#004E92" }}
          >
            {brandConfig.name}'s Top Card Picks
          </h2>
          <p className="mt-3 max-w-lg mx-auto text-sm md:text-base" style={{ color: "#666666" }}>
            Premium credit cards for maximum rewards, travel perks &amp; lifestyle benefits.
          </p>
        </div>

        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {visible.map((card, i) => (
              <div
                key={`${card.name}-${i}`}
                className="rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-shadow duration-200 border-l-4"
                style={{
                  background: "#F5F5F5",
                  border: "1px solid #B8D4EE",
                  borderLeftColor: "#004E92",
                  borderLeftWidth: "4px",
                }}
              >
                {/* Top row: badge + fee */}
                <div className="flex items-center justify-between px-4 pt-4 pb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: "#004E92", color: "#FFFFFF" }}
                  >
                    {card.tag}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "#666666" }}>
                    {card.fee}
                  </span>
                </div>

                {/* Card image */}
                <div className="px-4 py-2">
                  <img
                    src={card.image}
                    alt={card.name}
                    loading="lazy"
                    className="w-full h-40 rounded-xl object-cover"
                    onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }}
                  />
                </div>

                {/* Card info */}
                <div className="px-4 py-2 flex-1">
                  <h3
                    className="text-base font-bold leading-tight"
                    style={{ color: "#004E92" }}
                  >
                    {card.name}
                  </h3>
                  <p className="text-xs mt-0.5" style={{ color: "#666666" }}>
                    {card.bank} · {card.reward}
                  </p>
                </div>

                {/* View Details button */}
                <div className="px-4 pb-4 pt-2">
                  <Link
                    to={card.alias ? `/cards/${card.alias}` : "/cards"}
                    className="w-full text-center text-sm font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-1"
                    style={{
                      border: "1px solid #004E92",
                      color: "#004E92",
                      backgroundColor: "transparent",
                    }}
                  >
                    View Details <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Prev / Next controls */}
          <div className="flex justify-center gap-3 mt-8">
            <button
              onClick={prev}
              className="h-11 w-11 rounded-full flex items-center justify-center transition-colors"
              style={{ border: "1px solid #004E92", color: "#004E92", backgroundColor: "transparent" }}
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={next}
              className="h-11 w-11 rounded-full flex items-center justify-center transition-colors"
              style={{ backgroundColor: "#004E92", color: "white" }}
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ExpertPicks;
