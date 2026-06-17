"use client";

import React, { useState, useEffect } from 'react';
import { ArrowRight, LayoutGrid, List as ListIcon } from 'lucide-react';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";;
import { getCategories, renderLucideIcon, CategoryData } from "@/lib/adminData";
import { cn } from "@/lib/utils";

function Categories() {
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    setCategories(getCategories());
  }, []);

  return (
    <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-800/50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6 text-center md:text-left">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-4 animate-in fade-in">
              Explore Categories
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
              Find the perfect stay tailored to your lifestyle. Browse our curated collections of top-rated hotels across Sri Lanka.
            </p>
          </div>
          
          <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-lg flex items-center justify-center transition-all", viewMode === 'grid' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300')}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-lg flex items-center justify-center transition-all", viewMode === 'list' ? 'bg-slate-100 dark:bg-slate-800 text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300')}
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Categories Grid/List */}
        <div className={cn("grid gap-6", viewMode === 'grid' ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 lg:grid-cols-2")}>
          {categories.map((c) => {
            const textClass = (c.color && c.color.split(' ')[1]) || 'text-brand';
            return (
              <Link
                key={c.id}
                href={`/search?category=${c.id}`}
                className={cn("group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-500/30 transition-all duration-300 flex", viewMode === 'grid' ? "flex-col h-full" : "flex-row items-center h-auto sm:h-40")}
              >
                <div className={cn("overflow-hidden relative shrink-0", viewMode === 'grid' ? "h-36 w-full" : "h-full w-32 sm:w-48 hidden sm:block")}>
                  <img
                    src={c.image}
                    alt={c.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="p-1.5 rounded-xl backdrop-blur-md bg-white/90 dark:bg-slate-900/95 shadow-sm">
                      {renderLucideIcon(c.icon, `w-5 h-5 ${textClass}`)}
                    </div>
                    <span className="bg-white/20 dark:bg-slate-900/20 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {c.count}
                    </span>
                  </div>
                </div>
                <div className={cn("p-5 flex-1 flex flex-col", viewMode === 'grid' ? "" : "h-full justify-center")}>
                  <div className={cn("flex items-center gap-3 mb-1", viewMode === 'list' ? "sm:hidden" : "hidden")}>
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {renderLucideIcon(c.icon, `w-4 h-4 ${textClass}`)}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 group-hover:text-emerald-600 transition-colors text-left">{c.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1 text-left line-clamp-2 sm:line-clamp-none">{c.description}</p>

                  <div className="flex items-center text-xs font-bold text-emerald-600 mt-3 gap-1 group-hover:gap-2 transition-all">
                    Browse {c.name} <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            );
          })}

          {categories.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-205 dark:border-slate-800">
              <p className="text-slate-500">No active categories. Ask administrator to set up categories.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}


import AppLayout from "@/components/layout/AppLayout";
export default function PageWrapper(props: any) {
  return (
    <AppLayout>
      <Categories {...props} />
    </AppLayout>
  );
}
