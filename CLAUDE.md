# libehub-skills

リベハブ（Liberal Education Hub）の Claude Desktop App スキル集リポジトリ。Claude Code用ではなく、Claudeチャットで利用するスキルです。

## コマンド

```bash
bash scripts/build-skills.sh   # skills/ 以下を releases/*.skill にパッケージング
```

## 初回セットアップ

clone後に一度だけ実行し、Git hooks を有効化する（`skills/` 変更時に `releases/` の再ビルド忘れを自動防止）：

```bash
git config core.hooksPath .githooks
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
- 主な想定は Claude Desktop App のチャットから呼び出すこと。この前提で書く
- ただし Claude Code（プラグイン経由）でも実行されうる。**チャットにしか無い前提（Artifact が唯一の確認手段である等）で書き切らない**
- 環境によって手順が変わる場合は、ツール名ではなく**できること**で分岐させる（例: 「ブラウザを操作できるツールがあるか」）。ツール名は変わるが、できることは変わらない
- **例外: `one-page-site-builder` は Claude Code（デスクトップの Code タブ）前提。** ローカルサーバーを起動してブラウザで検証することが品質の前提なので、チャット向けの分岐を持たない。チャット互換に「戻す」修正を入れないこと（`releases/one-page-site-builder.skill` もチャットでは検証手順が実行できない）

## ビルドの仕組み

`build-skills.sh` は `skills/<name>/` の中身をフォルダ名なしで zip 圧縮し `releases/<name>.skill` として出力する。releases はコミットして GitHub に push し、raw URL 経由でユーザーがダウンロードできる。
