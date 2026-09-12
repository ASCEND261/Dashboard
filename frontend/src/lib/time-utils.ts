/**
 * IST (Indian Standard Time - UTC+5:30) Time Utilities & Real-Time Metrics
 * Provides authoritative live time calculations and session activity states.
 */

export interface ISTMetrics {
  timeStr: string;
  time12Str: string;
  dateStr: string;
  hour: number;
  phase: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
  greeting: string;
  statusLabel: string;
  statusSublabel: string;
}

export function getISTMetrics(): ISTMetrics {
  const now = new Date();

  // Extract IST hour, minutes, seconds using Intl.DateTimeFormat
  const istTimeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const ist12Formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const istDateFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const timeStr = istTimeFormatter.format(now);
  const time12Str = ist12Formatter.format(now);
  const dateStr = istDateFormatter.format(now);

  // Parse IST hour
  const hour = parseInt(timeStr.split(":")[0], 10);

  let phase: ISTMetrics["phase"] = "EVENING";
  let greeting = "Good evening";
  let statusLabel = "Evening Sprint Active";
  let statusSublabel = "High Throughput Verification Session";

  if (hour >= 5 && hour < 12) {
    phase = "MORNING";
    greeting = "Good morning";
    statusLabel = "Morning Standup & Submissions";
    statusSublabel = "Track Sprint Planning Phase";
  } else if (hour >= 12 && hour < 17) {
    phase = "AFTERNOON";
    greeting = "Good afternoon";
    statusLabel = "Afternoon Core Review";
    statusSublabel = "Active Queue Evaluation";
  } else if (hour >= 17 && hour < 22) {
    phase = "EVENING";
    greeting = "Good evening";
    statusLabel = "Evening Sprint Active";
    statusSublabel = "Peak Verification & Ledger Sync";
  } else {
    phase = "NIGHT";
    greeting = "Good night";
    statusLabel = "Overnight Ledger Consensus";
    statusSublabel = "Automated Dual-Entry Audit Cycle";
  }

  return {
    timeStr,
    time12Str,
    dateStr,
    hour,
    phase,
    greeting,
    statusLabel,
    statusSublabel,
  };
}

export function getISTGreeting(name?: string): string {
  const { greeting } = getISTMetrics();
  if (!name) return `${greeting}.`;
  const firstName = name.split(" ")[0];
  return `${greeting}, ${firstName}.`;
}
