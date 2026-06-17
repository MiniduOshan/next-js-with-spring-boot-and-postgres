"use client";

import React, { useState, useEffect } from 'react';
import { Trophy, Star, Gift, History, Award, Zap } from 'lucide-react';
import { useAuth } from "@/components/AuthContext";
import { toast } from 'sonner';

export default function UserRewards() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<any>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [leaderboardPos, setLeaderboardPos] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      fetchData();
    }
  }, [user?.email]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch summary and logs
      const summaryRes = await fetch(`/api/loyalty/summary/${user?.email}`);
      if (summaryRes.ok) {
        const data = await summaryRes.json();
        setSummary(data.summary);
        setLogs(data.logs);
      }
      
      // Fetch leaderboard position
      const lbRes = await fetch("/api/loyalty/leaderboard");
      if (lbRes.ok) {
        const lbData = await lbRes.json();
        const index = lbData.findIndex((l: any) => l.user_id === user?.email);
        if (index !== -1) setLeaderboardPos(index + 1);
      }
    } catch (err) {
      toast.error("Failed to load rewards data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading Rewards Data...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Gift className="w-5 h-5 text-brand fill-brand" /> My Rewards & Points
          </h2>
          <p className="text-sm text-slate-500 mt-1">Track your points, view history, and climb the leaderboard.</p>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <Star className="absolute -right-4 -bottom-4 w-24 h-24 text-white/10" />
          <h3 className="text-amber-100 font-bold text-sm uppercase tracking-wider mb-2">Available Points</h3>
          <p className="text-4xl font-extrabold">{summary?.available_points || 0}</p>
          <p className="text-amber-100/80 text-xs mt-2">Use points to claim discounts on bookings!</p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
              <Award className="w-4 h-4 text-blue-500" />
            </div>
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Lifetime Earned</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{summary?.total_points || 0} pts</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
              <Trophy className="w-4 h-4 text-brand" />
            </div>
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Leaderboard</h3>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {leaderboardPos ? `#${leaderboardPos}` : 'Unranked'}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-6">
              <History className="w-5 h-5 text-slate-400" />
              <h3 className="font-extrabold text-slate-900 dark:text-white">Recent Point Activity</h3>
            </div>
            
            {logs.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Zap className="w-8 h-8 mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-sm">No activities yet</p>
                <p className="text-xs">Start booking and reviewing to earn points!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-slate-50 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-200">{log.remarks}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(log.awarded_at).toLocaleString()}</p>
                    </div>
                    <div className={`font-extrabold ${log.points_awarded > 0 ? 'text-green-500' : 'text-slate-500'}`}>
                      {log.points_awarded > 0 ? '+' : ''}{log.points_awarded}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-brand/5 to-purple-500/5 rounded-2xl border border-brand/20 p-6">
            <h3 className="font-extrabold text-brand mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Upcoming Rewards
            </h3>
            <div className="space-y-4">
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-brand/10">
                <h4 className="font-bold text-sm">10% Off Next Booking</h4>
                <p className="text-xs text-slate-500 mt-1">Cost: 1,000 Points</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3">
                  <div 
                    className="bg-brand h-2 rounded-full" 
                    style={{ width: `${Math.min(100, ((summary?.available_points||0)/1000)*100)}%` }} 
                  />
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-brand/10">
                <h4 className="font-bold text-sm">Free Dinner Upgrade</h4>
                <p className="text-xs text-slate-500 mt-1">Cost: 2,500 Points</p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-3">
                  <div 
                    className="bg-brand h-2 rounded-full" 
                    style={{ width: `${Math.min(100, ((summary?.available_points||0)/2500)*100)}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
