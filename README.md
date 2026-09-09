# libehub-skills

[リベハブ](https://ccwm.substack.com/) プロジェクトで制作・公開している Claude Chat、Cowork 用スキル集です。

> **リベハブ**（Liberal Education Hub）は、AIを活用した学びと教育をテーマにした Substack です。

---

## 利用方法

公開しているスキルは、マーケットプレイスという仕組みを通じて、簡単インストールできます。

### マーケットプレイスの登録

claude.ai や Claude Desktop App で作業をします。

1. カスタマイズから、プラグインを開く
3. 追加から、マーケットプレイスを追加を選ぶ
4. リポジトリからの追加を選ぶ
5. URLに、「toiee-kameda/libehub-skills」を入力し、同期する

次に、自動同期（アップデート）設定を行います。

1. カスタマイズから、プラグインを開き、参照をクリック（ディレクトリが開く）
2. ディレクトリ・ウィンドウで、サイドバーではプラグインを選択した状態か確認する
3. プラグイン検索ボックスの下の Anthropic、パートナー、個人用 と並ぶところを見つけ「個人用」をクリック
4. libehub-skills　の ... をクリックし、自動的に同期をチェック入れる

これで自動同期されます。私が、改良版や、追加のスキルを構築したら、使えるようになります。なお、アップデートは、メールでもお知らせするので、ニュースレターにご登録ください。

- [リベハブ(Substack)](https://ccwm.substack.com/)

### スキルのインストール（プラグイン）

プラグインをインストールすると、複数のスキルがインストールされて、使えるようになります。

1. カスタマイズから、プラグインを開き、参照をクリック（ディレクトリが開く）
2. ディレクトリ・ウィンドウで、サイドバーではプラグインを選択した状態か確認する
3. プラグイン検索ボックスの下の Anthropic、パートナー、個人用 と並ぶところを見つけ「個人用」をクリック
4. libehub-skills　の ... をクリックする
5. 表示されたプラグイン一覧で、使いたいものを選んで + ボタンを押す

| プラグイン | 収録スキル |
| --- | --- |
| `ai-fluency` | `ai-fluency-check` / `coach-me` / `hint-me` |
| `work-tools` | `jp-check` / `context-builder` / `copywriting-grill` / `kabeuchi` / `eli5` |
| `substack-tools` | `substack-post` / `substack-quick-fix` |

上記3プラグインに含まれない `craft-whiteboard-excalidraw` は、下記の「個別スキルとしてインストール」の方法を利用してください。

---

## 個別スキルとしてインストール（.skill ファイル）

スキル単体をダウンロードしてインストールすることもできます。ただし、自動アップデートはできなくなります。

### `/ai-fluency-check` — AI フルーエンシー自己チェック

Anthropic の研究に基づく **4D AI Fluency Framework**（Delegation / Discernment / Diligence）を使って、AI活用スキルを自己評価するスキルです。

- 14項目のルーブリックで対話的にスコアリング
- D（委任・記述）/ C（識別・批判）/ L（責任ある利用）の3軸で評価
- 過去の評価結果と比較して成長を可視化
- 改善アドバイスと参考文献を提供

**使い方:** `/ai-fluency-check` と入力して起動

[ダウンロード (ai-fluency-check.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/ai-fluency-check.skill)

---

### `/coach-me` — AI 活用コーチング

現在の会話を振り返り、**AIフルーエンシーの観点からコーチングフィードバック**を提供するスキルです。

- 会話全体を4Dフレームワーク（Description / Delegation / Discernment / Direction）で分析
- うまくできていた点・改善できる点をわかりやすく提示
- 次回すぐ使えるプロンプト例を提案
- 会話が短い場合は限定モードで対応

**使い方:** 会話の途中や終わりに `/coach-me` と入力して起動

[ダウンロード (coach-me.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/coach-me.skill)

---

### `/ai-fluency-check` ダウンロード版 — AI フルーエンシー ルーブリック PDF

**4D AI Fluency Framework** に基づくルーブリック評価表の PDF 版です。印刷して手元に置いたり、授業・ワークショップで配布したりするのに使えます。

- スキルと同じ14項目のルーブリックを収録
- ブラウザで開いてそのまま印刷可能な HTML 版も同梱
- Claude を使わずオフラインで自己評価・他者評価に活用できる

[ダウンロード (ai-fluency-rubric.pdf)](https://github.com/toiee-kameda/libehub-skills/raw/main/resources/ai-fluency-index/ai-fluency-rubric.pdf)

---

### `/craft-whiteboard-excalidraw` — Craft ホワイトボード × Excalidraw 互換スキル

Claude の **Craft コネクタ**を使って Craft のホワイトボードに図を描くときに必要な互換ガイドスキルです。

- Craft 内蔵の Excalidraw はバージョンが古く、新記法（`label` 内包・`cameraUpdate`）を使うとテキストが消えるバグを回避
- シェイプとテキストを独立した要素として分離する正しい互換フォーマットを提供
- 矩形・矢印・テキストの正しい記法サンプルを収録
- `whiteboardElements_add` を呼び出す際に Claude が自動参照

**使い方:** Craft ホワイトボードに図を描くよう依頼すると自動起動。または `/craft-whiteboard-excalidraw` と入力

[ダウンロード (craft-whiteboard-excalidraw.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/craft-whiteboard-excalidraw.skill)

---

### `/substack-post` — Substack 下書き自動投稿

会話内で生成した文章や添付MDファイルを **Substack エディタへ自動入力**し、下書き保存するスキルです。

- タイトル・サブタイトル・セクション・SEO説明文・URL スラッグを設定
- Claude in Chrome コネクタと連携し、`javascript_tool` でブラウザを直接操作
- Markdown の JSON エンコードを python3 に委ね、エスケープミスを防止
- タグは投稿後に候補を提示（自動入力はしない）

**使い方:** 「Substackに投稿して」「下書きにして」などと依頼すると自動起動

**前提条件:** Google Chromeを使い、Claude in Chrome 拡張を設定し、Claude Desktop App で Control Chrome が使える状態にしておく。その上で、Substack にログイン済みの時に使います。このスキルは、私専用のURLや、設定になっているので、 **必ず修正** してください。

[ダウンロード (substack-post.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/substack-post.skill)

---

### `/substack-quick-fix` — Substack 誤字修正の高速適用

Substackの編集画面（Tiptap/ProseMirror）で、指摘済みの誤字脱字などの修正リストを**スクリーンショット操作なしで高速に反映**するスキルです。

- `javascript_tool` で編集領域のDOMを直接操作し、ブラウザ標準のテキスト入力コマンドで修正
- ProseMirrorの内部状態と同期し、Substackの自動保存にも正しく反映
- `jp-check` の校正結果をそのまま下書きに適用する用途などで利用

**使い方:** 「校正結果をSubstackの下書きに反映して」などと依頼すると起動

**前提条件:** Claude in Chrome 拡張で、対象のSubstack編集画面タブを操作できる状態にしておく

[ダウンロード (substack-quick-fix.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/substack-quick-fix.skill)

---

### `/hint-me` — Claude 活用ヒント提案

現在の会話状況に合わせて、**Claude の機能やプロンプト技法のヒント**を提案するスキルです。

- 会話の文脈を分析し、**4D Framework**（Delegation / Description / Discernment / Diligence）の観点から最適なヒントを選択
- 文脈なしで呼び出した場合はランダムに3つ提案。「他のを見たい」「〇〇用途で使いたい」と応答すると絞り込み
- 「見過ごされがちな機能」（⭐マーク付き）を積極的にピックアップ
- 押しつけにならない軽いトーンで提案し、会話の邪魔にならない設計

**使い方:** 会話の途中や開始時に `/hint-me` と入力して起動

[ダウンロード (hint-me.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/hint-me.skill)

---

### `/jp-check` — 日本語文章校正

日本語文章に対して**包括的な校正とフィードバック**を提供するスキルです。

- 誤字脱字・表記揺れ・文章の明確性・一貫性を4観点でチェック
- 重要度（高・中・低）付きの構造化レポートを出力
- ニュースレター・ブログ・技術文書など幅広い文書タイプに対応
- Front Matter や末尾注釈（toiee フォーマット）を自動スキップ

**使い方:** ファイルをアップロードして「校正してください」と依頼、または直接テキストを貼り付けて起動

[ダウンロード (jp-check.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/jp-check.skill)

---

### `/context-builder` — コンテキストドキュメント作成インタビュー

人・プロジェクト・プロダクトなどの対象について、**1問ずつ掘り下げるインタビュー**を通じて、今後 Claude との対話の冒頭に貼り付けるためのコンテキストドキュメント（自分についてなら `aboutme.md`）を作り上げるスキルです。

- 「その情報は Claude の回答・支援の仕方を変えるか？」という単一のフィルタで、集める情報を取捨選択
- `/context-builder me`（aboutme）/ `project` / `product` / 自由記述で対象を指定可能
- 質問マップをユーザーの承認を得てから設計・提示し、1問ずつ掘り下げてインタビュー
- 主要領域が埋まった後、Claude 側からも「まだ聞けていないが役立ちそうなこと」を逆質問
- 自動起動はせず、`/context-builder` の明示的な入力でのみ起動

**使い方:** `/context-builder`（または `/context-builder me` など）と入力して起動

[ダウンロード (context-builder.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/context-builder.skill)

---

### `/kabeuchi` — 壁打ち相手

答えや解決策を先回りして提示するのではなく、**傾聴・反射・開かれた問い**を通じて、ユーザー自身が考え抜けるように伴走するスキルです。

- 「発散」「整理」「行動化」など局面に応じてモードを切り替え
- ユーザーの許可を得たときだけ「反証（devil's advocate）」を行い、思考の穴を突く
- 迎合・誘導質問・早すぎる助言を避け、対話の終わりはユーザー自身の言葉でまとめさせる
- 自動起動はせず、`/kabeuchi` の明示的な入力または「壁打ち相手になって」等の依頼でのみ起動

**使い方:** `/kabeuchi` と入力、または「壁打ち相手になって」と依頼して起動

[ダウンロード (kabeuchi.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/kabeuchi.skill)

---

### `/eli5` — 5歳児にもわかる解説

要望されたテーマを、**大きな画像と少ない言葉を使ったHTML形式**で、まったく知識がない人にもわかるように解説するスキルです。

- 専門用語を避け、身近な例えで仕組みを説明
- 図解を中心にした視覚的な出力
- 「〇〇の仕組みをすごく簡単に図解して」のような依頼でも起動

**使い方:** `/eli5 "テーマ"` と入力して起動

[ダウンロード (eli5.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/eli5.skill)

---



1. 上記リンクから `.skill` ファイルをダウンロード
2. Claude の「カスタマイズ」→ 「スキル」→ 「+ボタン」 → 「スキルの作成」→「スキルをアップロード」で、`.skill` ファイルをアップロード
3. 対応するスラッシュコマンドを入力して起動（あるいは、自然言語で呼び出し）

---

## ライセンス

各スキルは MIT ライセンスで公開しています。

## リポジトリ

https://github.com/toiee-kameda/libehub-skills/
