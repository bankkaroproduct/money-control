"use client";
import { ArrowRight, Sparkles, Swords, LayoutGrid } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "@/components/Link";
import {
  trackToolsSectionViewed,
  trackHomepageSuperCardGeniusClicked,
  trackHomepageBeatMyCardClicked,
  trackHomepageCategoryCardGeniusClicked,
} from "@/services/journeyTrack";

const tools = [
  {
    icon: Sparkles,
    title: "Super Card Genius",
    description:
      "AI-powered recommendations based on your spending habits.",
    to: "/card-genius",
    onTrack: () => trackHomepageSuperCardGeniusClicked("Super Card Genius", "tools_section"),
    number: "01",
  },
  {
    icon: Swords,
    title: "Beat My Card",
    description:
      "Find a better card than the one you already have.",
    to: "/beat-my-card",
    onTrack: () => trackHomepageBeatMyCardClicked("Beat My Card", "tools_section"),
    number: "02",
  },
  {
    icon: LayoutGrid,
    title: "Category Card Genius",
    description:
      "Discover the best card for any spending category.",
    to: "/card-genius-category",
    onTrack: () => trackHomepageCategoryCardGeniusClicked("Category Card Genius", "tools_section"),
    number: "03",
  },
];

const AdvisorToolsGrid = () => {
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
    <section ref={sectionRef} className="py-20 md:py-28" style={{ backgroundColor: "#0e2230" }}>
      <div className="max-w-[1180px] mx-auto px-6 md:px-10">
        <div className="border-t border-white/[0.12] pt-12 mb-14">
          <span className="font-lato text-[11px] font-bold tracking-[0.22em] uppercase text-[#5BA42B] block mb-3">
            Moneycontrol Toolkit
          </span>
          <h2 className="font-montserrat text-[clamp(1.6rem,3.4vw,2.4rem)] font-bold text-white tracking-tight leading-[1.06]">
            Powerful Financial Tools
          </h2>
          <p className="font-roboto text-[15px] text-white/60 mt-3 max-w-[50ch] leading-relaxed">
            Everything you need to make smarter credit card decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/[0.08]" style={{ borderRadius: "2px" }}>
          {tools.map((tool) => (
            <Link
              to={tool.to}
              key={tool.title}
              onClick={() => tool.onTrack()}
              className="group flex flex-col p-8 md:p-10 bg-[#0e2230] hover:bg-white/[0.04] transition-colors duration-300"
            >
              <div className="flex items-start justify-between mb-8">
                <div
                  className="inline-flex items-center justify-center h-11 w-11 border border-white/[0.16]"
                  style={{ borderRadius: "2px" }}
                >
                  <tool.icon className="h-5 w-5 text-[#5BA42B]" />
                </div>
                <span className="font-lato text-[11px] font-bold tracking-[0.18em] text-white/20">
                  {tool.number}
                </span>
              </div>

              <h3 className="font-lato text-base font-bold text-white mb-2 tracking-tight">
                {tool.title}
              </h3>

              <p className="font-roboto text-sm text-white/60 leading-relaxed mb-8 flex-1">
                {tool.description}
              </p>

              <span className="inline-flex items-center gap-2 font-lato text-xs font-bold tracking-[0.08em] uppercase text-[#1A6DA4] group-hover:text-[#5BA42B] transition-colors">
                Try Now
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-200" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdvisorToolsGrid;
