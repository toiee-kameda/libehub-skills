# libehub-skills

リベハブ（Liberal Education Hub）の Claude Desktop App スキル集リポジトリ。Claude Code用ではなく、Claudeチャットで利用するスキルです。

## コマンド

```bash
bash scripts/build-skills.sh   # skills/ 以下を releases/*.skill にパッケージング
```

## ディレクトリ構成

```
skills/           # スキルのソースフォルダ（スキルごとに1フォルダ）
  <name>/
    SKILL.md      # スキル定義（フロントマター + 指示本文）
    references/   # 任意：実行時に読み込む参照ドキュメント
releases/         # ビルド済み .skill ファイル（zip形式、git管理）
resources/        # 静的アセット（PDF・HTML など）
scripts/          # ビルドスクリプト
```

## スキル開発

**SKILL.md フロントマター（必須フィールド）:**

```yaml
---
name: skill-name
description: トリガー説明（Claude が自動起動する条件を記述）
license: MIT
metadata:
  author: toieelab Kameda
  version: 1.0.0
  tags: [education, ai, ...]
---
```

**規約:**
- `references/` 内のファイルは SKILL.md の本文内で明示的に読み込む（自動ロードされない）
- スキル本文・説明文は日本語で記述
- `.skill` ファイルの実体は zip アーカイブ（`unzip foo.skill` で中身を確認できる）

**動作環境**
- Claude Code ではなく、Claude Desktop App です
- Claudeのチャットから呼び出すことを前提として作成する

## ビルドの仕組み

`build-skills.sh` は `skills/<name>/` の中身をフォルダ名なしで zip 圧縮し `releases/<name>.skill` として出力する。releases はコミットして GitHub に push し、raw URL 経由でユーザーがダウンロードできる。
