---
name: substack-post
description: Claudeが生成したMarkdown文章をSubstackに下書き投稿するスキル。「Substackに投稿して」「下書きにして」「Substackの記事にして」「このMarkdownをSubstackへ」などの依頼、またはMDファイルを添付した上で、投稿指示があった場合に必ず使用する。Substackへの投稿・入稿・記事作成・下書き保存が話題になったら必ずこのスキルを使うこと。
license: MIT
metadata:
  author: toieelab Kameda
  version: 3.0.0
  tags: [substack, publishing, automation, markdown, newsletter]
---

# Substack 下書き投稿スキル

会話内で生成した文章や添付MDファイルをSubstackエディタへ自動入力し、タイトル・サブタイトル・セクション・SEO・URLスラッグを設定して下書き保存する。**タグ設定は人間が行う**ため、投稿完了後にタグ候補を提示する。

## 設計思想

- `computer` ツール（スクリーンショット→視覚判断）は**一切使わない**
- **本文をコンテキストに通すのは1回だけ**：本文は `/tmp/body.md` に書き込んだ後、ローカルサーバ経由でブラウザへ配信する。結合JSをClaudeが読み戻すことはしない（効率化の核心）
- タグ設定は自動化せず、完了後に候補を提示する

### 全体フロー概要

| フェーズ | 内容 |
|---|---|
| フェーズ 1 | 投稿コンテンツ（本文Markdown）を取得する |
| フェーズ 2 | 不足フィールドをユーザーに確認する |
| フェーズ 3 | 「おまかせ」項目とSEO説明文・タグ候補を自動生成する |
| フェーズ 4 | body.md/vars を書き込み → bashで結合＋配信 → ブートストラップJSを実行する |
| フェーズ 5 | 完了をリンクで報告し、タグ候補を提示する |

---

## 前提条件

- ブラウザで `https://ccwm.substack.com` にログイン済み
- Claude in Chrome コネクタが接続済み
  - `navigate` — URLへ移動
  - `javascript_tool` — アクティブタブで JavaScript を実行（トップレベル `await` / `return` 可）
- bash_tool が利用可能（vars 書き込み・ビルド・サーバ起動に使用）
- python3 が利用可能（本文のJSONエンコードと配信サーバに使用）
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

> **ポイント**: Claudeが出力するのは「本文（body.md）」「6行の変数」「数行のブートストラップ」だけ。本文のJSONエンコードと250行のロジック結合はbashが処理し、生成された結合JSはローカルサーバから配信される。**本文を含む結合JSをReadで読み戻さない**ため、コンテキスト消費が最小になる。

### Step 1：新規投稿ページへ移動

`navigate` ツールで以下のURLへ移動する：

```
https://ccwm.substack.com/publish/post?type=newsletter
```

> エディタの読み込み待機は executor 側（STEP 1）が行うため、ここで個別の待機ポーリングは不要。

### Step 2：本文と vars を書き込む

**2-a. 本文を `/tmp/body.md` に保存する（Write ツールを使用）**

Write ツールで `/tmp/body.md` に記事 Markdown をそのまま書き込む。エスケープ不要。

**2-b. `/tmp/substack_vars.js` に6行の変数宣言を書き込む（bash）**

```bash
cat > /tmp/substack_vars.js << 'JSEOF'
const TITLE     = '実際のタイトル';
const SUBTITLE  = '実際のサブタイトル';  // null なら: null
const SECTION   = 'リベハブ';            // 不要なら: null
const SEO_TITLE = TITLE;
const SEO_DESC  = '実際のSEO説明文（50〜160文字）';
const URL_SLUG  = 'actual-url-slug';
JSEOF
```

> BODY_MD は vars に含めない。`build_and_serve.sh` が `/tmp/body.md` を読み込みJSONエンコードして自動生成する。

### Step 3：結合＋配信サーバ起動（bash）

bash_tool で `build_and_serve.sh` を実行する。結合JSの生成・サーバ起動・ヘルスチェックまでを行う。

```bash
bash /mnt/skills/user/substack-post/scripts/build_and_serve.sh /tmp/substack_vars.js
```

出力の最終行 `READY http://127.0.0.1:8765/post-<token>.js` から**トークン付きURL**を取得する。`❌` で終わった場合はサーバ起動失敗。

### Step 4：ブートストラップを実行（javascript_tool）

取得したトークンURLを差し込んで、以下の**ブートストラップだけ**を `javascript_tool` の `text` に渡して実行する。本文・ロジックはサーバから取得されるためClaudeのコンテキストを通らない。

> **重要**: `javascript_tool` は渡されたテキストを「単一の式」として評価し、その完了値（Promiseなら解決後の値）を返す。**トップレベルの `await` / `return` は使えない**（構文エラーで失敗する）。そのため必ず `(async () => { ... })()` の**IIFE式で包む**こと。これにより完了値が Promise になり、解決後の `{...R, url}` が戻り値になる。

```js
(async () => {
  try {
    const res = await fetch('http://127.0.0.1:8765/post-<TOKEN>.js');
    if (!res.ok) return { error: 'fetch_blocked', message: 'status ' + res.status };
    const code = await res.text();
    try { return await eval(code); }
    catch (e) { return { error: 'eval_blocked', message: String(e) }; }
  } catch (e) { return { error: 'fetch_blocked', message: String(e) }; }
})()
```

### Step 5：戻り値で分岐

| 戻り値 | 対応 |
|---|---|
| `{...R, url}`（正常） | フェーズ5へ |
| `{error:'fetch_blocked'}` / `{error:'eval_blocked'}` | **インラインフォールバック**（下記）。以後このセッションではインライン経路を使い、fetchは再試行しない |
| `{error:'editor_not_loaded', url}` | **再試行しない**（下書き重複の恐れ）。ユーザーに報告し、エディタページの再読込を促す |

#### インラインフォールバック（fetch/eval がブロックされた場合の対等な経路）

> これは劣化版ではなく**対等な実行経路**。fetch経路を「直そう」とせず、すぐにこちらへ切り替える。

Read ツールで `/tmp/substack_post.js`（build_and_serve.sh が生成済み）を**1回で全体を読み込み**（`offset`/`limit` を指定して分割読みしない）、読み込んだ内容を**そのまま無加工で** `javascript_tool` の `text` に渡して実行する。手動で結合・再構築しないこと（不要なコンテキスト消費になる）。このファイルは `(async () => { ... })();` 形式の単一IIFE式なので、そのまま渡せば完了値=`{...R, url}` が返る。これは v2 までの実績ある方式そのもの（`fetch`・`eval` を使わないためCSP/接続制約の影響を受けない）。

### Step 6：サーバ停止（必ず実行）

Step 4/5 が成功・失敗・フォールバックのいずれであっても、最後に必ずサーバを停止する。

```bash
bash /mnt/skills/user/substack-post/scripts/stop_serve.sh
```

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

- `references/post_executor.js` — Substackエディタ操作のJSロジック本体。変数宣言なし・IIFEなし。`build_and_serve.sh` が自動で結合するため、Claudeが直接読む必要はない
- `scripts/build_and_serve.sh` — body.md と vars を結合して `/tmp/substack_post.js` を生成し、配信サーバを起動するbashスクリプト
- `scripts/serve.py` — 127.0.0.1限定のCORS単一ファイル配信サーバ（Origin許可リスト＋トークンパスで保護。`Access-Control-Allow-Origin: *` には戻さないこと＝他タブから下書き内容が読まれるのを防ぐため）
- `scripts/stop_serve.sh` — 配信サーバを停止する

---

## クイックリファレンス

| 項目 | 方式 |
|---|---|
| Claudeの出力 | 本文→`/tmp/body.md`（Write）＋変数6行→`/tmp/substack_vars.js`（bash）＋ブートストラップ数行 |
| BODY_MD | build_and_serve.sh が body.md を JSON エンコードして自動生成（バッククォート不問） |
| JS結合＋配信 | `scripts/build_and_serve.sh` が結合JS生成＋ローカルサーバ起動。`READY <url>` を出力 |
| JS実行 | ブートストラップ（**async IIFEで包む**・fetch→eval）を `javascript_tool` に渡す。トップレベル `await`/`return` は不可。**結合JSのRead読み戻しはしない** |
| フォールバック | fetch/eval失敗時のみ `/tmp/substack_post.js` を1回で全読み→無加工でインライン実行（対等な経路） |
| サーバ停止 | 実行後 `scripts/stop_serve.sh` を必ず実行 |
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
