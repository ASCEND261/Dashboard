"use client";

import { useEffect } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function BackendKeepAlive() {
  useEffect(() => {
    const pingBackend = async () => {
      try {
        // Ping health endpoint to keep server hot and active
        const url = API_BASE.replace(/\/api\/?$/, "") + "/health";
        await fetch(url, { method: "GET", cache: "no-store", mode: "cors" });
      } catch {
        // Silently fail if offline
      }
    };

    // Initial ping
    pingBackend();

    // Ping every 10 seconds
    const interval = setInterval(pingBackend, 10000);

    return () => clearInterval(interval);
  }, []);

  return null;
}
