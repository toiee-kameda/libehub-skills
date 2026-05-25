#!/bin/bash
# 使い方: build_post_js.sh <vars_file> [output_file]
#   vars_file   : 7つの const 宣言が入った JS ファイルのパス
#   output_file : 省略時は stdout に出力
#
# 生成物:
#   (async () => {
#     [vars_file の内容]
#     [post_executor.js の内容]
#   })();

set -e

VARS_FILE="$1"
OUTPUT_FILE="${2:-}"
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

if [ ! -f "$EXECUTOR" ]; then
  echo "❌ post_executor.js が見つかりません: $EXECUTOR" >&2
  exit 1
fi

COMBINED=$(printf '(async () => {\n'; cat "$VARS_FILE"; printf '\n'; cat "$EXECUTOR"; printf '\n})();')

if [ -n "$OUTPUT_FILE" ]; then
  echo "$COMBINED" > "$OUTPUT_FILE"
  echo "✅ 出力: $OUTPUT_FILE" >&2
else
  echo "$COMBINED"
fi
