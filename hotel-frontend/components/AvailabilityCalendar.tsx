"use client";

import { useState } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { format, differenceInCalendarDays, addDays, isBefore, startOfDay } from 'date-fns';
import { X, CalendarCheck, Info } from 'lucide-react';
import 'react-day-picker/style.css';

interface AvailabilityCalendarProps {
  onClose: () => void;
  onSelect: (checkIn: string, checkOut: string) => void;
  initialCheckIn?: string;
  initialCheckOut?: string;
  /** Optional set of ISO date strings (YYYY-MM-DD) that are fully booked */
  unavailableDates?: string[];
}

// Demo: generate some unavailable dates for realism
function getDemoUnavailableDates(): Date[] {
  const today = startOfDay(new Date());
  const dates: Date[] = [];
  // Scatter a few booked dates in the next 60 days
  const offsets = [3, 4, 7, 8, 14, 20, 21, 28, 35, 42, 43];
  for (const o of offsets) {
    dates.push(addDays(today, o));
  }
  return dates;
}

export function AvailabilityCalendar({
  onClose,
  onSelect,
  initialCheckIn,
  initialCheckOut,
  unavailableDates,
}: AvailabilityCalendarProps) {
  const today = startOfDay(new Date());

  const parseDate = (s?: string): Date | undefined => {
    if (!s) return undefined;
    const d = new Date(s);
    return isNaN(d.getTime()) ? undefined : startOfDay(d);
  };

  const [range, setRange] = useState<DateRange | undefined>(() => {
    const from = parseDate(initialCheckIn);
    const to = parseDate(initialCheckOut);
    if (from) return { from, to };
    return undefined;
  });

  const booked = unavailableDates
    ? unavailableDates.map((s) => startOfDay(new Date(s)))
    : getDemoUnavailableDates();

  const nights =
    range?.from && range?.to
      ? differenceInCalendarDays(range.to, range.from)
      : 0;

  const handleConfirm = () => {
    if (!range?.from || !range?.to) return;
    onSelect(
      format(range.from, 'yyyy-MM-dd'),
      format(range.to, 'yyyy-MM-dd')
    );
    onClose();
  };

  const disabledDays = [
    { before: today },
    ...booked.map((d) => ({ from: d, to: d })),
  ];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="font-bold text-slate-900 dark:text-white text-base">Check Availability</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/40 text-xs font-medium text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            Selected
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40 inline-block border border-emerald-300 dark:border-emerald-700" />
            Range
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-100 dark:bg-rose-900/30 inline-block border border-rose-200 dark:border-rose-800" />
            Unavailable
          </span>
        </div>

        {/* Calendar */}
        <div className="flex justify-center px-4 py-2">
          <DayPicker
            mode="range"
            selected={range}
            onSelect={setRange}
            disabled={disabledDays}
            numberOfMonths={1}
            showOutsideDays
            fixedWeeks
            modifiers={{ booked }}
            modifiersClassNames={{
              booked: 'rdp-day--booked',
            }}
            classNames={{
              root: 'rdp-root w-full',
            }}
          />
        </div>

        {/* Booked day style override via inline style tag */}
        <style>{`
          .rdp-day--booked .rdp-day_button {
            background-color: #fee2e2 !important;
            color: #b91c1c !important;
            text-decoration: line-through;
            cursor: not-allowed;
            border-radius: 9999px !important;
          }
          .dark .rdp-day--booked .rdp-day_button {
            background-color: rgba(185, 28, 28, 0.2) !important;
            color: #fca5a5 !important;
          }
          .rdp-root {
            --rdp-accent-color: #10b981;
            --rdp-accent-background-color: #d1fae5;
            width: 100%;
          }
          .dark .rdp-root {
            --rdp-accent-background-color: rgba(16, 185, 129, 0.15);
            --rdp-range_middle-background-color: rgba(16, 185, 129, 0.15);
            color: #e2e8f0;
          }
          .rdp-month_caption {
            font-weight: 700;
            font-size: 0.9rem;
          }
          .rdp-table, .rdp-month_grid {
            width: 100%;
          }
          .rdp-weekday {
            font-size: 0.7rem;
            font-weight: 600;
            color: #94a3b8;
          }
        `}</style>

        {/* Summary strip */}
        <div className="mx-6 mb-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 px-4 py-3 flex items-center gap-4 text-sm">
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Check-in</p>
            <p className="font-bold text-slate-900 dark:text-white">
              {range?.from ? format(range.from, 'EEE, MMM d') : '—'}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Check-out</p>
            <p className="font-bold text-slate-900 dark:text-white">
              {range?.to ? format(range.to, 'EEE, MMM d') : '—'}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
          <div className="text-center min-w-[48px]">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Nights</p>
            <p className="font-black text-emerald-600 dark:text-emerald-400 text-base">{nights > 0 ? nights : '—'}</p>
          </div>
        </div>

        {/* Info note */}
        {(!range?.from || !range?.to) && (
          <div className="mx-6 mb-4 flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-emerald-500" />
            <span>Click a start date, then an end date to select your stay.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!range?.from || !range?.to || nights < 1}
            className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed text-white font-bold text-sm transition-all active:scale-95 shadow-sm"
          >
            {range?.from && range?.to && nights >= 1
              ? `Confirm ${nights} Night${nights > 1 ? 's' : ''}`
              : 'Select Dates'}
          </button>
        </div>
      </div>
    </div>
  );
}
