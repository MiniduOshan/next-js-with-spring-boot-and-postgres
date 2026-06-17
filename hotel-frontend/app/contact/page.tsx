"use client";

import { Building2, MapPin, Phone, Mail, Clock, MessageSquare, Send, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from "@/lib/utils";

function Contact() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    { q: "How do I make a reservation?", a: "To make a reservation, simply search for your preferred destination and dates, choose a hotel, and complete the booking process using our secure checkout." },
    { q: "Is it free to use hotel.yme.lk?", a: "Yes, our platform is completely free for guests to use. All reservations are sent directly to our partners with zero platform fees." },
    { q: "How does the cancellation policy work?", a: "Cancellation policies vary by property and room type. You can find the specific cancellation terms on each hotel's details page during booking details confirmation." },
    { q: "Can I book a stay for a large group?", a: "Yes, you can specify the number of guests and room quantities during the reservation form process." },
    { q: "Do I need to pay online?", a: "No, there is no online payment processing on our website. You can place a secure reservation request and settle any payments directly with the property operator on arrival." },
  ];

  return (
    <div className="pt-24 pb-20 bg-slate-50 dark:bg-slate-800/50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 max-w-2xl mx-auto text-center">
          <div className="bg-brand/10 text-brand px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 uppercase tracking-wider mb-4">
            <MessageSquare className="w-3.5 h-3.5" /> Support
          </div>
          <h1 className="text-base md:text-lg font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            Get in Touch
          </h1>
          <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            Have questions about booking a stay? Need help with an existing reservation? We're here to ensure your Sri Lankan travel experience is perfect.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {/* Left Column - Contact Info */}
          <div className="flex flex-col gap-6 h-full">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 text-brand">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Head Office</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">YME solutions Pvt Ltd,<br />Nugegoda, Sri Lanka</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 text-brand">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Phone</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">070 695 5000</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 text-brand">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Email</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">support@yme.lk</p>
                  </div>
                </div>

                <div className="h-px bg-slate-100 my-4"></div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 text-slate-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Business Hours</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Mon - Fri: 9:00 AM - 6:00 PM<br />Sat: 9:00 AM - 1:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-slate-200 flex-1 min-h-[250px] rounded-2xl overflow-hidden relative shadow-sm border border-slate-100 dark:border-slate-800">
              {/* Replace with actual map integration if needed */}
              <div className="absolute inset-0 opacity-40 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=6.8649,79.8997&zoom=13&size=600x400&maptype=roadmap&style=element:geometry%7Ccolor:0xf5f5f5&style=element:labels.icon%7Cvisibility:off&style=element:labels.text.fill%7Ccolor:0x616161&style=element:labels.text.stroke%7Ccolor:0xf5f5f5&style=feature:administrative.land_parcel%7Celement:labels.text.fill%7Ccolor:0xbdbdbd&style=feature:poi%7Celement:geometry%7Ccolor:0xeeeeee&style=feature:poi%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:poi.park%7Celement:geometry%7Ccolor:0xe5e5e5&style=feature:poi.park%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:road%7Celement:geometry%7Ccolor:0xffffff&style=feature:road.arterial%7Celement:labels.text.fill%7Ccolor:0x757575&style=feature:road.highway%7Celement:geometry%7Ccolor:0xdadada&style=feature:road.highway%7Celement:labels.text.fill%7Ccolor:0x616161&style=feature:road.local%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&style=feature:transit.line%7Celement:geometry%7Ccolor:0xe5e5e5&style=feature:transit.station%7Celement:geometry%7Ccolor:0xeeeeee&style=feature:water%7Celement:geometry%7Ccolor:0xc9c9c9&style=feature:water%7Celement:labels.text.fill%7Ccolor:0x9e9e9e&key=YOUR_API_KEY')] bg-cover bg-center mix-blend-multiply"></div>

              <div className="absolute inset-0 bg-slate-300/30 flex items-center justify-center">
                <div className="bg-white dark:bg-slate-900 px-4 py-2 rounded-full shadow-md text-sm font-medium text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand" /> View on Google Maps
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="lg:col-span-2 h-full">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 h-full flex flex-col">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-brand text-white rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Send us a Message</h3>
              </div>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand disabled:bg-slate-50 dark:bg-slate-800/50 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-900 dark:text-white">Email Address</label>
                    <input type="email" placeholder="john@example.com" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">Subject</label>
                  <select className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors appearance-none bg-white dark:bg-slate-900">
                    <option>General Inquiry</option>
                    <option>Booking Issue</option>
                    <option>Cancellation Request</option>
                    <option>Payment Support</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900 dark:text-white">Message</label>
                  <textarea rows={5} placeholder="How can we help you today?" className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors resize-none"></textarea>
                </div>

                <button className="bg-brand hover:bg-brand-hover text-white px-6 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2">
                  Send Message <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="max-w-3xl mx-auto pt-10">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border text-left border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden transition-all duration-200 shadow-sm"
              >
                <button
                  className="w-full px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-900 text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{faq.q}</span>
                  <ChevronDown className={cn("w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-200", openFaq === index && "transform rotate-180")} />
                </button>

                <div
                  className={cn(
                    "px-6 text-slate-600 dark:text-slate-400 text-sm leading-relaxed overflow-hidden transition-all duration-300 ease-in-out",
                    openFaq === index ? "pb-4 max-h-40 opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  {faq.a}
                </div>
              </div>
            ))}
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
      <Contact {...props} />
    </AppLayout>
  );
}
