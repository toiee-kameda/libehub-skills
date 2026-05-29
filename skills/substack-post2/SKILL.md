---
name: substack-post2
description: Claudeが生成したMarkdown文章をSubstackに下書き投稿するスキル。「Substackに投稿して」「下書きにして」「Substackの記事にして」「このMarkdownをSubstackへ」などの依頼、またはMDファイルを添付した上で、投稿指示があった場合に必ず使用する。Substackへの投稿・入稿・記事作成・下書き保存が話題になったら必ずこのスキルを使うこと。
license: MIT
metadata:
  author: toieelab Kameda
  version: 1.0.0
  tags: [substack, publishing, automation, markdown, newsletter, playwright]
---

# Substack 下書き投稿スキル（Playwright版）

会話内で生成した文章や添付MDファイルをSubstack内部APIへ直接POSTして下書き保存する。Playwright MCPのログイン状態（`storage-state.json`）を自動利用するため、**セッショントークンの手動設定・更新は一切不要**。

## 設計思想

- **Playwright MCP を使う**：`browser_navigate` + `browser_evaluate` のみ使用
- **Substack 内部 API（`/api/v1/drafts`）に直接POST**：ブラウザのクッキーが自動付与されるため認証ヘッダー不要
- **userId は JWT から自動取得**：設定ファイルへの手書きが不要
- **セッショントークンの手動管理ゼロ**：`storage-state.json` が有効な限り常に動作
- `computer` ツール・`javascript_tool`・`bash_tool` は**使わない**
- タグ設定は自動化せず、完了後に候補を提示する

### 全体フロー概要

| フェーズ | 内容 |
|---|---|
| フェーズ 1 | 投稿コンテンツ（本文Markdown）を取得する |
| フェーズ 2 | 不足フィールドをユーザーに確認する |
| フェーズ 3 | 「おまかせ」項目とSEO説明文を自動生成する |
| フェーズ 4 | Substackへナビゲート → 内部APIで下書き作成 |
| フェーズ 5 | 完了をリンクで報告し、タグ候補を提示する |

---

## 前提条件

- Playwright MCPがClaude Desktopに設定済み
- `playwright browser_navigate` / `playwright browser_evaluate` ツールが利用可能
- Playwrightで `https://ccwm.substack.com` にログイン済み（`storage-state.json` に保存済み）
- セッショントークンの手動設定・更新は**不要**

---

## フェーズ 1：コンテンツを受け取る

| 種類 | 取得方法 |
|---|---|
| 会話内で生成した文章 | 直前のアシスタント出力をMarkdownとして使用。あるいは、生成されたmdファイル |
| 添付Markdownファイル | ファイル内容を読み込んでMarkdownとして使用 |

本文が取得できない場合は、ユーザーに確認してから進む。

---

## フェーズ 2：不足フィールドの確認・質問

1. 会話内ですでに決まっている項目は質問しない
2. 不足している項目のみ `ask_user_input_v0` でまとめて質問する
3. **各質問の最初の選択肢は必ず「おまかせ」**
4. SEO説明文は常に自動生成するため質問しない
5. タグは質問しない（完了後に候補提示）

### 質問フィールドと選択肢・生成ルール

| 項目 | 選択肢 | おまかせ時の生成ルール |
|---|---|---|
| タイトル（必須） | おまかせ（Claudeが生成） / 指定する | 本文の主題を端的に表す10〜30文字 |
| サブタイトル（任意） | おまかせ（生成する） / 指定する / なし | 本文の要旨を1〜2文で表現 |
| セクション（任意） | おまかせ（リベハブ） / リベハブ / お知らせ / なし | 「リベハブ」を使用 |
| URLスラッグ（任意） | おまかせ（英語で自動生成） / 指定する | タイトルの意味を英訳しハイフン区切り（例: `claude-substack-auto-post`） |
| SEOタイトル（任意） | おまかせ（タイトルと同じ） / 指定する | タイトルと同じ文字列 |

---

## フェーズ 3：おまかせ項目・SEO説明文の生成

「おまかせ」を選んだ項目を上記の生成ルールに従って本文から生成する。

### SEO説明文（常に自動生成・質問なし）

> Substackは記事冒頭の文章をSEO説明文に自動入力するが内容が不適切なため、**必ず上書き生成する。**

生成ルール：
- 文字数：50〜160文字
- 記事の価値・対象読者・得られる知識を含む
- 独立した要約文として書く

---

## フェーズ 4：Substack への投稿（内部API方式）

> **ポイント**：Playwright でSubstackへナビゲートし、`browser_evaluate` 内から `/api/v1/drafts` に直接POSTする。ブラウザのクッキーが自動付与されるため、認証トークンの手動管理は不要。

### Step 1：Substackへナビゲート

`playwright:browser_navigate` で以下のURLへ移動する：

```
https://ccwm.substack.com
```

（ログイン済みの状態になれば良いため、トップページで十分。）

### Step 2：内部APIで下書きを作成する

`playwright:browser_evaluate` に以下のスクリプトを渡す。  
`scripts/draft_api_executor.js` の内容を読み込んで IIFE 内に展開し、変数部分（`TITLE` 〜 `BODY_MD`）を実際の値に置き換えて実行する。

```js
(async () => {
  const TITLE     = '実際のタイトル';
  const SUBTITLE  = '実際のサブタイトル';  // なし: null
  const SECTION   = 'リベハブ';            // なし: null
  const SEO_TITLE = '実際のSEOタイトル';
  const SEO_DESC  = '実際のSEO説明文（50〜160文字）';
  const URL_SLUG  = 'actual-url-slug';
  const BODY_MD   = `ここに本文Markdownをそのまま展開（テンプレートリテラル）`;

  // ↓ scripts/draft_api_executor.js の内容をそのまま展開 ↓

})()
```

> **重要**：本文Markdownはテンプレートリテラル（バッククォート）で囲んで展開する。bash によるJSONエンコードは不要。

### Step 3：戻り値で分岐

| 戻り値 | 対応 |
|---|---|
| `{ ok: true, draftId, url }` | フェーズ 5 へ |
| `{ ok: false, error, url }` | ユーザーに error を報告。再試行する場合はユーザーの確認を取る（下書き重複の恐れ） |

---

## フェーズ 5：完了確認・報告

### タグ候補

以下の既知タグリストから内容に合うものを最大3〜5つ選択し（自動入力はしない）。

```
Claude AI / Claude入門 / Claude Code
AIリテラシー / AI活用 / 自動化
経理・会計 / ビジネス活用 / 初心者 / ChatGPT
```

### 報告フォーマット

```
✅ Substackへの下書き投稿が完了しました。

📄 投稿を確認: [投稿タイトル](https://ccwm.substack.com/publish/post/[ID])

---
⚠️ 手動設定が必要な項目:
- タグ（候補を下記に提示）

🏷️ タグ候補（設定モーダルの「タグ」欄から追加してください）:
1. [タグ名1]
2. [タグ名2]
3. [タグ名3]
```

**URLは必ずクリッカブルなMarkdownリンク形式で提示する**（コードブロック禁止）。

---

## 参照ファイル

- `scripts/draft_api_executor.js` — Substack内部APIへの下書き投稿ロジック本体。フェーズ4 Step 2 で読み込んで IIFE 内に展開する

---

## クイックリファレンス

| 項目 | 方式 |
|---|---|
| ナビゲート | `playwright:browser_navigate` → `https://ccwm.substack.com` |
| JS 実行 | `playwright:browser_evaluate` に IIFE を渡す |
| 認証 | 不要（Playwright のログイン状態を自動利用） |
| userId 取得 | `substack.lli` クッキーの JWT を自動デコード |
| 本文展開 | テンプレートリテラル（バッククォート）で直接展開 |
| セクション | APIの `section_id` フィールドで指定（UIクリック不要） |
| SEO設定 | `draft_title` / `draft_subtitle` / `draft_description` フィールドで一括設定 |
| URLスラッグ | `draft_slug` フィールドで設定 |
| タグ | **自動入力しない** → 完了後に候補を提示 |
| 確認URL | `https://ccwm.substack.com/publish/post/{draftId}` |
