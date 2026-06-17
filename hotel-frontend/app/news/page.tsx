"use client";

import React, { useState, useEffect } from 'react';
import { Newspaper, Clock } from 'lucide-react';
import { toast } from 'sonner';

interface NewsItem {
  _id: string;
  title: string;
  content: string;
  status: string;
  author: string;
  createdAt: string;
}

function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          setNews(data.filter((item: NewsItem) => item.status === 'Published'));
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

  return (
    <div className="min-h-[60vh] flex flex-col p-8 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div className="max-w-4xl mx-auto w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">News Updates</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Stay up to date with the latest announcements, features, and updates from our platform.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : news.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-100 dark:border-slate-800 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 text-slate-400">
              <Newspaper className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No News Yet</h3>
            <p className="text-slate-500 dark:text-slate-400">
              Check back later for the latest updates.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {news.map((item) => (
              <div key={item._id} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col">
                <h3 className="font-bold text-2xl text-slate-900 dark:text-white mb-3">{item.title}</h3>
                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {new Date(item.createdAt).toLocaleDateString()}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
                  <span>{item.author}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
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
