---
name: substack-post
description: Claudeが生成したMarkdown文章をSubstackに下書き投稿するスキル。「Substackに投稿して」「下書きにして」「Substackの記事にして」「このMarkdownをSubstackへ」などの依頼、またはMDファイルを添付した上で、投稿指示があった場合に必ず使用する。Substackへの投稿・入稿・記事作成・下書き保存が話題になったら必ずこのスキルを使うこと。
license: MIT
metadata:
  author: toieelab Kameda
  version: 0.1.0
  tags: [substack, publishing, automation, markdown, newsletter]
---

# Substack 下書き投稿スキル

会話内で生成した文章や添付MDファイルをフォーマット済みテキストとしてSubstackエディタへ自動入力し、タイトル・サブタイトル・セクション・タグ・SEO・URLスラッグをすべて設定して下書き保存する。

## 設計思想

このスキルは「Claudeが書いた文章をそのままSubstackへ」という一連の作業を自動化する。ユーザーが毎回コピー＆ペーストや設定を手動で行う手間を省き、フォーマット・SEO・URLスラッグまで一貫して設定することで投稿品質を均一に保つことが目的。ブラウザ操作は Claude Desktop App の Chrome Control コネクタ（`tabs_context_mcp` / `javascript_tool` / `computer`）を介して行い、Substackエディタ（TipTap/ProseMirror）の制約に合わせた入力方式を採用している。

### 全体フロー概要

| フェーズ | 内容 |
|---|---|
| フェーズ 1 | 投稿コンテンツ（本文Markdown）を取得する |
| フェーズ 2 | 不足フィールド（タイトル・セクション等）をユーザーに確認する |
| フェーズ 3 | 「おまかせ」項目とSEO説明文を自動生成する |
| フェーズ 4 | Substackエディタを開き、すべての項目を入力して下書き保存する |
| フェーズ 5 | 保存完了を確認してユーザーに報告する |

### トリガー条件と非トリガー条件

**トリガーする**:
- 「Substackに投稿して」「下書きにして」「Substackの記事にして」「このMarkdownをSubstackへ」などの明示的な投稿指示
- MDファイルを添付した上で投稿・入稿の指示があった場合

**トリガーしない**:
- 投稿指示のない文章生成タスク（下書き生成のみ依頼されている場合）
- 投稿コンテンツが一切ない状態での呼び出し（→ まず本文を確認する）

---

## 前提条件

- ブラウザで `https://ccwm.substack.com` にログイン済み
- Claude in Chrome コネクタが接続済み（Chrome Control 経由）
  - `tabs_context_mcp` — タブ一覧取得・タブIDの特定
  - `javascript_tool` — アクティブタブで JavaScript を実行（DOM操作・フォーム入力）
  - `computer` — スクリーンショット・クリック・キー入力（UIインタラクション）
- 投稿タイプ：ニュースレター（newsletter）

---

## フェーズ 1：コンテンツを受け取る

### 入力の種類

| 種類 | 取得方法 |
|---|---|
| 会話内で生成した文章 | 直前のアシスタント出力をMarkdownとして使用 |
| 添付Markdownファイル | ファイル内容を読み込んでMarkdownとして使用 |

本文が取得できない場合は、ユーザーに確認してから進む。

---

## フェーズ 2：不足フィールドの確認・質問

### 原則

1. 会話内ですでに決まっている項目は質問しない
2. 不足している項目のみ `ask_user_input_v0` でまとめて質問する
3. **各質問の最初の選択肢は必ず「おまかせ」**
4. SEO説明文は常に自動生成するため質問しない

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

**タグ**（任意）
```
Q: タグを追加しますか？
Options: ["おまかせ（内容から選択）", "指定する", "なし"]
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

## フェーズ 3：おまかせ項目・SEO説明文の生成

「おまかせ」を選んだ項目を本文から生成する。

| 項目 | 生成ルール |
|---|---|
| タイトル | 本文の主題を端的に表す10〜30文字 |
| サブタイトル | 本文の要旨を1〜2文で表現 |
| セクション | 「リベハブ」を使用 |
| タグ | 下記の既知タグリストから内容に合うものを最大3つ選択 |
| SEOタイトル | タイトルと同じ文字列 |
| URLスラッグ | タイトルの意味を英訳しハイフン区切りにする（例: `claude-substack-auto-post`） |

### SEO説明文（常に自動生成・質問なし）

> Substackは記事冒頭の文章をSEO説明文に自動入力するが内容が不適切なため、
> **必ず上書き生成する。** 記事冒頭の文をそのまま使ってはいけない。

生成ルール：
- 文字数：50〜160文字
- 記事の価値・対象読者・得られる知識を含む
- 独立した要約文として書く

---

## フェーズ 4：Substackエディタへの入力

ブラウザ操作は Chrome Control コネクタの3ツールで行う。まず `tabs_context_mcp` でタブ一覧を取得し、Substackのタブを特定してから操作を開始する。JS実行は `javascript_tool`、クリック・タイプ・スクリーンショットは `computer` ツールを使う。

### Step 1：新規投稿を開く

```javascript
// navigate to:
"https://ccwm.substack.com/publish/post?type=newsletter"
```

ページ読み込み完了（エディタの「タイトル」プレースホルダーが表示される）を確認後、次へ。

> **エラー対処**: エディタが表示されない場合は1回だけ再読み込みする。それでも失敗した場合はユーザーに「Substackエディタが開けませんでした。ブラウザでSubstackにログインされているか確認してください」と報告して中断する。

---

### Step 2：タイトルを入力する

- セレクタ: `#post-title`（textarea）

```javascript
const el = document.querySelector('#post-title');
const setter = Object.getOwnPropertyDescriptor(
  window.HTMLTextAreaElement.prototype, 'value'
).set;
setter.call(el, TITLE_TEXT);
el.dispatchEvent(new Event('input', { bubbles: true }));
el.dispatchEvent(new Event('change', { bubbles: true }));
```

---

### Step 3：サブタイトルを入力する（なしの場合はスキップ）

- セレクタ: `textarea[placeholder="サブタイトルを追加…"]`
- Step 2 と同じ方法で入力する

---

### Step 4：セクションを選択する（なしの場合はスキップ）

ツールバーの「セクションを選択 ▼」ボタンを使う（設定モーダルではない）。

```javascript
// ① ドロップダウンを開く（クリック操作）
// エディタ上部ツールバーの「セクションを選択」ボタンをクリック

// ② menuitem からテキストで選択
const items = document.querySelectorAll('[role="menuitem"]');
const target = Array.from(items).find(el => el.textContent.trim() === SECTION_NAME);
if (target) target.click();
```

利用可能なセクション: **リベハブ** / **お知らせ**

> **エラー対処**: `menuitem` が見つからない場合はセクション選択をスキップし、完了後にユーザーへ「セクションの設定ができませんでした。手動で設定してください」と報告する。

---

### Step 5：本文を貼り付ける

エディタは TipTap/ProseMirror 形式。`value` 直接代入は不可。
**ClipboardEvent + DataTransfer 方式**を使う。

```javascript
// ① Markdown → HTML 変換
const htmlContent = convertMarkdownToHtml(MARKDOWN_TEXT);

// ② エディタをフォーカス
const editor = document.querySelector('[data-testid="editor"]');
editor.focus();

// ③ paste イベントで貼り付け
const dt = new DataTransfer();
dt.setData('text/html', htmlContent);
dt.setData('text/plain', MARKDOWN_TEXT);
editor.dispatchEvent(new ClipboardEvent('paste', {
  bubbles: true,
  cancelable: true,
  clipboardData: dt
}));
```

Markdown → HTML 変換関数（javascript_tool で実行）:

```javascript
function convertMarkdownToHtml(md) {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^> (.+)$/gm, '<blockquote><p>$1</p></blockquote>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/^---$/gm, '<hr>')
    .replace(/(^- .+$(\n^- .+$)*)/gm, (match) => {
      const items = match.split('\n')
        .map(l => `<li>${l.replace(/^- /, '')}</li>`).join('');
      return `<ul>${items}</ul>`;
    })
    .replace(/(^\d+\. .+$(\n^\d+\. .+$)*)/gm, (match) => {
      const items = match.split('\n')
        .map(l => `<li>${l.replace(/^\d+\. /, '')}</li>`).join('');
      return `<ol>${items}</ol>`;
    })
    .replace(/^(?!<[h1-6|ul|ol|li|blockquote|hr|code])(.+)$/gm, '<p>$1</p>')
    .replace(/^\s*$/gm, '');
}
```

> **変換の限界**: この関数はリンク・画像・コードブロック（複数行）・テーブルに対応していない。これらを含む本文を貼り付けた場合は、エディタ上で手動確認・修正を推奨する。

既存コンテンツがある場合は先に `Cmd+A` → `Delete` で消去する。

> **エラー対処**: ペーストイベントが機能しない（エディタに何も入力されない）場合は、プレーンテキストのみ（`text/plain`）で再試行する。それでも失敗した場合はユーザーに手動貼り付けを依頼する。

---

### Step 6：設定モーダルを開く

- 画面右下「設定（⚙）」ボタンをクリック
- 「ポスト設定」モーダルが開いたことを確認
- **モーダル内を下にスクロールして「SEOオプション」アコーディオンを探す**
  （タグ追加・テストメール・シークレットリンクの下にある）

---

### Step 7：タグを追加する（なしの場合はスキップ）

- セレクタ: `input[placeholder="タグを選択または作成"]`

操作手順（JavaScript 直接セット不可。UI 操作のみ有効）:
1. タグ入力欄をクリック
2. タグ名を 1 文字ずつタイプ（`computer` ツールの `type` アクション）
3. 候補リストが表示されたら該当項目をクリック
4. 複数タグがある場合は 1 つずつ繰り返す

> **エラー対処**: 候補リストに目的のタグが表示されない場合は、そのタグをスキップして次のタグに進む。完了後にユーザーへスキップしたタグ名を報告する。

---

### Step 8：SEO オプションを展開・入力・保存する

#### 8b〜8d の共通注意事項

JavaScript で値をセットすると「保存」「キャンセル」ボタンが動的に出現する。
これは Substack が「未保存の変更あり」と判断したサインである。
**入力 → 保存ボタン出現 → 保存ボタンクリック → ボタン消滅**
という順序を各フィールドで守ること。

> **エラー対処（共通）**: 入力後に「保存」ボタンが5秒以内に出現しない場合は、再度 `input` イベントを発火させる。それでもボタンが出現しない場合はユーザーに「[フィールド名]の保存ボタンが表示されませんでした。手動で確認してください」と報告する。

#### 8a. SEO オプションを展開
- 「SEOオプション」アコーディオンをクリックして展開

#### 8b. SEO タイトルを入力・保存
- セレクタ: `input[placeholder="カスタムタイトルを入力..."]`
- React Native Setter + `input` イベント発火
- **「保存」ボタンをクリック**（必須・自動保存されない）

```javascript
const el = document.querySelector('input[placeholder="カスタムタイトルを入力..."]');
const setter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 'value'
).set;
setter.call(el, SEO_TITLE);
el.dispatchEvent(new Event('input', { bubbles: true }));
// → その後「保存」ボタンをクリック
```

#### 8c. SEO 説明文を入力・保存
- セレクタ: `textarea[placeholder="カスタムの説明を入力..."]`
- 同様に入力後、**「保存」ボタンをクリック**（必須）

#### 8d. URL スラッグを入力・保存
- セレクタ: `input[placeholder="enter-url-here"]`
- 同様に入力後、**「保存」ボタンをクリック**（必須）

> ⚠️ SEO タイトル・SEO 説明文・URL スラッグは「保存」ボタンのクリックが必要。
> 保存ボタンが消えたことで保存完了を確認する。

#### 8e. 完了確認（Step 9に進む前に必須）

⚠️ 「完了」ボタンは、以下をすべて確認してから押す：

- [ ] SEO説明文の「保存」ボタンが消えている
- [ ] URLスラッグの「保存」ボタンが消えている

保存ボタンがまだ表示されている場合は、先にクリックして消えることを確認する。
この確認なしに「完了」を押すと設定がリセットされる。

---

### Step 9：モーダルを閉じる

- 「完了」ボタンをクリック

---

## フェーズ 5：完了確認

1. 画面上部に「● 保存済み」が表示されることを確認
2. スクリーンショットを撮影してユーザーに見せる
3. 投稿 URL（`https://ccwm.substack.com/publish/post/[ID]`）を報告する
4. スキップ・失敗した項目があれば合わせて報告する

---

## 既知タグリスト（ccwm.substack.com）

おまかせでタグを選ぶ際はこのリストから選択する:

```
Claude AI / Claude入門 / Claude Code
AIリテラシー / AI活用 / 自動化
経理・会計 / ビジネス活用 / 初心者 / ChatGPT
```

---

## クイックリファレンス

| 項目 | 注意点 |
|---|---|
| セクション選択 | ツールバーのドロップダウンを使う（設定モーダルのは機能しない） |
| SEO・URL の保存 | 入力後に必ず「保存」ボタンをクリック（ボタン消滅で完了確認） |
| タグ操作 | JavaScript 直接セットは不可。クリック→タイプ→候補選択のみ |
| インラインコード | `<code>` はテキストは入るがスタイル未適用の場合あり |
| SEO 説明文 | Substack の自動入力（記事冒頭）は必ず上書きする |
| 本文クリア | 既存内容がある場合は Cmd+A → Delete 後に貼り付け |
| Markdown変換 | リンク・画像・コードブロック・テーブルは手動確認を推奨 |
