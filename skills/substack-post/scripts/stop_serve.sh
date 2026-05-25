#!/bin/bash
# stop_serve.sh — build_and_serve.sh で起動したサーバを停止する
PIDFILE="/tmp/substack_serve.pid"
TOKENFILE="/tmp/substack_serve.token"
PORT=8765

if [ -f "$PIDFILE" ]; then
  kill -TERM "$(cat "$PIDFILE")" 2>/dev/null || true
fi
# 取りこぼし対策でポートも掃除
lsof -ti tcp:$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
rm -f "$PIDFILE" "$TOKENFILE"
echo "stopped"
