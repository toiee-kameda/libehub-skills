#!/bin/bash
# build-skills.sh
# skills/ 以下の各フォルダを .skill ファイル（zip）に変換して releases/ に保存する

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
SKILLS_DIR="$REPO_ROOT/skills"
RELEASES_DIR="$REPO_ROOT/releases"

mkdir -p "$RELEASES_DIR"

echo "Building skills..."

for skill_path in "$SKILLS_DIR"/*/; do
  skill_name="$(basename "$skill_path")"
  output="$RELEASES_DIR/${skill_name}.skill"

  echo "  Packaging: $skill_name -> releases/${skill_name}.skill"

  # skill フォルダの中身を zip に固める（フォルダ名なしでルートに展開されるように）
  (cd "$skill_path" && zip -r --quiet "$output" .)
done

echo "Done. $(ls "$RELEASES_DIR"/*.skill 2>/dev/null | wc -l | tr -d ' ') skill(s) written to releases/"
