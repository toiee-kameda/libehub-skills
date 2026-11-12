---
name: one-page-site-builder
description: ワンページ完結の Web ページ（ランディングページ・サービス紹介・ポートフォリオ・イベント告知・プロフィールなど）を 1 枚の HTML で作成・編集する。「LP を作って」「ホームページを作って」「ページを直して」など、公開ページの見た目・文章・レイアウトを作る・変える依頼で使う。Claude Code（デスクトップの Code タブ）前提。管理画面・ダッシュボード・動的 SPA・API には使わない。
license: MIT
metadata:
  author: toieelab Kameda
  version: 1.2.0
  tags: [web, html, landing-page, tailwind, design]
---

# ワンページサイトの作成

**Claude Code（デスクトップの Code タブ）前提のスキル。** ローカルサーバーを起動し、ブラウザでページを開いて検証できることを前提に書いてある。

コンテンツを任されたら創造性を発揮する。決まっているならそれに従う。編集依頼なら指定箇所だけ直す。

## 手順

1. 依頼文と渡された資料（添付ファイル、プロジェクト内の資料フォルダなど）を読む
2. 新規作成で情報が足りなければ確認する →「作成前の確認」
3. HTML を書く →「技術スタック」「デザイン」「ナビゲーション仕様」
4. **書き終えたら必ず [references/verify.md](references/verify.md) を読み、その手順で検証する。** 小さな編集でも飛ばさない
5. ブラウザのペインを開いたまま残し、「このペインで実物が見られます」とファイルパスを添えて伝える

**Artifact には出さない。** ユーザーが共有用のリンクを求めたときだけ、**完全な HTML 文書のまま** publish する（doctype や `<head>` を省く Artifact の作法には従わない。省くとデプロイ時に文字コード・OG 画像・ファビコン・言語指定が失われる）。

## 成果物

**どこにでも置けば動く 1 枚の HTML ファイル。** 必ず **UTF-8** で保存する（日本語の文字化け防止）。

置き場所は、プロジェクトに慣習があればそれに従う。無ければ作業ディレクトリの `index.html`。

## 作成前の確認（インタビュー）

資料に書かれている内容（店名・サービス内容・料金など）はページに使い、ユーザーに聞き直さない。

**新規作成**で、次の 3 点が依頼文と資料から読み取れないときだけ、作り始める前に確認する。編集依頼や、十分に書かれている場合は聞かずに進める。

1. **誰に向けたページか**（対象読者）
2. **読んだ人に何をしてほしいか**（ゴール。CTA の内容が決まる）
3. **どんな印象にしたいか**（トーン・色味）

聞き方のルール:

- 不足している項目だけを、**1 回のメッセージにまとめて**聞く（最大 3 問。往復を増やさない）
- **各質問に、依頼内容から推測したおすすめの答えを 1 つ添える。** 「それでいい」と言うだけで済むようにする
- 「すべておまかせ」と返されたら、添えたおすすめ案で作る
- 選択肢つきで質問できるツールがあれば使ってよい

例（カフェの紹介ページを依頼された場合）:

> 作り始める前に 3 点だけ確認させてください。おすすめを添えているので、それで良ければ「おまかせ」で大丈夫です。
> 1. 誰に向けたページですか？ — おすすめ: 近隣に住む 30〜40 代で、落ち着いて過ごせる場所を探している人
> 2. 読んだ人に何をしてほしいですか？ — おすすめ: Instagram のフォローと、地図を見て来店
> 3. どんな印象にしたいですか？ — おすすめ: 温かみのある落ち着いた雰囲気（深いグリーンと木の茶色を基調に）

## 技術スタック

**ここに挙げた以外のライブラリは足さない**（Animate.css・AOS・jQuery など）。1 枚で自己完結させるため。

**バージョンを正確に固定する**（`@4` のようなタグやレンジではなく `@4.3.3` と書く）。同じページが後日別のバージョンで描画されて崩れるのを防ぐため。

**読み込み位置**: `<link rel="stylesheet">` と Tailwind の `<script>` は `<head>` に置く。それ以外の `<script src>` と初期化コード（`lucide.createIcons()` など）は **`</body>` の直前**に置く。`<head>` で初期化を呼ぶと対象の DOM がまだ無く、アイコンもアニメーションも動かない。

### Tailwind CSS v4

ブラウザ版 CDN を使う（ビルド不要で 1 枚のまま動かすため。npm + ビルド構成に置き換えない）。v3 の `<link>` 形式は不可。

```html
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4.3.3"></script>
```

カスタムテーマは `<style type="text/tailwindcss">` 内の `@theme` で定義する。**`@theme` に書いた名前がそのままクラス名になる**（`--color-primary` → `bg-primary` / `text-primary`）。`bg-primary-900` のような**濃淡の番号は自動では生えない**ので、濃い色が必要なら `--color-primary-dark` のように別のトークンとして定義する:

```html
<style type="text/tailwindcss">
  @theme {
    --color-primary: #3b82f6;
    --color-primary-dark: #1e3a5f;
    --font-sans: 'Noto Sans JP', sans-serif;
  }
</style>
```

### フォント

Google Fonts から読み込む。`<head>` に置き、必ず実在するフォールバックを並べる。

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700&display=swap">
```

### Lucide v1.32.0（一般アイコン / https://lucide.dev/icons ）

```html
<!-- </body> の直前に -->
<script src="https://unpkg.com/lucide@1.32.0/dist/umd/lucide.min.js"></script>
<script>lucide.createIcons();</script>
```

アイコンは `<i data-lucide="menu"></i>` のように書く。**アイコン名は https://lucide.dev/icons で見た名前をそのまま使う**（記憶で新名を書くと存在しない名前になりやすい。旧名はエイリアスとして残っており描画される）。DOM を後から差し替えたら `lucide.createIcons()` を再実行する。

**`createIcons()` は対象の要素を新しい `<svg>` に「置き換える」。** 元の要素は DOM から切り離されるので、**要素への参照をキャッシュしてはいけない**。変数に取っておいて次回それを書き換えても、画面上の要素には届かない。ナビの `menu` ⇔ `x` の切替で必ず踏む罠なので、**毎回 ID で引き直す**。あわせて、古い `lucide-*` クラスが新しい SVG に残り続けるので取り除く。

```js
function setIcon(id, name) {
  var el = document.getElementById(id);
  if (!el) { return; }
  Array.prototype.slice.call(el.classList).forEach(function (cls) {
    if (cls === 'lucide' || cls.indexOf('lucide-') === 0) { el.classList.remove(cls); }
  });
  el.setAttribute('data-lucide', name);
  lucide.createIcons();
}
```

**ブランドロゴ（`instagram` / `facebook` / `twitter` / `youtube` 等）は v1 で削除されており描画されない。** [references/brand-icons.md](references/brand-icons.md) の SVG を使う。

### アニメーション（ライブラリを使わない）

**AOS は使わない。IntersectionObserver も使わない。** 一気にスクロールしたとき（ページ内アンカーでの移動、`End` キー、スクロール位置の復元など）、通り過ぎた要素の交差イベントが発火せず、**本文が `opacity: 0` のまま取り残される**。要素の位置を自分で見て判定すれば、この取りこぼしが起きない。

```html
<style>
  .reveal { transition: opacity .6s ease, transform .6s ease; }
  @media (prefers-reduced-motion: no-preference) {
    /* 隠すのは JS が is-armed を付けた要素だけ */
    .reveal.is-armed:not(.is-visible) { opacity: 0; transform: translateY(16px); }
  }
</style>
<script>
  // 最初の画面に写っている要素は隠さない
  let queue = [];
  document.querySelectorAll('.reveal').forEach(el => {
    if (el.getBoundingClientRect().top > window.innerHeight) {
      el.classList.add('is-armed');
      queue.push(el);
    }
  });

  // スクロールは rAF でスロットリングし、位置を見て解除する
  let ticking = false;
  function sweep() {
    ticking = false;
    const trigger = window.innerHeight * 0.9;
    queue = queue.filter(el => {
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add('is-visible');
        return false;
      }
      return true;
    });
  }
  addEventListener('scroll', () => {
    if (!ticking && queue.length) { ticking = true; requestAnimationFrame(sweep); }
  }, { passive: true });
  addEventListener('resize', sweep, { passive: true });
  sweep();
</script>
```

**必ず「見えている状態」を初期値にする。** 上の例では、`opacity: 0` は **JS が付けるクラス（`is-armed`）の内側だけ**に書いてある。CSS だけで `opacity: 0` を初期値にすると、JS が動かない環境・クローラ・OG 画像のキャプチャで**本文が消える**。さらに、最初の画面に写っている要素は JS 側で隠さない（隠すと 1 枚目が空になる）。

アニメーションは控えめに使う。多用すると「AI が作った感」が強くなる。

### HTML

- 完全な HTML 文書にする: `<!DOCTYPE html>` / `<html lang="ja">` / `<head>`（meta charset・description・`og:title`・`og:image` 等・ファビコン）/ `<body>`
- セマンティック要素を使い、各セクションに ID を振る
- レスポンシブ（モバイルファースト）、画像に `loading="lazy" decoding="async"`。ただし**ファーストビューに入る画像（ヒーローなど）は lazy にしない**。`loading="eager" fetchpriority="high" decoding="async"` にする（最初に見える画像を遅延させると表示が遅れる）
- 非 void 要素は必ず閉じる。属性はダブルクォートで囲む。キーボードフォーカスに可視状態を与える
- 住所・電話番号・メールアドレスは、リンクだけにせず**選択してコピーできるテキストとしても出す**

### フォーム

- バリデーションを実装する
- **静的な 1 枚の HTML にバックエンドは無い。** `submit` を `preventDefault()` で受け、結果はページ内に表示する。送信先を用意したい場合はユーザーに確認する（確認せずに `action` を外部 URL や `mailto:` へ向けない）

## デザイン

- カラーパレットは `@theme` で設定（コンテンツに合わせて選ぶ）
- 次の「AI が作りがちな定番の見た目」は、ユーザーの希望やコンテンツに合う理由がない限り使わない: 生成り・オフホワイトの背景、見出しの一部だけを斜体にする強調、「01 / 02 / 03」の番号付きセクションラベル、等幅フォントの小見出し、丸いピル型ボタン、絵文字をセクション記号に使う、すべて中央揃え。代わりに、そのページの業種・読者・トーンから色と形を決める
- 番号付きラベルや区切り線などの構造的な装飾は、**内容が実際にその構造を持っているときだけ**使う（本当に手順やステップがある場合など）

### コンテンツ構造

セクション構成の指示がある場合はそれに従う。指示がなければ自分で設計する。

判断基準は**セクション数ではなく、そのページの目的に対して必要な情報が揃っているか**。

よく使う構成要素（すべてを入れる必要はない）:
Hero / 課題提起・共感 / 提供価値 / 特徴・機能 / 使い方・流れ / 実績・お客様の声 / 料金 / 運営者・About / FAQ / CTA / フッター

- 目安は 6〜10 セクション。ただしこれは下限のノルマではない
- **素材が薄いときにセクションを水増ししない**。数を減らして 1 セクションの密度と説得力を上げる
- 逆に情報量が多いときは、無理に詰め込まず分割・整理する
- ヒーローセクションから始め、ナビゲーションを重ね、洗練されたイメージを与える
- ナビゲーションリンクを設置（セクションが多い場合は主要なものに絞る）
- 適度に画像を使用（背景画像も可）

### 画像

ユーザー指定がなければ Unsplash から選ぶ。手順・URL の最適化・クレジット表記は [references/images.md](references/images.md) を読む。

**写真を敷く帯（ヒーロー・背景画像セクション）には、必ず写真の下にブランドカラーの濃い `background-color` を置く。** 写真の読み込み中や、読み込みに失敗したとき、白抜き文字が白背景に重なって読めなくなる。背景色があれば写真なしでも成立する。

## ナビゲーション仕様

### 意図

Hero の上では背景に溶け込んで邪魔をせず、スクロールして本文に入ったら背景から分離して確実に読める状態にする。

### 必須要件

- `position: fixed` で上部固定（`sticky` 不可）
- 初期状態と、スクロール後の状態で見た目を切り替える（初期は透明寄り、スクロール後は背景を敷いて可読に）
- スクロールイベントは必ずスロットリングする（`requestAnimationFrame` など。手法は問わない）
- レスポンシブ：`lg:` ブレークポイントでデスクトップ / モバイルメニューを切替

### アクセシビリティ（必須）

- `<nav>` に `aria-label`
- モバイルメニューボタンに `aria-expanded`・`aria-controls`・`aria-label`、開閉時に動的更新
- アイコンは Lucide の `menu` ⇔ `x` で切替。**その `<i>` には `id="nav-toggle-icon"` を付け、`setIcon()` で差し替える**（検証でこの ID を使う）

### デザイン

切替のしきい値・背景色や不透明度・ぼかしの強さ・トランジション速度・影は、全体デザインに合わせて判断する。
（例として、スクロール 50px 前後で切り替え、`backdrop-filter: blur(12px)` + 白の半透明背景 70% 程度、はよく機能する組み合わせ）
