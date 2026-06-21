"use client";

import { Cookie, Settings, ShieldCheck, HelpCircle, Info } from 'lucide-react';
import Link from 'next/link';

function CookiesPage() {
  return (
    <div className="pt-28 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 uppercase tracking-wider mx-auto mb-2">
             <Cookie className="w-3.5 h-3.5" /> Cookies & Tracking
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Cookie Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last Updated: June 21, 2026
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-850 shadow-xs space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Info className="w-5 h-5 text-emerald-500" /> 1. What Are Cookies?
            </h2>
            <p>
              Cookies are small text files stored on your computer or mobile device when you visit a website. They are widely used to make websites work or work more efficiently, as well as to provide information to the owners of the site.
            </p>
            <p>
              We also use browser local storage and session storage to provide a seamless state retention experience, such as storing your active login session or selected visual theme.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-500" /> 2. How We Use Cookies
            </h2>
            <p>
              We use cookies and local storage technology for the following purposes:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Essential Cookies:</strong> Essential for authentication, session handling, and securing your dashboard. Without these, you will not be able to log in or book accommodations.
              </li>
              <li>
                <strong>Preference Cookies:</strong> Used to remember choices you make, such as your preferred website color theme (light or dark mode) and page settings.
              </li>
              <li>
                <strong>Analytical Cookies:</strong> Help us understand how visitors interact with our platform by collecting anonymous usage statistics. This lets us continuously optimize page layout and features.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" /> 3. Managing Your Cookies
            </h2>
            <p>
              Most web browsers allow you to control cookies through their settings preferences. You can configure your browser to block cookies or alert you when cookies are being sent.
            </p>
            <p>
              Please note that blocking or deleting essential cookies will prevent you from logging in, checking out, or using key features of <strong>hotels.yme.lk</strong>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-emerald-500" /> 4. More Information
            </h2>
            <p>
              If you require any further information regarding our cookie usage, please reach out to us at <span className="font-semibold text-slate-900 dark:text-white">support@yme.lk</span>.
            </p>
          </section>

        </div>

        {/* Bottom Navigation Back */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-sm font-semibold text-brand hover:underline">
            &larr; Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}

import AppLayout from "@/components/layout/AppLayout";
export default function PageWrapper(props: any) {
  return (
    <AppLayout>
      <CookiesPage {...props} />
    </AppLayout>
  );
}
