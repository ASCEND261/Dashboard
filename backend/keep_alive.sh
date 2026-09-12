#!/usr/bin/env bash
# ASCEND Backend Keep-Alive Daemon
# Pings the backend health endpoint every 10 seconds to prevent cold starts / idle timeouts.

HEALTH_URL="https://repeated-admitted-divorce-instrumental.trycloudflare.com/health"
LOG_FILE="/Users/yogayjain/ascend/scratch/keep_alive.log"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting ASCEND 10-second Keep-Alive Daemon for: $HEALTH_URL" >> "$LOG_FILE"

while true; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$HEALTH_URL" 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 🟢 Keep-Alive Ping Successful (HTTP 200) -> Backend Active" >> "$LOG_FILE"
    else
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] ⚠️ Keep-Alive Ping Warning (HTTP $HTTP_CODE)" >> "$LOG_FILE"
    fi
    # Keep only last 100 lines of log to avoid file bloat
    tail -n 100 "$LOG_FILE" > "${LOG_FILE}.tmp" 2>/dev/null && mv "${LOG_FILE}.tmp" "$LOG_FILE"
    sleep 10
done
