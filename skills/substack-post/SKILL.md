---
name: substack-post
description: Claudeが生成したMarkdown文章をSubstackに下書き投稿するスキル。「Substackに投稿して」「下書きにして」「Substackの記事にして」「このMarkdownをSubstackへ」などの依頼、またはMDファイルを添付した上で、投稿指示があった場合に必ず使用する。Substackへの投稿・入稿・記事作成・下書き保存が話題になったら必ずこのスキルを使うこと。
license: MIT
metadata:
  author: toieelab Kameda
  version: 2.0.0
  tags: [substack, publishing, automation, markdown, newsletter]
---

# Substack 下書き投稿スキル

会話内で生成した文章や添付MDファイルをSubstackエディタへ自動入力し、タイトル・サブタイトル・セクション・SEO・URLスラッグを設定して下書き保存する。**タグ設定は人間が行う**ため、投稿完了後にタグ候補を提示する。

## 設計思想

- `computer` ツール（スクリーンショット→視覚判断）は**一切使わない**
- JSの実行ロジックは `references/post_executor.js` に分離済み。Claudeが毎回再生成しない
- Claudeが出力するのは**7つの変数値のみ**（約10行）。ロジック本体はbashが結合する
- タグ設定は自動化せず、完了後に候補を提示する

### 全体フロー概要

| フェーズ | 内容 |
|---|---|
| フェーズ 1 | 投稿コンテンツ（本文Markdown）を取得する |
| フェーズ 2 | 不足フィールドをユーザーに確認する |
| フェーズ 3 | 「おまかせ」項目とSEO説明文・タグ候補を自動生成する |
| フェーズ 4 | vars.js を書き込み → bash で結合 → JS を実行する（3ステップ） |
| フェーズ 5 | 完了をリンクで報告し、タグ候補を提示する |

---

## 前提条件

- ブラウザで `https://ccwm.substack.com` にログイン済み
- Claude in Chrome コネクタが接続済み
  - `navigate` — URLへ移動
  - `javascript_tool` — アクティブタブで JavaScript を実行
- bash_tool が利用可能（vars.js の書き込みとビルドスクリプト実行に使用）
- `computer` ツールは使用しない

---

## フェーズ 1：コンテンツを受け取る

| 種類 | 取得方法 |
|---|---|
| 会話内で生成した文章 | 直前のアシスタント出力をMarkdownとして使用 |
| 添付Markdownファイル | ファイル内容を読み込んでMarkdownとして使用 |

本文が取得できない場合は、ユーザーに確認してから進む。

---

## フェーズ 2：不足フィールドの確認・質問

1. 会話内ですでに決まっている項目は質問しない
2. 不足している項目のみ `ask_user_input_v0` でまとめて質問する
3. **各質問の最初の選択肢は必ず「おまかせ」**
4. SEO説明文は常に自動生成するため質問しない
5. タグは質問しない（完了後に候補提示）

### 質問フィールドと選択肢

**タイトル**（必須）
```
Q: タイトルを決めてください
Options: ["おまかせ（Claudeが生成）", "指定する"]
```

**サブタイトル**（任意）
```
Q: サブタイトルはありますか？
Options: ["おまかせ（生成する）", "指定する", "なし"]
```

**セクション**（任意）
```
Q: セクションを選択してください
Options: ["おまかせ（リベハブ）", "リベハブ", "お知らせ", "なし"]
```

**URLスラッグ**（任意）
```
Q: URLスラッグを設定しますか？
Options: ["おまかせ（英語で自動生成）", "指定する"]
```

**SEOタイトル**（任意）
```
Q: SEOタイトルはありますか？
Options: ["おまかせ（タイトルと同じ）", "指定する"]
```

---

## フェーズ 3：おまかせ項目・SEO説明文・タグ候補の生成

「おまかせ」を選んだ項目を本文から生成する。

| 項目 | 生成ルール |
|---|---|
| タイトル | 本文の主題を端的に表す10〜30文字 |
| サブタイトル | 本文の要旨を1〜2文で表現 |
| セクション | 「リベハブ」を使用 |
| SEOタイトル | タイトルと同じ文字列 |
| URLスラッグ | タイトルの意味を英訳しハイフン区切りにする（例: `claude-substack-auto-post`） |

### SEO説明文（常に自動生成・質問なし）

> Substackは記事冒頭の文章をSEO説明文に自動入力するが内容が不適切なため、**必ず上書き生成する。**

生成ルール：
- 文字数：50〜160文字
- 記事の価値・対象読者・得られる知識を含む
- 独立した要約文として書く

### タグ候補（完了後に提示）

以下の既知タグリストから内容に合うものを最大3〜5つ選択し、**フェーズ5で提示する**（自動入力はしない）。

```
Claude AI / Claude入門 / Claude Code
AIリテラシー / AI活用 / 自動化
経理・会計 / ビジネス活用 / 初心者 / ChatGPT
```

---

## フェーズ 4：Substackエディタへの入力（3ステップ）

> **ポイント**: Claudeは7行の変数値だけを出力する。250行のロジックはbashが `references/post_executor.js` から読み込んで結合するため、Claudeの生成量を最小化できる。

### Step 1：新規投稿ページへ移動

`navigate` ツールで以下のURLへ移動する：

```
https://ccwm.substack.com/publish/post?type=newsletter
```

エディタの読み込みを確認する（`javascript_tool` で `!!document.querySelector('#post-title')` が `true` になるまで待つ）。

### Step 2：vars.js を書き込む（Claudeが出力するのはここだけ）

bash_tool で `/tmp/substack_vars.js` に7行の変数宣言を書き込む。

```bash
cat > /tmp/substack_vars.js << 'JSEOF'
const TITLE     = '実際のタイトル';
const SUBTITLE  = '実際のサブタイトル';   // null なら: null
const SECTION   = 'リベハブ';             // 不要なら: null
const SEO_TITLE = TITLE;
const SEO_DESC  = '実際のSEO説明文（50〜160文字）';
const URL_SLUG  = 'actual-url-slug';
const BODY_MD   = `実際の本文Markdown（バッククォートは \` とエスケープ）`;
JSEOF
```

> **注意**: BODY_MD 内にバッククォート（`` ` ``）が含まれる場合は `\`` にエスケープする。

### Step 3：ビルドスクリプトで結合

bash_tool で `build_post_js.sh` を実行し、完全なJSを生成する。

```bash
bash /mnt/skills/user/substack-post/scripts/build_post_js.sh \
  /tmp/substack_vars.js \
  /tmp/substack_post.js
```

### Step 4：結合済みJSを実行

bash_tool で `/tmp/substack_post.js` の内容を読み込み、そのまま `javascript_tool` に渡して実行する。

```bash
cat /tmp/substack_post.js
```

> 読み込んだ内容を `javascript_tool` の `text` パラメータにそのまま渡す。

---

## フェーズ 5：完了確認・報告

JSスクリプトの戻り値（`R` オブジェクト）を確認し、以下の形式でユーザーに報告する。

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

- `references/post_executor.js` — Substackエディタ操作のJSロジック本体。変数宣言なし・IIFEなし。`build_post_js.sh` が自動で結合するため、Claudeが直接読む必要はない
- `scripts/build_post_js.sh` — vars.js と post_executor.js を結合して完全なJSを生成するbashスクリプト

---

## クイックリファレンス

| 項目 | 方式 |
|---|---|
| Claudeの出力 | 変数値7行のみ（`/tmp/substack_vars.js`） |
| JS結合 | `scripts/build_post_js.sh` が自動で処理 |
| タイトル | JS: `#post-title` に React setter でセット |
| サブタイトル | JS: `textarea[placeholder="サブタイトルを追加…"]` |
| セクション | JS: `simulatePointerClick` → `[role="menuitem"]` クリック |
| 本文 | JS: ClipboardEvent + DataTransfer（HTML + plaintext） |
| 設定モーダル | JS: `[data-testid="settings-button"]` クリック |
| SEOアコーディオン | JS: `cursor-pointer` + "SEOオプション" テキストで特定 |
| SEO Form 1 | SEOタイトル＋説明文を同時入力 → `waitAndClickSave` |
| SEO Form 2 | URLスラッグ `input[name="code"]` → `waitAndClickSave` |
| タグ | **自動入力しない** → 完了後に候補を提示 |
| 確認URL | Markdownリンク形式（コードブロック禁止） |
