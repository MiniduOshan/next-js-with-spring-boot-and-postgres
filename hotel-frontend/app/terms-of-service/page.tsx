"use client";

import { FileText, ShieldAlert, Award, UserCheck, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function TermsOfService() {
  return (
    <div className="pt-28 pb-20 bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 uppercase tracking-wider mx-auto mb-2">
             <FileText className="w-3.5 h-3.5" /> Agreement & Rules
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Last Updated: June 21, 2026
          </p>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-100 dark:border-slate-850 shadow-xs space-y-8 text-slate-700 dark:text-slate-300 leading-relaxed text-sm">
          
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-500" /> 1. Contractual Relationship
            </h2>
            <p>
              These Terms of Service ("Terms") govern the access or use by you, an individual, of applications, websites, content, products, and services made available by YME Solutions Pvt Ltd.
            </p>
            <p>
              Please read these Terms carefully before accessing or using our services. Your access and use of the services constitutes your agreement to be bound by these Terms, which establishes a contractual relationship between you and YME Solutions. If you do not agree to these Terms, you may not access or use the services.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-500" /> 2. User Accounts
            </h2>
            <p>
              In order to use most aspects of the services, you must register for and maintain an active personal user services account ("Account"). Account registration requires you to submit certain personal information, such as your name, address, mobile phone number, and email.
            </p>
            <p>
              You are responsible for all activity that occurs under your Account, and you agree to maintain the security and secrecy of your Account username and password at all times.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-500" /> 3. Bookings & Hotel Partner Policies
            </h2>
            <p>
              When you make a booking through <strong>hotels.yme.lk</strong>, you enter into a direct, legally binding relationship with the hotel partner at which you book. From the point you make your reservation, we act solely as an intermediary between you and the hotel.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Cancellation and No-Shows:</strong> By making a reservation with a hotel, you accept and agree to the relevant cancellation and no-show policy of that hotel partner.</li>
              <li><strong>Pricing:</strong> All prices on our platform are displayed including/excluding taxes as clarified on the check-out screen. Please check room details thoroughly before reserving.</li>
              <li><strong>Hotel Rules:</strong> Guests are expected to abide by the individual property rules (e.g. check-in times, pets, smoking policies).</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-emerald-500" /> 4. Loyalty Program & Rewards
            </h2>
            <p>
              Our platform offers traveler points for completed bookings. These points are promotional, have no cash value, and are non-transferable. YME Solutions reserves the right to modify, cancel, or suspend the loyalty points system at any time without notice.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-500" /> 5. Limitation of Liability
            </h2>
            <p>
              YME Solutions Pvt Ltd shall not be liable for indirect, incidental, special, exemplary, punitive, or consequential damages, including lost profits, lost data, personal injury, or property damage related to, in connection with, or otherwise resulting from any use of the services or accommodations booked through our partners.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" /> 6. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Sri Lanka. Any disputes arising out of or in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Sri Lanka.
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
      <TermsOfService {...props} />
    </AppLayout>
  );
}
