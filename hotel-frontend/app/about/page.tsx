"use client";

import { Building2, Target, Eye, CheckCircle2, Search, CalendarDays, LineChart, MapPin, ShieldCheck, ArrowRight, Star } from 'lucide-react';
import { useRouter, usePathname, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";;

function About() {
  return (
    <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-800/50 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 uppercase tracking-wider mx-auto mb-4">
             <Building2 className="w-3.5 h-3.5" /> Our Story
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            About hotel.yme.lk
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover and book the finest hotels, resorts, and villas across Sri Lanka. We're building the trusted platform for unforgettable stays and seamless booking experiences.
          </p>
        </div>

        {/* Mission & Vision */}
        <div className="grid md:grid-cols-2 gap-6 mb-20">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Our Mission</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              To simplify travel across Sri Lanka by connecting guests with the perfect accommodations. We want to make it effortless for travelers to discover, evaluate, and book exceptional stays while supporting local hospitality businesses.
            </p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-start text-left">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">Our Vision</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
              To become Sri Lanka's leading and most trusted hotel booking platform, where quality, transparency, and seamless experiences come first. We envision a future where booking a stay is as delightful as the vacation itself.
            </p>
          </div>
        </div>

        {/* Why Choose Section */}
        <div className="text-center mb-12">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Why Choose hotel.yme.lk?</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            We provide a specialized platform designed to bring you the best hospitality Sri Lanka has to offer.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {[
            {
              icon: <CheckCircle2 className="w-5 h-5" />,
              title: "Verified Properties",
              desc: "Every hotel and resort on our platform is manually verified to ensure authenticity, quality, and a safe stay for our guests."
            },
            {
              icon: <Search className="w-5 h-5" />,
              title: "Smart Search",
              desc: "Find the perfect accommodation with our powerful search that supports filters for amenities, locations, categories, and price ranges."
            },
            {
              icon: <CalendarDays className="w-5 h-5" />,
              title: "Instant Booking",
              desc: "Secure your room instantly with our real-time availability sync. No waiting, no double bookings, just instant confirmation."
            },
            {
              icon: <Star className="w-5 h-5" />,
              title: "Best Rates Guarantee",
              desc: "We work closely with our hotel partners to ensure you get the most competitive rates and exclusive deals available online."
            },
            {
              icon: <MapPin className="w-5 h-5" />,
              title: "Local Expertise",
              desc: "Built specifically for Sri Lanka. We understand local destinations better and provide curated recommendations for your trip."
            },
            {
              icon: <ShieldCheck className="w-5 h-5" />,
              title: "Trust & Transparency",
              desc: "Genuine guest reviews, clear pricing with no hidden fees, and transparent property information help you make confident decisions."
            }
          ].map((feature, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800/50 text-brand rounded-lg flex items-center justify-center mb-4">
                {feature.icon}
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-[#f2fbf7] rounded-3xl p-10 sm:p-14 text-center border border-brand/10">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Ready to Plan Your Next Trip?</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            Join thousands of travelers who have found their perfect stay on hotel.yme.lk. Explore our curated collections and book your ideal getaway today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
             <Link href="/search" className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2">
               Find a Hotel <Search className="w-4 h-4" />
             </Link>
             <Link href="/contact" className="w-full sm:w-auto bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-8 py-3 rounded-full font-medium transition-colors flex items-center justify-center">
               Contact Us
             </Link>
          </div>
        </div>

      </div>
    </div>
  );
}


import AppLayout from "@/components/layout/AppLayout";
export default function PageWrapper(props: any) {
  return (
    <AppLayout>
      <About {...props} />
    </AppLayout>
  );
}
