"use client";

import React, { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isWithinInterval, isBefore, startOfToday } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '../lib/utils';

interface CustomDateRangePickerProps {
    initialCheckIn?: string;
    initialCheckOut?: string;
    onSelect: (checkIn: string, checkOut: string) => void;
    onClose: () => void;
}

export function CustomDateRangePicker({ initialCheckIn, initialCheckOut, onSelect, onClose }: CustomDateRangePickerProps) {
    const [checkIn, setCheckIn] = useState<Date | null>(initialCheckIn ? new Date(initialCheckIn) : null);
    const [checkOut, setCheckOut] = useState<Date | null>(initialCheckOut ? new Date(initialCheckOut) : null);
    const [viewDate, setViewDate] = useState(new Date());
    const today = startOfToday();

    const handleDayClick = (day: Date) => {
        if (isBefore(day, today)) return;

        if (!checkIn || (checkIn && checkOut)) {
            setCheckIn(day);
            setCheckOut(null);
        } else if (checkIn && !checkOut) {
            if (isBefore(day, checkIn)) {
                setCheckIn(day);
            } else if (isSameDay(day, checkIn)) {
                setCheckIn(null);
            } else {
                setCheckOut(day);
                onSelect(checkIn.toISOString(), day.toISOString());
            }
        }
    };

    const renderCalendar = (date: Date) => {
        const start = startOfWeek(startOfMonth(date));
        const end = endOfWeek(endOfMonth(date));
        const days = eachDayOfInterval({ start, end });

        return (
            <div className="space-y-4">
                <div className="flex items-center justify-center px-2">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {format(date, 'MMMM yyyy')}
                    </h3>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                        <div key={d} className="text-[10px] font-bold text-slate-400 text-center py-1 uppercase">
                            {d}
                        </div>
                    ))}
                    {days.map((day, idx) => {
                        const isSelected = (checkIn && isSameDay(day, checkIn)) || (checkOut && isSameDay(day, checkOut));
                        const isInRange = checkIn && checkOut && isWithinInterval(day, { start: checkIn, end: checkOut });
                        const isCurrentMonth = isSameMonth(day, date);
                        const isPast = isBefore(day, today);
                        const isStart = checkIn && isSameDay(day, checkIn);
                        const isEnd = checkOut && isSameDay(day, checkOut);

                        return (
                            <button
                                key={idx}
                                type="button"
                                disabled={isPast || !isCurrentMonth}
                                onClick={() => handleDayClick(day)}
                                className={cn(
                                    "h-10 w-10 text-xs font-semibold rounded-full transition-all relative flex items-center justify-center",
                                    !isCurrentMonth && "opacity-0 pointer-events-none",
                                    isPast && "text-slate-300 dark:text-slate-700 cursor-not-allowed",
                                    !isPast && isCurrentMonth && "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200",
                                    isSelected && "bg-brand text-white hover:bg-brand ring-4 ring-brand/20",
                                    isInRange && !isSelected && "bg-brand/10 text-brand rounded-none"
                                )}
                            >
                                {format(day, 'd')}
                                {isStart && checkOut && <div className="absolute right-0 w-1/2 h-full bg-brand/10 -z-10" />}
                                {isEnd && checkIn && <div className="absolute left-0 w-1/2 h-full bg-brand/10 -z-10" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                <div className="p-6 sm:p-8 space-y-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Select Dates</h2>
                            <p className="text-sm text-slate-500 font-medium">Find availability for your stay</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="flex justify-center">
                        <div className="relative w-full max-w-[300px]">
                            <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="absolute -left-2 top-1 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white z-10">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="absolute -right-2 top-1 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white z-10">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            {renderCalendar(viewDate)}
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-6">
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-in</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Select date'}
                                </p>
                            </div>
                            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                            <div className="space-y-1">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Check-out</p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">
                                    {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Select date'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => checkIn && checkOut && onClose()}
                            disabled={!checkIn || !checkOut}
                            className="w-full sm:w-auto bg-brand hover:bg-brand-hover text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-brand/20 disabled:opacity-50 disabled:shadow-none active:scale-95"
                        >
                            Confirm Dates
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}