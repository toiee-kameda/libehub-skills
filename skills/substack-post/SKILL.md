---
name: substack-post
description: Claudeが生成したMarkdown文章をSubstackに下書き投稿するスキル。「Substackに投稿して」「下書きにして」「Substackの記事にして」「このMarkdownをSubstackへ」などの依頼、またはMDファイルを添付した上で、投稿指示があった場合に必ず使用する。Substackへの投稿・入稿・記事作成・下書き保存が話題になったら必ずこのスキルを使うこと。
license: MIT
metadata:
  author: toieelab Kameda
  version: 4.0.0
  tags: [substack, publishing, automation, markdown, newsletter]
---

# Substack 下書き投稿スキル

会話内で生成した文章や添付MDファイルをSubstackエディタへ自動入力し、タイトル・サブタイトル・セクション・SEO・URLスラッグを設定して下書き保存する。**タグ設定は人間が行う**ため、投稿完了後にタグ候補を提示する。

## 設計思想

- `computer` ツール（スクリーンショット→視覚判断）は**一切使わない**
- **fetch・ローカルサーバは使わない**：Chrome の Private Network Access 制限により HTTPS ページからのローカル fetch はブロックされるため、executor JS を直接 `javascript_tool` へ渡すインライン方式を使う
- **本文の JSON エンコードは bash に任せる**：バッククォートや `${` を含む Markdown を Claude が手動エスケープすると誤りが出るため、python3 に委ねる
- タグ設定は自動化せず、完了後に候補を提示する

### 全体フロー概要

| フェーズ | 内容 |
|---|---|
| フェーズ 1 | 投稿コンテンツ（本文Markdown）を取得する |
| フェーズ 2 | 不足フィールドをユーザーに確認する |
| フェーズ 3 | 「おまかせ」項目とSEO説明文を自動生成する |
| フェーズ 4 | エディタへ移動 → 本文書き込み → JSONエンコード → IIFE生成 → javascript_tool で実行 |
| フェーズ 5 | 完了をリンクで報告し、タグ候補を提示する |

---

## 前提条件

- ブラウザで `https://ccwm.substack.com` にログイン済み
- Claude in Chrome コネクタが接続済み
  - `navigate` — URLへ移動
  - `javascript_tool` — アクティブタブで JavaScript を実行
- bash_tool が利用可能（本文の JSON エンコードに使用）
- python3 が利用可能（JSON エンコードに使用）
- `computer` ツールは使用しない

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

## フェーズ 3：おまかせ項目・SEO説明文

「おまかせ」を選んだ項目を上記の生成ルールに従って本文から生成する。

### SEO説明文（常に自動生成・質問なし）

> Substackは記事冒頭の文章をSEO説明文に自動入力するが内容が不適切なため、**必ず上書き生成する。**

生成ルール：
- 文字数：50〜160文字
- 記事の価値・対象読者・得られる知識を含む
- 独立した要約文として書く

---

## フェーズ 4：Substackエディタへの入力

> **ポイント**: fetch・ローカルサーバを使わず、変数・本文・executor ロジックを一体化した IIFE を `javascript_tool` に直接渡す。本文の JSON エンコードだけ bash に委ねることでエスケープ誤りを防ぐ。

### Step 1：新規投稿ページへ移動

`navigate` ツールで以下のURLへ移動する：

```
https://ccwm.substack.com/publish/post?type=newsletter
```

### Step 2：本文を書き込む

Write ツールで `/tmp/body.md` に記事 Markdown をそのまま書き込む。

### Step 3：本文を JSON エンコードする（bash）

```bash
python3 -c "import json; print(json.dumps(open('/tmp/body.md').read()))"
```

出力は `"..."` 形式の1行。これを次のステップで `BODY_MD` の値として使う。

### Step 4：executor ロジックを読み込む

Read ツールで `references/post_executor.js` を**1回で全体を読み込む**（`offset`/`limit` を指定しない）。

### Step 5：完全な IIFE を javascript_tool に渡す

Step 3 の JSON 文字列・Step 4 のコードを組み合わせ、以下の形式で `javascript_tool` の `text` に渡す。

> **重要**: `javascript_tool` は渡されたテキストを「単一の式」として評価し、その完了値（Promiseなら解決後の値）を返す。トップレベルの `await` / `return` は使えないため、必ず `(async () => { ... })()` の **IIFE 式で包む**こと。

```js
(async () => {
  const TITLE     = '実際のタイトル';
  const SUBTITLE  = '実際のサブタイトル';  // null なら: null
  const SECTION   = 'リベハブ';            // 不要なら: null
  const SEO_TITLE = TITLE;
  const SEO_DESC  = '実際のSEO説明文（50〜160文字）';
  const URL_SLUG  = 'actual-url-slug';
  const BODY_MD   = [Step 3 の出力をそのまま貼る];

  // ↓ Step 4 で読み込んだ post_executor.js の内容をそのまま展開 ↓

})()
```

### Step 6：戻り値で分岐

| 戻り値 | 対応 |
|---|---|
| `{...R, url}`（正常） | フェーズ5へ |
| `{error:'editor_not_loaded', url}` | **再試行しない**（下書き重複の恐れ）。ユーザーに報告し、エディタページの再読込を促す |

---

## フェーズ 5：完了確認・報告

JSスクリプトの戻り値（`R` オブジェクト）を確認し、以下の形式でユーザーに報告する。

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
（セクション・SEO等で失敗があればここに追記）

🏷️ タグ候補（設定モーダルの「タグ」欄から追加してください）:
1. [タグ名1]
2. [タグ名2]
3. [タグ名3]
```

### URL の取得方法

JSスクリプトの戻り値 `url` フィールド（`location.href`）を使う。
**必ずクリッカブルなMarkdownリンク形式で提示する**（コードブロック禁止）。

### 失敗項目の報告

| `R` フィールド | `false` だった場合の報告内容 |
|---|---|
| `body` | 「本文の貼り付けに失敗しました。手動で貼り付けてください」 |
| `section` | 「セクションの設定に失敗しました。手動で設定してください」 |
| `modal` | 「設定モーダルが開けませんでした。⚙ボタンを手動で押してください」 |
| `seoForm1` | 「SEOタイトル・説明文の保存に失敗しました。手動で設定してください」 |
| `seoForm2` | 「URLスラッグの保存に失敗しました。手動で設定してください」 |
| `done` | 「完了ボタンが押せませんでした。モーダルを手動で閉じてください」 |

---

## 参照ファイル

- `references/post_executor.js` — Substackエディタ操作のJSロジック本体。変数宣言なし・IIFEなし。フェーズ4 Step 4 で Read して IIFE 内に展開する

---

## クイックリファレンス

| 項目 | 方式 |
|---|---|
| 本文書き込み | Write ツールで `/tmp/body.md` |
| 本文 JSON エンコード | bash: `python3 -c "import json; print(json.dumps(open('/tmp/body.md').read()))"` |
| executor 読み込み | Read ツールで `references/post_executor.js`（1回・全体） |
| JS 実行 | 変数 + BODY_MD + executor を IIFE で包んで `javascript_tool` に直接渡す |
| fetch・サーバー | **使用しない**（Chrome PNA 制限によりブロックされる） |
| タイトル | JS: `#post-title` に React setter でセット |
| サブタイトル | JS: `textarea[placeholder="サブタイトルを追加…"]` |
| セクション | JS: `simulatePointerClick` → `[role="menuitem"]`（NFKC正規化照合） |
| 本文 | JS: ClipboardEvent + DataTransfer（HTML + plaintext） |
| 設定モーダル | JS: `[data-testid="settings-button"]` クリック |
| SEOアコーディオン | JS: `cursor-pointer` + "SEOオプション" テキストで特定 |
| SEO Form 1 | SEOタイトル＋説明文を同時入力 → `waitAndClickSave` |
| SEO Form 2 | URLスラッグ `input[name="code"]` → `waitAndClickSave` |
| タグ | **自動入力しない** → 完了後に候補を提示 |
| 確認URL | Markdownリンク形式（コードブロック禁止） |
