"use client";

import { useEffect, useRef } from "react";
import { Link } from "@/components/Link";
import { ChevronRight, ArrowUpRight, TrendingUp, Sparkles, BookOpen, Calendar, Clock, ArrowRight } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRouter } from "next/navigation";
import { blogs } from "@/data/blogs";

gsap.registerPlugin(ScrollTrigger);

export { blogs };

const BlogSection = () => {
  const router = useRouter();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  // Animate cards on scroll
  useEffect(() => {
    if (cardsRef.current.length === 0) return;

    // Stagger animation for blog cards
    gsap.fromTo(
      cardsRef.current,
      {
        opacity: 0,
        y: 60,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          end: "top 40%",
          scrub: 1,
        }
      }
    );
  }, []);

  // When landing on "/#blog", ensure we smoothly scroll to the blog section
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#blog") return;

    const section = sectionRef.current;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const currentScroll = window.scrollY || window.pageYOffset || 0;
    const navOffset = 80; // keep in sync with Navigation header height
    const targetY = Math.max(rect.top + currentScroll - navOffset, 0);

    window.scrollTo({
      top: targetY,
      behavior: "smooth",
    });
  }, []);

  return (
    <section id="blog" ref={sectionRef} className="py-[var(--section-space-lg)] bg-gradient-to-br from-muted/30 via-background to-accent/10 scroll-mt-20">
      <div className="section-shell">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 bg-[#F5F5F5] text-black px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-semibold">Expert Insights</span>
          </div>
          <h2 className="fluid-h2 mb-3 text-[#1A6DA4]">
            Real Stories, Real Strategies
          </h2>
          <p className="fluid-body text-muted-foreground max-w-4xl mx-auto">
            Learn from people who've mastered maximizing credit card rewards and savings.
          </p>
        </div>

        {/* Blog Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
          {blogs.map((blog, index) => (
            <div
              key={blog.id}
              ref={(el) => {
                if (el) cardsRef.current[index] = el;
              }}
              onClick={() => router.push(`/blog/${blog.slug}`)}
              className="group bg-card rounded-xl sm:rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-border/50 hover:border-[#1A6DA4]/30 hover:-translate-y-1 sm:hover:-translate-y-2 cursor-pointer touch-target"
            >
              {/* Image */}
              <div className="relative h-44 sm:h-52 md:h-56 overflow-hidden">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#F5F5F5] text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                    {blog.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                {/* Meta */}
                <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 sm:mb-3 text-foreground group-hover:text-[#1A6DA4] transition-colors line-clamp-2">
                  {blog.title}
                </h3>

                {/* Excerpt */}
                <p className="hidden sm:block text-sm md:text-base text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                  {blog.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  {blog.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] sm:text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Author & CTA */}
                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/50">
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-foreground">{blog.author}</p>
                    <p className="text-xs text-muted-foreground">Author</p>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2 text-[#1A6DA4] text-sm sm:text-base font-medium group-hover:translate-x-1 transition-all sm:ml-auto">
                    Read More
                    <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
