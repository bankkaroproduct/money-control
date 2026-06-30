"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, ArrowRight, Search } from "lucide-react";
import { blogs } from "@/data/blogs";

const CATEGORIES = ["All", "Savings Tips", "Travel Rewards", "Credit Building", "Card Comparisons", "Financial Education"];

const BlogsGrid = () => {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = blogs.filter((blog) => {
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      blog.title.toLowerCase().includes(q) ||
      blog.excerpt.toLowerCase().includes(q) ||
      blog.tags.some((t) => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const [featured, ...rest] = filtered;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-[#1A6DA4] text-white"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg font-medium">No articles found</p>
          <p className="text-sm mt-1">Try a different search term or category</p>
        </div>
      )}

      {/* Featured article */}
      {featured && (
        <div
          onClick={() => router.push(`/blogs/${featured.slug}`)}
          className="group mb-10 cursor-pointer grid grid-cols-1 lg:grid-cols-2 gap-0 bg-card rounded-2xl overflow-hidden border border-border/50 shadow-lg hover:shadow-2xl hover:border-[#1A6DA4]/30 transition-all duration-300"
        >
          <div className="relative h-56 sm:h-72 lg:h-full min-h-[220px] overflow-hidden">
            <img
              src={featured.image}
              alt={featured.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 lg:bg-gradient-to-r lg:from-transparent lg:to-transparent" />
            <span className="absolute top-4 left-4 bg-[#F5F5F5] text-black px-3 py-1 rounded-full text-xs font-bold shadow">
              {featured.category}
            </span>
          </div>

          <div className="p-6 sm:p-8 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#1A6DA4] font-semibold uppercase tracking-wide mb-3">
              Featured Article
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-3 group-hover:text-[#1A6DA4] transition-colors leading-tight">
              {featured.title}
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 line-clamp-3">
              {featured.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{featured.date}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{featured.readTime}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-5">
              {featured.tags.map((tag) => (
                <span key={tag} className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-medium">
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-[#1A6DA4] font-semibold text-sm group-hover:gap-3 transition-all">
              Read Article
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}

      {/* Article grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((blog) => (
            <div
              key={blog.id}
              onClick={() => router.push(`/blogs/${blog.slug}`)}
              className="group bg-card rounded-2xl overflow-hidden border border-border/50 shadow hover:shadow-xl hover:border-[#1A6DA4]/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
            >
              <div className="relative h-48 overflow-hidden flex-shrink-0">
                <img
                  src={blog.image}
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute top-3 left-3 bg-[#F5F5F5] text-black px-2.5 py-1 rounded-full text-xs font-bold shadow">
                  {blog.category}
                </span>
              </div>

              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{blog.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{blog.readTime}</span>
                  </div>
                </div>

                <h3 className="font-bold text-foreground group-hover:text-[#1A6DA4] transition-colors mb-2 leading-snug line-clamp-2 flex-1">
                  {blog.title}
                </h3>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                  {blog.excerpt}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                  <span className="text-xs font-semibold text-foreground">{blog.author}</span>
                  <div className="flex items-center gap-1 text-[#1A6DA4] text-xs font-semibold group-hover:gap-1.5 transition-all">
                    Read
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BlogsGrid;
