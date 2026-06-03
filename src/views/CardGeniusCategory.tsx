"use client";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import CategoryCardGenius from "@/components/CategoryCardGenius";
import Footer from "@/components/Footer";
import { trackCcgPageView } from "@/services/journeyTrack";

const CardGeniusCategory = () => {
  useEffect(() => {
    trackCcgPageView('category_card_genius');
  }, []);

  return <div className="min-h-screen bg-background">
    <Navigation />
    <CategoryCardGenius />
    <Footer />
  </div>;
};
export default CardGeniusCategory;
