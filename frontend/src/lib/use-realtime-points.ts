"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "./api";

export interface RealtimePointsData {
  teamScore: number;
  teamRank: number;
  totalMembers: number;
  totalSubmissions: number;
  verifiedCount: number;
  recentLedger: any[];
  lastUpdated: Date;
  hasScoreIncreased: boolean;
  scoreDelta: number;
  progressData: any;
  submissions: any[];
  leaderboard: any;
}

export function useRealtimePoints(intervalMs: number = 3500) {
  const [data, setData] = useState<RealtimePointsData>({
    teamScore: 0,
    teamRank: 1,
    totalMembers: 1,
    totalSubmissions: 0,
    verifiedCount: 0,
    recentLedger: [],
    lastUpdated: new Date(),
    hasScoreIncreased: false,
    scoreDelta: 0,
    progressData: null,
    submissions: [],
    leaderboard: null,
  });

  const [loading, setLoading] = useState(true);
  const prevScoreRef = useRef<number>(0);

  const fetchLatest = useCallback(async () => {
    try {
      const [progress, subs, leaderboard] = await Promise.all([
        api.getTeamProgress().catch(() => null),
        api.getMySubmissions().catch(() => []),
        api.getLeaderboard().catch(() => null),
      ]);

      let newScore = prevScoreRef.current;
      let newRank = 2;

      if (progress && typeof progress.total_points === "number") {
        newScore = progress.total_points;
      } else if (leaderboard && Array.isArray(leaderboard.standings)) {
        const myTeam = leaderboard.standings.find(
          (s: any) => s.team_id === "ASCEND" || s.team_name?.toLowerCase().includes("ascend")
        );
        if (myTeam) {
          newScore = myTeam.total_points;
          newRank = myTeam.rank;
        }
      }

      const scoreDelta = newScore - prevScoreRef.current;
      const hasIncreased = scoreDelta > 0;
      prevScoreRef.current = newScore;

      const verified = Array.isArray(subs) ? subs.filter((s: any) => s.status === "VERIFIED").length : 0;

      setData({
        teamScore: newScore,
        teamRank: newRank,
        totalMembers: progress?.member_count || 4,
        totalSubmissions: Array.isArray(subs) ? subs.length : 0,
        verifiedCount: verified,
        recentLedger: progress?.recent_ledger || [],
        lastUpdated: new Date(),
        hasScoreIncreased: hasIncreased,
        scoreDelta,
        progressData: progress,
        submissions: Array.isArray(subs) ? subs : [],
        leaderboard,
      });
    } catch (err) {
      console.warn("Realtime points sync tick failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLatest();

    const interval = setInterval(() => {
      // Pause polling if the tab is backgrounded to save mobile battery
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        return;
      }
      fetchLatest();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [fetchLatest, intervalMs]);

  return {
    ...data,
    refreshNow: fetchLatest,
    loading,
  };
}
