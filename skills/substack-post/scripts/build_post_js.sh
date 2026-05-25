#!/bin/bash
# 使い方: build_post_js.sh <vars_file> [output_file]
#   vars_file   : 6つの const 宣言が入った JS ファイルのパス（BODY_MD は含まない）
#   output_file : 省略時は stdout に出力
#
# /tmp/body.md から本文を読み込み JSON エンコードして BODY_MD を生成する
#
# 生成物:
#   (async () => {
#     [vars_file の内容]
#     const BODY_MD = "...json encoded...";
#     [post_executor.js の内容]
#   })();

set -e

VARS_FILE="$1"
OUTPUT_FILE="${2:-}"
BODY_FILE="/tmp/body.md"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
EXECUTOR="$SCRIPT_DIR/../references/post_executor.js"

if [ -z "$VARS_FILE" ]; then
  echo "❌ 使い方: $0 <vars_file> [output_file]" >&2
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

BODY_MD_LINE=$(python3 -c "
import json
md = open('$BODY_FILE').read()
print('const BODY_MD = ' + json.dumps(md, ensure_ascii=False) + ';')
")

COMBINED=$(printf '(async () => {\n'; cat "$VARS_FILE"; printf '\n%s\n' "$BODY_MD_LINE"; cat "$EXECUTOR"; printf '\n})();')

if [ -n "$OUTPUT_FILE" ]; then
  echo "$COMBINED" > "$OUTPUT_FILE"
  echo "✅ 出力: $OUTPUT_FILE" >&2
else
  echo "$COMBINED"
fi
