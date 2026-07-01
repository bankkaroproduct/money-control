"use client";
import { useEffect, useRef, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CreditCard, Gift, Plane, BadgePercent, FileText, Landmark, TrendingUp } from "lucide-react";
import { trackAboutPageView, trackAboutSubscribeSectionViewed, trackAboutSubscribeClicked } from "@/services/journeyTrack";
import { brandConfig } from "@/config/brand.config";

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

function StatCard({ target, format, label }: { target: number; format: (v: number) => string; label: string }) {
  const count = useCountUp(target);
  return (
    <div className="bg-[#F5F5F5] rounded-2xl px-6 py-8 text-center border border-[#E0E0E0]">
      <p className="text-4xl font-extrabold text-[#1A6DA4] leading-none">{format(count)}</p>
      <p className="mt-2 text-sm font-medium text-gray-500">{label}</p>
    </div>
  );
}

const TOPICS = [
  { icon: CreditCard, label: "Credit Card Reviews" },
  { icon: Gift, label: "Reward Optimization" },
  { icon: Plane, label: "Travel & Lounges" },
  { icon: BadgePercent, label: "Fee Analysis" },
  { icon: FileText, label: "Expert Insights" },
  { icon: Landmark, label: "Banking Products" },
];

const About = () => {
  const subscribeSectionRef = useRef<HTMLElement>(null);
  const subscribeViewedRef = useRef(false);

  useEffect(() => { window.scrollTo({ top: 0, behavior: "smooth" }); }, []);
  useEffect(() => { trackAboutPageView(); }, []);

  useEffect(() => {
    const target = subscribeSectionRef.current;
    if (!target) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !subscribeViewedRef.current) {
          subscribeViewedRef.current = true;
          trackAboutSubscribeSectionViewed();
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <section className="pt-28 pb-16 bg-white">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mx-auto mb-6">
            <img src={brandConfig.logo} alt={brandConfig.name} className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#1A6DA4] mb-2">Moneycontrol Credit Cards</h1>
          <p className="text-base font-semibold text-gray-500 mb-5">India's Trusted Financial Platform</p>
          <p className="text-gray-700 leading-relaxed">
            Moneycontrol is India's leading financial information platform. Our credit card advisory tool helps millions of users find the right card based on their spending patterns, income level, and financial goals — powered by data-driven recommendations and expert analysis.
          </p>
        </div>
      </section>

      <section className="py-12 bg-[#F9FAFB]">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard target={100} format={(v) => `${Math.round(v)}+`} label="Cards Analyzed" />
            <StatCard target={50} format={(v) => `${Math.round(v)}M+`} label="Monthly Users" />
            <StatCard target={20} format={(v) => `${Math.round(v)}+`} label="Banks Covered" />
            <StatCard target={15} format={(v) => `${Math.round(v)}+`} label="Years Trusted" />
          </div>
        </div>
      </section>

      <section className="py-14 bg-white">
        <div className="container max-w-2xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A6DA4] mb-6">Why Moneycontrol?</h2>
          <div className="space-y-5 text-gray-700 leading-relaxed">
            <p>
              With over two decades of experience in financial information, Moneycontrol brings unmatched depth to credit card advisory. We analyze cards across every dimension — rewards, fees, eligibility, lounge access, and real-world value — so you don't have to.
            </p>
            <p>
              Our AI-powered recommendation engine considers your unique spending profile to suggest cards that maximize your returns. Whether you're a frequent traveller, online shopper, or looking for your first card, we have tailored recommendations for you.
            </p>
            <p>
              Every recommendation is independent and data-driven. We don't promote cards based on commercial arrangements — only on what delivers the best value for your specific needs.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 bg-[#F9FAFB]">
        <div className="container max-w-3xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A6DA4] mb-8 text-center">What We Cover</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TOPICS.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 bg-white border border-[#E0E0E0] rounded-xl px-4 py-4"
              >
                <Icon className="w-5 h-5 text-[#1A6DA4] flex-shrink-0" />
                <span className="text-sm font-semibold text-gray-700">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={subscribeSectionRef} className="py-14 bg-white">
        <div className="container max-w-xl mx-auto px-4">
          <div className="bg-white border border-[#E0E0E0] rounded-2xl px-8 py-10 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#1A6DA4] mb-3">
              Find your perfect credit card
            </h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Use our AI-powered tools to discover credit cards that match your spending style and financial goals.
            </p>
            <a
              href="/card-genius"
              onClick={() => trackAboutSubscribeClicked("/card-genius")}
              className="inline-flex items-center gap-2 bg-[#1A6DA4] hover:bg-[#155d8c] text-white font-bold px-8 py-4 rounded-xl text-base transition-colors"
            >
              <TrendingUp className="w-5 h-5" />
              Try AI Card Genius
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
