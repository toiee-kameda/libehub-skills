#!/bin/bash
# build_and_serve.sh <vars_file>
#   vars_file : 6つの const 宣言が入った JS ファイル（BODY_MD は含まない）
#
# やること:
#   1. /tmp/body.md を JSON エンコードして BODY_MD を生成
#   2. (async () => { vars + BODY_MD + post_executor.js })(); を /tmp/substack_post.js に出力
#   3. ポート 8765 を解放し、ランダムトークンで serve.py を background 起動
#   4. ヘルスチェック後、成功なら "READY <url>" を stdout に出力（Claude がこの URL を使う）
set -e

VARS_FILE="$1"
BODY_FILE="/tmp/body.md"
OUT="/tmp/substack_post.js"
PORT=8765
PIDFILE="/tmp/substack_serve.pid"
TOKENFILE="/tmp/substack_serve.token"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXECUTOR="$SCRIPT_DIR/../references/post_executor.js"

if [ -z "$VARS_FILE" ]; then
  echo "❌ 使い方: $0 <vars_file>" >&2
  exit 1
fi
if [ ! -f "$VARS_FILE" ]; then
  echo "❌ vars_file が見つかりません: $VARS_FILE" >&2
  exit 1
fi
if [ ! -f "$BODY_FILE" ]; then
  echo "❌ 本文ファイルが見つかりません: $BODY_FILE" >&2
  exit 1
fi
if [ ! -f "$EXECUTOR" ]; then
  echo "❌ post_executor.js が見つかりません: $EXECUTOR" >&2
  exit 1
fi

# 1. 本文を JSON エンコード（日本語を保持）
BODY_MD_LINE=$(python3 -c "
import json
md = open('$BODY_FILE').read()
print('const BODY_MD = ' + json.dumps(md, ensure_ascii=False) + ';')
")

# 2. IIFE 形式で結合
{
  printf '(async () => {\n'
  cat "$VARS_FILE"
  printf '\n%s\n' "$BODY_MD_LINE"
  cat "$EXECUTOR"
  printf '\n})();'
} > "$OUT"

# 3. 古いサーバを掃除（pidfile は信用せず実ポートを掃除）
lsof -ti tcp:$PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
rm -f "$PIDFILE" "$TOKENFILE"

TOKEN=$(python3 -c "import secrets; print(secrets.token_hex(16))")
echo "$TOKEN" > "$TOKENFILE"

nohup python3 "$SCRIPT_DIR/serve.py" "$OUT" "$TOKEN" "$PORT" >/dev/null 2>&1 &
echo $! > "$PIDFILE"

# 4. ヘルスチェック（最大 2 秒・200ms 間隔）
for _ in 1 2 3 4 5 6 7 8 9 10; do
  if curl -fsS --max-time 2 "http://127.0.0.1:$PORT/ping" >/dev/null 2>&1; then
    echo "READY http://127.0.0.1:$PORT/post-$TOKEN.js"
    exit 0
  fi
  sleep 0.2
done

echo "❌ サーバの起動に失敗しました" >&2
exit 1
