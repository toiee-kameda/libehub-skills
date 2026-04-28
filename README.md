# libehub-skills

[リベハブ](https://ccwm.substack.com/) プロジェクトで制作・公開している Claude Code 用スキル集です。

> **リベハブ**（Liberal Education Hub）は、AIを活用した学びと教育をテーマにした Substack です。

---

## スキル一覧

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

### `/jp-check` — 日本語文章校正

日本語文章に対して**包括的な校正とフィードバック**を提供するスキルです。

- 誤字脱字・表記揺れ・文章の明確性・一貫性を4観点でチェック
- 重要度（高・中・低）付きの構造化レポートを出力
- ニュースレター・ブログ・技術文書など幅広い文書タイプに対応
- Front Matter や末尾注釈（toiee フォーマット）を自動スキップ

**使い方:** ファイルをアップロードして「校正してください」と依頼、または直接テキストを貼り付けて起動

[ダウンロード (jp-check.skill)](https://github.com/toiee-kameda/libehub-skills/raw/main/releases/jp-check.skill)

---

## インストール方法

1. 上記リンクから `.skill` ファイルをダウンロード
2. Claude の「カスタマイズ」→ 「スキル」→ 「+ボタン」 → 「スキルの作成」→「スキルをアップロード」で、`.skill` ファイルをアップロード
3. 対応するスラッシュコマンドを入力して起動（あるいは、自然言語で呼び出し）

---

## ライセンス

各スキルは MIT ライセンスで公開しています。

## リポジトリ

https://github.com/toiee-kameda/libehub-skills/
