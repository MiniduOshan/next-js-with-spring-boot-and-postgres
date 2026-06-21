"use client";

import React, { useState, useEffect } from 'react';
import { Newspaper, Clock, ArrowRight, X } from 'lucide-react';
import { toast } from 'sonner';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  status: string;
  author: string;
  createdAt: string;
}

// Dynamically assign realistic category tags and high quality news images based on keywords
function getNewsMetadata(item: NewsItem, index: number) {
  const text = (item.title + " " + item.content).toLowerCase();
  
  let category = "WORLD NEWS";
  let imageUrl = "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800"; // General

  if (text.includes("exhibition") || text.includes("giveaway") || text.includes("show") || text.includes("launch")) {
    category = "BUSINESS & EVENTS";
    imageUrl = "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=800"; 
  } else if (text.includes("gem") || text.includes("jewel") || text.includes("stone") || text.includes("luxury")) {
    category = "LIFESTYLE & LUXURY";
    imageUrl = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=800"; 
  } else if (text.includes("giraya") || text.includes("handmade") || text.includes("craft") || text.includes("traditional") || text.includes("heritage")) {
    category = "ART & CULTURE";
    imageUrl = "https://images.unsplash.com/photo-1606293926075-69a00dbfde81?auto=format&fit=crop&q=80&w=800"; 
  } else if (text.includes("mining") || text.includes("adventure") || text.includes("travel") || text.includes("tourism")) {
    category = "TRAVEL & LEISURE";
    imageUrl = "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&q=80&w=800"; 
  } else {
    const fallbacks = [
      { cat: "HOTEL HIGHLIGHTS", img: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800" },
      { cat: "HEALTH & WELLNESS", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=800" },
      { cat: "FOOD & DRINK", img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80&w=800" }
    ];
    const chosen = fallbacks[index % fallbacks.length];
    category = chosen.cat;
    imageUrl = chosen.img;
  }

  return { category, imageUrl };
}

function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          const published = data
            .filter((item: NewsItem) => item.status === 'Published')
            .sort((a: NewsItem, b: NewsItem) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setNews(published);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to load news');
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white dark:bg-slate-950 transition-colors">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-300 dark:border-slate-800 border-t-brand dark:border-t-brand"></div>
        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-slate-450">Loading News Feed</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-950 transition-colors">
        <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center justify-center mb-6 text-slate-400">
          <Newspaper className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No News Available</h3>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm">
          Please check back later for updates and articles.
        </p>
      </div>
    );
  }

  const featured = news[0];
  const featuredMeta = getNewsMetadata(featured, 0);
  const secondaryStories = news.slice(1, 4);
  const remainingStories = news.slice(4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pt-24 sm:pt-28 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8 transition-colors font-sans">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* BBC-style News Header */}
        <div className="border-b-4 border-brand pb-4">
          <div className="flex items-baseline gap-3">
            <span className="bg-brand text-white text-xs font-black tracking-widest px-2.5 py-1 uppercase rounded-sm">
              NEWS
            </span>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-950 dark:text-white">
              Platform Feed
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
            Latest stories, updates, and releases from across our portfolio properties.
          </p>
        </div>

        {/* BBC Landing Page Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Top News Story - Left Column */}
          <div 
            className="lg:col-span-7 group cursor-pointer space-y-4"
            onClick={() => setSelectedNews(featured)}
          >
            <div className="relative overflow-hidden aspect-[16/9] bg-slate-100 dark:bg-slate-900 rounded-sm border border-slate-200/50 dark:border-slate-900 shadow-sm">
              <img 
                src={featuredMeta.imageUrl} 
                alt={featured.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-brand">
                <span>{featuredMeta.category}</span>
                <span className="text-slate-350 dark:text-slate-700">|</span>
                <span className="text-slate-500 dark:text-slate-450 font-semibold">{new Date(featured.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-955 dark:text-slate-50 leading-tight group-hover:underline group-hover:text-brand dark:group-hover:text-brand transition-all font-sans">
                {featured.title}
              </h2>
              
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-3">
                {featured.content}
              </p>
            </div>
          </div>

          {/* Secondary News Stories List - Right Column */}
          <div className="lg:col-span-5 flex flex-col divide-y divide-slate-200 dark:divide-slate-900">
            {secondaryStories.map((story, index) => {
              const meta = getNewsMetadata(story, index + 1);
              return (
                <div 
                  key={story._id} 
                  className="group flex gap-4 py-4 first:pt-0 last:pb-0 cursor-pointer"
                  onClick={() => setSelectedNews(story)}
                >
                  <div className="relative w-28 h-18 sm:w-36 sm:h-22 shrink-0 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-900 overflow-hidden rounded-sm">
                    <img 
                      src={meta.imageUrl} 
                      alt={story.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex flex-col justify-between py-0.5 min-w-0">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold uppercase tracking-wide text-brand">
                        <span>{meta.category}</span>
                      </div>
                      
                      <h3 className="text-xs sm:text-sm md:text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-200 leading-snug group-hover:underline group-hover:text-brand dark:group-hover:text-brand transition-colors line-clamp-2">
                        {story.title}
                      </h3>
                    </div>
                    
                    <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lower Grid for Remaining Stories */}
        {remainingStories.length > 0 && (
          <div className="border-t-2 border-slate-200 dark:border-slate-900 pt-8 space-y-6">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">
              More News
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {remainingStories.map((story, index) => {
                const meta = getNewsMetadata(story, index + 4);
                return (
                  <div 
                    key={story._id} 
                    className="group flex flex-col space-y-3 cursor-pointer"
                    onClick={() => setSelectedNews(story)}
                  >
                    <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-900 overflow-hidden rounded-sm shadow-sm">
                      <img 
                        src={meta.imageUrl} 
                        alt={story.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.015]"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wide text-brand">
                        <span>{meta.category}</span>
                      </div>
                      
                      <h4 className="text-sm sm:text-base font-extrabold tracking-tight text-slate-900 dark:text-slate-100 group-hover:underline group-hover:text-brand dark:group-hover:text-brand transition-colors line-clamp-2">
                        {story.title}
                      </h4>
                      
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-2 pt-0.5">
                        {story.content}
                      </p>
                    </div>
                    
                    <span className="text-[10px] text-slate-500 dark:text-slate-450 font-bold self-start mt-auto">
                      {new Date(story.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Editorial Reader Overlay for reading the full story (similar to BBC article pages) */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
          <div className="absolute inset-0 bg-slate-950/70 dark:bg-slate-950/90 backdrop-blur-sm" onClick={() => setSelectedNews(null)} />
          
          <div className="relative bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col z-10 border border-slate-200 dark:border-slate-800 transition-colors">
            
            {/* Action Bar */}
            <div className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-5 py-3 border-b border-slate-100 dark:border-slate-800/80 flex justify-between items-center z-20">
              <span className="bg-brand text-white text-[10px] font-black tracking-widest px-2 py-0.5 uppercase rounded-sm">
                ARTICLE
              </span>
              <button 
                onClick={() => setSelectedNews(null)}
                className="text-slate-500 hover:text-slate-900 dark:hover:text-white p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Article Content */}
            <div className="p-6 sm:p-8 space-y-6">
              
              <div className="space-y-3">
                <div className="text-xs uppercase tracking-wide text-brand font-black">
                  {getNewsMetadata(selectedNews, 0).category}
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight leading-tight text-slate-955 dark:text-white font-sans">
                  {selectedNews.title}
                </h2>
                
                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-450 border-y border-slate-100 dark:border-slate-800 py-3">
                  <span className="font-bold text-slate-700 dark:text-slate-300">By {selectedNews.author}</span>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(selectedNews.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              {/* Banner Image */}
              <div className="relative aspect-[16/9] w-full bg-slate-100 dark:bg-slate-850 overflow-hidden rounded-sm border border-slate-200/50 dark:border-slate-800">
                <img 
                  src={getNewsMetadata(selectedNews, 0).imageUrl} 
                  alt={selectedNews.title} 
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Body Content */}
              <p className="text-slate-700 dark:text-slate-350 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans">
                {selectedNews.content}
              </p>
            </div>
            
            <div className="sticky bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-6 py-4 border-t border-slate-150 dark:border-slate-800/80 flex justify-end">
              <button 
                onClick={() => setSelectedNews(null)}
                className="bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-brand dark:hover:bg-brand hover:text-white dark:hover:text-white px-5 py-2 rounded text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
              >
                Close Story
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import AppLayout from "@/components/layout/AppLayout";
export default function PageWrapper(props: any) {
  return (
    <AppLayout>
      <News {...props} />
    </AppLayout>
  );
}
