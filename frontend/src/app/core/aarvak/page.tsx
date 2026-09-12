"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AarvakIntegrationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/members");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-xs font-mono text-zinc-400 animate-pulse">
        Redirecting to Members Leaderboard...
      </div>
    </div>
  );
}
