"use client";

import React, { useEffect, useState } from 'react';
import { Check, Zap, Shield, Crown, Loader2 } from 'lucide-react';

interface SystemPackage {
  _id: string;
  name: string;
  price: string;
  hotels: string;
  features: string[];
  status: string;
}

function PricingSection() {
  const [packages, setPackages] = useState<SystemPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch('/api/system-packages');
        if (res.ok) {
          const data = await res.json();
          // Only show active packages
          setPackages(data.filter((p: SystemPackage) => p.status === 'Active'));
        }
      } catch (err) {
        console.error("Failed to load pricing plans", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, []);

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'premium': return <Crown className="w-6 h-6 text-amber-500" />;
      case 'pro': return <Zap className="w-6 h-6 text-brand" />;
      default: return <Shield className="w-6 h-6 text-slate-400" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4 text-brand" />
        <p className="font-medium text-sm">Loading membership plans...</p>
      </div>
    );
  }

  return (
    <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider mb-6">
            <Zap className="w-3.5 h-3.5" /> Membership Plans
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight">
            Scale your hospitality business
          </h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg leading-relaxed">
            Join over 500+ properties in Sri Lanka. Sign up today and get <span className="text-brand font-bold underline">Premium for 1 Year</span> as part of our launch celebration!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-stretch">
          {packages.map((pkg) => (
            <div
              key={pkg._id}
              className={`relative p-8 rounded-[2rem] border transition-all duration-500 hover:shadow-2xl group ${pkg.name.toLowerCase() === 'premium'
                ? 'border-brand ring-4 ring-brand/5 bg-brand/[0.02]'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                } flex flex-col h-[760px]`}
            >
              <div className="flex items-center gap-4 mb-8">
                <div className={`p-4 rounded-2xl transition-transform duration-500 group-hover:scale-110 ${pkg.name.toLowerCase() === 'premium' ? 'bg-amber-100 dark:bg-amber-900/30' :
                  pkg.name.toLowerCase() === 'pro' ? 'bg-brand/10' : 'bg-slate-100 dark:bg-slate-800'
                  }`}>
                  {getIcon(pkg.name)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{pkg.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">For up to {pkg.hotels} {parseInt(pkg.hotels) === 1 ? 'Hotel' : 'Hotels'}</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{pkg.price.split(' ')[0]}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-semibold">{pkg.price.split(' ').slice(1).join(' ')}</span>
                </div>
              </div>

              <ul className="space-y-4 mb-10 flex-1 min-h-[320px]">
                {pkg.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-[15px] text-slate-600 dark:text-slate-300">
                    <div className="mt-1 bg-emerald-100 dark:bg-emerald-900/30 p-0.5 rounded-full">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-auto w-full py-4 rounded-2xl font-bold transition-all duration-300 transform active:scale-95 ${pkg.name.toLowerCase() === 'premium'
                    ? 'bg-brand text-white hover:bg-brand-hover shadow-xl shadow-brand/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                Get Started Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

import DashboardLayout from "@/components/layout/DashboardLayout";
export default function PageWrapper(props: any) {
  return (
    <DashboardLayout>
      <PricingSection {...props} />
    </DashboardLayout>
  );
}
