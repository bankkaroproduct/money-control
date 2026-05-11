"use client";
import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CreditCard, Gift, Plane, BadgePercent, FileText, Landmark, Youtube } from "lucide-react";

// ── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target: number, duration = 1800) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target * 10) / 10);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return value;
}

// ── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ target, format, label }: { target: number; format: (v: number) => string; label: string }) {
  const count = useCountUp(target);
  return (
    <div className="bg-[#F5F5F5] rounded-2xl px-6 py-8 text-center border border-[#E0E0E0]">
      <p className="text-4xl font-extrabold text-[#004E92] leading-none">{format(count)}</p>
      <p className="mt-2 text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

const TOPICS = [
  { icon: CreditCard, label: "Credit Card Reviews" },
  { icon: Gift, label: "Reward Hacks" },
  { icon: Plane, label: "Lounge Access" },
  { icon: BadgePercent, label: "Fee Waiver Tricks" },
  { icon: FileText, label: "Application Tips" },
  { icon: Landmark, label: "Banking Products" },
];

// ── Page ─────────────────────────────────────────────────────────────────────
const About = () => {
  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* ── HERO ── */}
      <section className="pt-28 pb-16 bg-white">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="w-28 h-28 rounded-full bg-[#004E92] flex items-center justify-center mx-auto mb-6 text-white text-4xl font-extrabold select-none">
            SD
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#004E92] mb-2">Shubham Dubey</h1>
          <p className="text-base font-semibold text-gray-500 mb-5">Credit Card &amp; Finance Expert</p>
          <p className="text-gray-700 leading-relaxed">
            I run <span className="font-semibold text-[#004E92]">Bank Expert</span> — a YouTube channel dedicated to helping Indians get the most out of their credit cards. Over 3 years I've published 344 videos covering everything from first-time card selection to advanced rewards stacking. My goal is simple: cut through the noise and give you honest, actionable advice you can use today.
          </p>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-12 bg-[#F9FAFB]">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard target={26.9} format={(v) => `${v.toFixed(1)}K+`} label="Subscribers" />
            <StatCard target={9.5} format={(v) => `${v.toFixed(1)}M+`} label="Total Views" />
            <StatCard target={344} format={(v) => `${Math.round(v)}`} label="Videos Published" />
            <StatCard target={3} format={(v) => `${Math.round(v)}+`} label="Years Active" />
          </div>
        </div>
      </section>

      {/* ── WHY BANK EXPERT ── */}
      <section className="py-14 bg-white">
        <div className="container max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#004E92] mb-6">Why Bank Expert?</h2>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <p>
              Most credit card content in India falls into one of two traps: it's either too basic ("here are the top 5 cards!") or quietly sponsored by the banks being reviewed. Neither actually helps you make a better financial decision.
            </p>
            <p>
              I created Bank Expert to be different. Every review I publish is independent — no brand deals, no affiliate pressure, no hidden agenda. I only recommend cards I've personally researched, tested, or verified against real-world usage.
            </p>
            <p>
              Beyond reviews, I focus on the <span className="font-semibold">why</span> — why certain cards pair well together, why annual fee waivers are worth chasing, why your reward points are probably expiring unused. These are the strategies that can genuinely save you ₹20,000–₹50,000 a year, and they're rarely discussed in mainstream finance content.
            </p>
            <p>
              If you're serious about optimising your wallet — not just collecting cards — Bank Expert is for you.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT I COVER ── */}
      <section className="py-14 bg-[#F9FAFB]">
        <div className="container max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#004E92] mb-8 text-center">What I Cover</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TOPICS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white border border-[#E0E0E0] rounded-xl px-4 py-4"
              >
                <Icon className="w-5 h-5 text-[#004E92] flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY TRUST ME ── */}
      <section className="py-14 bg-white">
        <div className="container max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#004E92] mb-6">Why Trust Me?</h2>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <p>
              9.5 million views don't happen by accident. Every one of those views came from a real Indian viewer searching for answers — about which card to apply for, whether a fee waiver is possible, or how to actually redeem reward points. The fact that they stayed, watched, and came back is the only endorsement I need.
            </p>
            <p>
              344 videos over 3+ years means I show up consistently. Not just when a new card launches or a bank runs a campaign — every week, with content that's timely, researched, and tested. I've personally applied for and used the cards I review, or done deep-dive research using real data.
            </p>
            <p>
              I have no exclusive partnerships with any bank or card network. My recommendations are based on one thing: what makes the most financial sense for you, given your income, spending pattern, and goals.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-14 bg-[#F9FAFB]">
        <div className="container max-w-xl mx-auto px-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl px-8 py-10 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#004E92] mb-3">
              Ready to master your credit cards?
            </h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Join 26,900+ subscribers learning how to earn more rewards, skip annual fees, and build a smarter wallet.
            </p>
            <a
              href="https://www.youtube.com/@bankexpert"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FF0000] hover:bg-[#CC0000] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
            >
              <Youtube className="w-5 h-5" />
              Subscribe to Bank Expert
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
