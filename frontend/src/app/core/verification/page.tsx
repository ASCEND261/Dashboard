"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

export default function CoreVerificationRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/core/queue");
  }, [router]);

  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <RefreshCw className="w-8 h-8 text-zinc-400 animate-spin mb-3" />
      <p className="text-xs text-[#8B8B9A] font-mono">Routing to Core Verification Queue...</p>
    </div>
  );
}
