"use client";

import { Shield, Eye, Lock, FileText, Globe } from 'lucide-react';
import Link from 'next/link';

function PrivacyPolicy() {
  return (
    <div className="pt-28 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 uppercase tracking-wider mx-auto mb-2">
             <Shield className="w-3.5 h-3.5" /> Privacy & Protection
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last Updated: June 21, 2026
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-850 shadow-xs space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" /> 1. Introduction
            </h2>
            <p>
              Welcome to <strong>hotels.yme.lk</strong>, operated by YME Solutions Pvt Ltd. We respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our hotel booking services in Sri Lanka.
            </p>
            <p>
              By accessing or using our services, you consent to the collection, transfer, manipulation, storage, disclosure, and other uses of your information as described in this Privacy Policy.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-emerald-500" /> 2. Information We Collect
            </h2>
            <p>
              We collect information that you provide directly to us when using our platform:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Personal Identifiable Information:</strong> Name, email address, phone number, and mailing address when registering or booking a hotel.</li>
              <li><strong>Booking Details:</strong> Stay dates, room choices, guest numbers, special requests, and companion details.</li>
              <li><strong>Payment Data:</strong> Financial details processed securely via our payment gateways (we do not store raw card numbers on our servers).</li>
              <li><strong>Partnership Data:</strong> Business registration numbers, property license numbers, bank details, and identification files for hotel owners and staffs.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" /> 3. How We Use Your Information
            </h2>
            <p>
              We use the collected information for various purposes:
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>To facilitate and manage your hotel reservations and bookings.</li>
              <li>To register and administer traveler and partner accounts.</li>
              <li>To provide customer support and send notification alerts regarding bookings.</li>
              <li>To process payments and prevent fraudulent transactions.</li>
              <li>To credit loyalty points and manage reward redemptions.</li>
              <li>To improve our platform, customize your experience, and send promotional materials (with your consent).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-emerald-500" /> 4. Data Security
            </h2>
            <p>
              We implement industry-standard administrative, technical, and physical security measures designed to protect your personal data. We utilize SSL encryption for all transaction transmissions and secure cloud database servers to house data. However, please remember that no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-500" /> 5. Sharing of Information
            </h2>
            <p>
              We share booking data with the respective hotels you book with to ensure your reservation is fulfilled. We do not sell your personal data to third parties. We may disclose data when legally required to do so by Sri Lankan law or law enforcement authorities.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" /> 6. Contact Us
            </h2>
            <p>
              If you have any questions or feedback regarding this Privacy Policy, please contact us at:
            </p>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 mt-2">
              <p className="font-semibold text-slate-900 dark:text-white">YME solutions Pvt Ltd</p>
              <p>Nugegoda, Sri Lanka</p>
              <p>Phone: 070 695 5000</p>
              <p>Email: support@yme.lk</p>
            </div>
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
      <PrivacyPolicy {...props} />
    </AppLayout>
  );
}
