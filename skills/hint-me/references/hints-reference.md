# hint-me ヒント集

> hint-me スキルのリファレンスファイル。Claude はこのファイルを参照してヒントを選ぶ。

---

## インデックス（全ヒントID一覧）

**出力形式:**
output-markdown, output-word, output-excel, output-pptx, output-pdf, output-code-exec

**ビジュアル:**
visual-diagram, visual-mermaid, visual-graph, visual-svg

**思考・推論:**
think-interview, think-stepbystep, think-critique, think-deepresearch

**構造化プロンプト:**
structure-xml, structure-format, structure-role

**記憶・検索:**
memory-remember, memory-search

**文体・スタイル:**
style-natural, style-tone, style-prohibit

**反復・改善:**
iterate-artifact, iterate-variants, iterate-publish

**アプリ作成:**
app-interactive, app-claude-in-claude, app-persistent

**プラットフォーム機能:**
feature-file-upload, feature-image-upload, feature-github,
feature-project, feature-connectors, feature-pin,
feature-chat-search, feature-skills, feature-models

**ワークフロー設計:**
workflow-ai-mapping

**Diligence（責任・検証）:**
diligence-bias-check, diligence-assumption, diligence-disclosure,
diligence-factcheck, diligence-second-opinion

---

## 4D Framework 別インデックス

> 各ヒントの主要4Dカテゴリ。hint-me はこのインデックスを使って、ユーザーの弱い4Dに対応するヒントを優先して選ぶ。

**Delegation（ツール・手段の選択）:**
workflow-ai-mapping,
think-deepresearch, memory-remember, feature-project, feature-skills,
feature-models, feature-connectors, app-claude-in-claude, app-persistent,
feature-file-upload, feature-image-upload, feature-github, feature-pin, feature-chat-search

**Description（AIへの伝え方）:**
output-markdown, output-word, output-excel, output-pptx, output-pdf, output-code-exec,
visual-diagram, visual-mermaid, visual-graph, visual-svg,
think-interview, think-stepbystep,
structure-xml, structure-format, structure-role,
style-natural, style-tone, style-prohibit,
iterate-artifact, iterate-variants

**Discernment（出力の評価・改善）:**
think-critique, iterate-variants, iterate-artifact, feature-chat-search,
diligence-factcheck, diligence-second-opinion

**Diligence（責任・透明性・検証）:**
iterate-publish, diligence-bias-check, diligence-assumption,
diligence-disclosure, diligence-factcheck, diligence-second-opinion

---

## hint: output-markdown
- category: 出力形式
- 4d_framework: [Description]
- tags: [ファイル生成, ドキュメント, ダウンロード]
- use_case: [記事執筆, 仕様書, ドキュメント整理]

`Markdownファイルで` と指示するとダウンロード可能な `.md` ファイルを生成する。記事・ドキュメント・仕様書などに使える。

**例：**「このコンテンツをMarkdownファイルで保存して」

---

## hint: output-word
- category: 出力形式
- 4d_framework: [Description]
- tags: [ファイル生成, ビジネス文書, ダウンロード]
- use_case: [提案書, レポート, ビジネス文書]

`Wordファイル(.docx)で` と指示すると見出し・表・ページ番号付きの Word 文書を生成する。目次・ヘッダー・フッター・スタイルも設定可能。

**例：**「この内容をWordファイルで提案書として作成して」

---

## hint: output-excel
- category: 出力形式
- 4d_framework: [Description]
- tags: [ファイル生成, データ, ダウンロード]
- use_case: [データ分析, 集計表, 予算管理]

`Excelファイル(.xlsx)で` と指示すると数式・グラフ・複数シート付きの Excel ファイルを生成する。条件付き書式・グラフも含められる。

**例：**「この売上データをExcelファイルで集計表にして」

---

## hint: output-pptx
- category: 出力形式
- 4d_framework: [Description]
- tags: [ファイル生成, プレゼン, ダウンロード]
- use_case: [プレゼン資料, ピッチデッキ, 勉強会資料]

`PowerPointファイル(.pptx)で` と指示すると実際のスライドデッキを生成する。スライドレイアウト・グラフ・画像配置まで可能。

**例：**「この内容を10枚のスライドにしてPowerPointで」

---

## hint: output-pdf
- category: 出力形式
- 4d_framework: [Description]
- tags: [ファイル生成, ダウンロード]
- use_case: [請求書, 配布資料, フォーム]

`PDFで` と指示するとフォーマット済みPDFを生成・ダウンロードできる。日本語フォントを指定すると文字化けを防げる。

**例：**「この請求書をPDFファイルとして作成して」

---

## hint: output-code-exec
- category: 出力形式
- 4d_framework: [Description, Delegation]
- tags: [コード実行, データ処理, ファイル生成]
- use_case: [データ分析, CSV処理, グラフ作成]

`コードを実行して` と指示するとPythonコードを実際に実行し、CSV分析・グラフ生成・計算を行う。アップロードしたデータを直接処理できる。「ファイルを作成して」と組み合わせると成果物もダウンロード可能。

**例：**「このCSVをアップロードして → コードを実行して売上トレンドを分析して」

---

## hint: visual-diagram
- category: ビジュアル
- 4d_framework: [Description]
- tags: [図解, SVG, HTML, インライン表示]
- use_case: [フロー説明, アーキテクチャ, 概念整理]

`図解して` と指示するとインタラクティブなSVG/HTMLダイアグラムをチャット内にインラインで表示する。「フローチャートで」「アーキテクチャ図で」なども同様に機能する。

**例：**「認証フローを図解して」「このアーキテクチャを図解して」

---

## hint: visual-mermaid
- category: ビジュアル
- 4d_framework: [Description, Delegation]
- tags: [Mermaid, フローチャート, 互換性]
- use_case: [Notion連携, GitHub連携, Obsidian連携, フロー設計]

`Mermaidで図にして` と指示するとMermaid記法でフローチャート・シーケンス図・ER図などを生成する。Notion・GitHub・Obsidianと互換性があるため、そのまま貼り付けて使える。

**例：**「ユーザー登録フローをMermaidのシーケンス図で」

---

## hint: visual-graph
- category: ビジュアル
- 4d_framework: [Description]
- tags: [グラフ, データビズ, インタラクティブ]
- use_case: [データ分析, 数値比較, トレンド表示]

`グラフで可視化して` と指示するとインタラクティブなデータグラフをチャット内に生成する（棒・折れ線・散布図・ヒートマップ等）。CSVやJSONを貼り付けると自動グラフ化。「インタラクティブに」を追加するとスライダー・フィルター付きになる。

**例：**「このデータをインタラクティブな棒グラフで可視化して」

---

## hint: visual-svg
- category: ビジュアル
- 4d_framework: [Description]
- tags: [SVG, ベクター, イラスト, ダウンロード]
- use_case: [アイコン作成, ロゴ素材, 図形生成]

`SVGで描いて` と指示するとスケーラブルなベクターイラスト・アイコン・図形を生成する。ダウンロードして他のツールで編集可能。

**例：**「会社のロゴのプレースホルダーをSVGで作って」

---

## hint: think-interview ⭐ 見過ごされがち
- category: 思考・推論
- 4d_framework: [Description, Discernment]
- tags: [インタビュー, アイデア構造化, 見落とし防止, 上級]
- use_case: [記事執筆, 戦略立案, システム設計, コース設計]

`まず私にインタビューして` と指示するとタスク実行前に不明点・考慮事項・トレードオフをClaudeが質問してくれる。頭の中でぼんやりしたままのアイデアを構造化する際に絶大な効果がある。Claudeが質問することで、見落としていた読者視点や構成上の欠陥が浮き上がる。

**例：**「リベハブのサービス紹介記事を書きたい。まず私にインタビューして」

---

## hint: think-stepbystep
- category: 思考・推論
- 4d_framework: [Description]
- tags: [Chain-of-Thought, 精度向上, 論理]
- use_case: [数学, バグ解析, 意思決定, 要件整理]

`ステップバイステップで考えて` と指示するとChain-of-Thought推論を明示的に起動し、正確さが向上する。数学・ロジック・複雑な意思決定で特に効果的。「まず〇〇を確認し、次に…、最後に結論を」と段階を明示するとさらに精度が上がる。

**例：**「ステップバイステップで考えて、この要件の問題点を洗い出して」

---

## hint: think-critique
- category: 思考・推論
- 4d_framework: [Discernment]
- tags: [批判的思考, リスク, 中立分析]
- use_case: [戦略検討, ビジネスプラン評価, 意思決定]

`反論・批判的視点も含めて` と指示すると賛成意見に加え、懸念点・リスク・反論を必ず含めるよう動く。Claudeは迎合しがちなので、明示的に「悪い点も教えて」「批判的な視点も」と入れると中立な分析になる。

**例：**「このビジネスプランの良い点と悪い点、両方を批判的に評価して」

---

## hint: think-deepresearch
- category: 思考・推論
- 4d_framework: [Delegation]
- tags: [Deep Research, Web調査, レポート]
- use_case: [市場調査, 技術調査, プロダクト比較]

`深い調査をして（Deep Research）` と指示すると複数のWebソースを横断調査して詳細なレポートを生成する。Proプランで「Deep Research」モードが利用可能。

**例：**「日本のAIリテラシー教育市場を深く調査してレポートにまとめて」

---

## hint: structure-xml ⭐ 見過ごされがち
- category: 構造化プロンプト
- 4d_framework: [Description]
- tags: [XML, 再現性, 複雑な指示, 上級]
- use_case: [コース設計, 仕様書作成, 複雑なタスク指示]

`XMLタグで構造化して` と指示するかXMLタグを使ってプロンプトを書くと、Claudeはトレーニング上XMLタグを認識するよう設計されているため再現性が段違いに上がる。複雑な指示を一度に渡すときに特に効果的。

**例：**
```xml
<task>記事を書く</task>
<context>対象読者はAI初心者</context>
<constraints>800字以内、専門用語なし</constraints>
```

---

## hint: structure-format
- category: 構造化プロンプト
- 4d_framework: [Description]
- tags: [Few-shot, テンプレート, 出力形式指定]
- use_case: [定型出力, レポート, 繰り返しタスク]

具体的な出力形式（テンプレート）を示すと忠実に従う。「こういう形式で」と言うより実際に例を見せる方が効果的（Few-shot prompting）。JSON形式・特定のMarkdown構造・表形式なども同様。

**例：**
```
「以下のフォーマットで出力して:
# タイトル
## 課題
## 解決策
## 次のアクション」
```

---

## hint: structure-role
- category: 構造化プロンプト
- 4d_framework: [Description]
- tags: [役割設定, ペルソナ, 精度向上]
- use_case: [専門的な分析, コンサルティング, レビュー]

`専門家として振る舞って` と詳細な役割・背景・視点を指定するほど応答の質が上がる。役割＋背景＋態度の3点セットで指定するのが効果的。「専門家として」だけでは効果が薄い。

**例：**「SaaSのグロースハッカーとして、B2C向けではなくB2B SMB向けに特化した観点でコメントして」

---

## hint: memory-remember
- category: 記憶・検索
- 4d_framework: [Delegation]
- tags: [記憶, 設定保存, 会話をまたぐ]
- use_case: [文体設定, 好みの固定, ルール設定]

`これを記憶して / 覚えておいて` と指示すると会話をまたいで記憶する情報をClaudeに伝えられる。Settings → Memory で確認・削除も可能。

**例：**「私のアウトプットは常に体験→驚き→仕組みの順で書いて。これを記憶して」

---

## hint: memory-search
- category: 記憶・検索
- 4d_framework: [Delegation, Discernment]
- tags: [過去会話, 文脈引き継ぎ, 検索]
- use_case: [継続プロジェクト, 以前の決定を参照]

`過去の会話を検索して` と指示すると以前の会話内容を検索・参照する能力を起動する。「以前〇〇について話したことを参考に」と言うとClaudeが過去のチャットを検索して文脈を引き継ぐ。

**例：**「以前議論したリベハブのコース構成を参考に、今回の記事を書いて」

---

## hint: style-natural
- category: 文体・スタイル
- 4d_framework: [Description, Discernment]
- tags: [AI臭さ除去, 自然な文章, リライト]
- use_case: [記事執筆, ニュースレター, SNS投稿]

`AI臭さを消して / 人間らしく書き直して` と指示すると典型的なAI文体（箇条書き多用・過度な構造化・定型表現）を排除する。「まず〜」「次に〜」「重要なのは〜」などのAI定型表現を避け、自然な文章に近づける。

**例：**「この文章のAI臭さを消して、自然な語り口に書き直して」

---

## hint: style-tone
- category: 文体・スタイル
- 4d_framework: [Description]
- tags: [文体模倣, トーン指定, 著者スタイル]
- use_case: [記事執筆, ブランドボイス, コンテンツ制作]

`〇〇の文体・トーンで書いて` と指示すると特定の著者・メディア・文体を参考に文章を生成する。具体的な媒体名・著者名・文体特徴を複数指定するほど精度が上がる。

**例：**「ポール・グレアムのエッセイのように、短い段落・断言調・実例多用で書いて」

---

## hint: style-prohibit
- category: 文体・スタイル
- 4d_framework: [Description]
- tags: [禁止語, 表現制御, 品質管理]
- use_case: [陳腐な表現の排除, ブランド文章管理]

`禁止語リストを与える` と絶対に使ってほしくない単語・表現を事前にリストアップできる。「画期的」「革新的」「シームレス」などの陳腐な表現を排除するのに有効。

**例：**「「驚異的」「革命的」「パワフル」という言葉は使わずに書いて」

---

## hint: iterate-artifact
- category: 反復・改善
- 4d_framework: [Description, Discernment]
- tags: [アーティファクト編集, 差分更新, 高速化]
- use_case: [コード修正, 文書改訂, UI調整]

`このアーティファクトを編集して` と指示すると生成済みのアーティファクトを全体再生成せず差分で高速編集できる。コンテキストを再説明せずに修正依頼できる。

**例：**「さっき作ったReactコンポーネントにエラーハンドリングを追加して」

---

## hint: iterate-variants
- category: 反復・改善
- 4d_framework: [Description, Discernment]
- tags: [バリエーション, A/Bテスト, 比較検討]
- use_case: [タイトル案, コピーライティング, デザイン検討]

`複数バリエーションを作って` と指示すると同一コンテンツの複数バリエーションを一度に生成する。その後「2番目のトーンを維持しつつ内容を修正して」と指定バリエーションを絞り込める。

**例：**「このSubstackのタイトルを5パターン作って、それぞれトーンを変えて」

---

## hint: iterate-publish
- category: 反復・改善
- 4d_framework: [Diligence]
- tags: [公開URL, 共有, プロトタイプ]
- use_case: [チーム共有, クライアントへのデモ, プロトタイプ共有]

アーティファクトの「Publish」ボタンを使うとClaudeアカウント不要の公開URLで共有できる。チーム・クライアントへのプロトタイプ共有に使える。

**操作：** HTMLダッシュボード生成後 → 右下「Publish」ボタン → URLをSlack等で共有

---

## hint: app-interactive
- category: アプリ作成
- 4d_framework: [Delegation, Description]
- tags: [インタラクティブ, React, スライダー, ツール作成]
- use_case: [計算ツール, シミュレーター, ダッシュボード]

`インタラクティブなアプリ/ツールを作って` と指示するとスライダー・ボタン・入力フォーム付きのフルインタラクティブアプリをチャット内に生成する。Recharts（グラフ）・Three.js（3D）・D3（データビズ）等のライブラリも使える。

**例：**「複利計算機を作って、元本・金利・年数のスライダー付きで」

---

## hint: app-claude-in-claude ⭐ 見過ごされがち
- category: アプリ作成
- 4d_framework: [Delegation]
- tags: [Claude API, AIアプリ, Wowモーメント, 上級]
- use_case: [チャットbot, 文章生成ツール, AIツール体験]

`Claude in ClaudeアプリをAnthropicAPI経由で作って` と指示するとアーティファクト内から実際のClaude APIを呼び出すAIアプリを生成できる。APIキー不要（claude.ai内で自動認証）。チャットbot UI・文章生成ツール・分析ダッシュボードなど実用アプリを数分で構築可能。

**例：**「Substack記事のアイデア生成ツールをClaude API付きで作って」

---

## hint: app-persistent
- category: アプリ作成
- 4d_framework: [Delegation]
- tags: [永続データ, ストレージ, セッション横断]
- use_case: [日記アプリ, タスクリスト, 学習記録]

`永続データを保存するアプリで` と指示するとセッションをまたいでデータが保持されるアーティファクトを生成する。`window.storage` APIを使ったキーバリューストレージが利用可能。ページを閉じてもデータが残るアプリが作れる。

**例：**「毎日の振り返りを記録できる日記アプリを、データが永続するように作って」

---

## hint: feature-file-upload
- category: プラットフォーム機能
- 4d_framework: [Delegation]
- tags: [ファイルアップロード, PDF, Excel, 文書処理]
- use_case: [契約書分析, 会議メモ整理, データ分析, 論文要約]

チャット入力欄の「+」ボタンからPDF・Word・Excel・CSV・テキスト・コードファイルをアップロードすると、Claudeが内容を丸ごと読み込んで処理する。

**活用例：** 契約書のリスク抽出・会議メモからアクション整理・CSVの分析可視化・複数資料の横断比較

---

## hint: feature-image-upload
- category: プラットフォーム機能
- 4d_framework: [Delegation]
- tags: [画像, スクリーンショット, OCR, ビジョン]
- use_case: [グラフ解説, UIフィードバック, 手書きメモ文字起こし, スライドテキスト化]

PNG/JPG/WebP等の画像をアップロードするとClaudeがその内容を「見て」理解して処理する。スクリーンショット・写真・グラフ・スライド・手書きメモすべて対応。

**活用例：** グラフのトレンド解説・UIのUXフィードバック・名刺の文字起こし・黒板写真の議事録化

---

## hint: feature-github
- category: プラットフォーム機能
- 4d_framework: [Delegation]
- tags: [GitHub, コードベース, プロジェクト連携]
- use_case: [コードレビュー, 実装相談, ドキュメント自動生成, バグ調査]

プロジェクト機能のナレッジセクションからGitHubリポジトリを読み込ませるとコードベース全体をClaudeの「知識」として参照できる。

**注意：** 大規模リポジトリは「Configure files」で必要なファイルのみを選択するのが推奨。

---

## hint: feature-project
- category: プラットフォーム機能
- 4d_framework: [Delegation]
- tags: [プロジェクト, ワークスペース, 文脈共有, ナレッジ]
- use_case: [ブログ執筆, コード開発, 学習研究, 顧客対応]

プロジェクト機能を使うと同一テーマの会話・資料・指示を一か所に集約できる。プロジェクト内では文脈が共有されるため、毎回の説明が不要になる。「プロジェクト指示」でClaudeへの恒久的な役割・ルールを設定できる。

---

## hint: feature-connectors
- category: プラットフォーム機能
- 4d_framework: [Delegation]
- tags: [コネクタ, 外部連携, 自動化]
- use_case: [Gmail整理, Slack分析, Notion更新, Google Drive活用, Canva連携, Craft連携]

コネクタはClaudeと外部ツールをつなぐワンクリック連携機能。Google Drive・Gmail・Slack・Notion・GitHub・Canva・Craftなど50以上が利用可能（Proプラン以上）。複数コネクタを組み合わせた複合ワークフローも可能。

---

## hint: feature-pin
- category: プラットフォーム機能
- 4d_framework: [Delegation]
- tags: [ピン, スター, クイックアクセス]
- use_case: [定型会話の固定, 進行中プロジェクト, 重要参照会話]

会話一覧でスター★アイコンをクリックするとサイドバー上部に固定表示される。繰り返し使う「定型会話の起点」や進行中プロジェクトをピン留めしておくと毎回そこを起点に始められる。

---

## hint: feature-chat-search
- category: プラットフォーム機能
- 4d_framework: [Delegation, Discernment]
- tags: [過去会話検索, RAG, 文脈引き継ぎ, Pro機能]
- use_case: [継続プロジェクト, 以前の決定参照, 長期作業]

「Search and reference chats」機能（Proプラン以上）で過去の会話をRAGで検索し、新しいチャットで文脈として参照できる。自然な言葉で依頼するだけで機能する。ChatGPTと異なり、Claudeは**明示的に指示されたときだけ**過去を検索する設計（エコーチェンバー防止）。

---

## hint: feature-skills
- category: プラットフォーム機能
- 4d_framework: [Delegation]
- tags: [スキル, 再現性, カスタム化, 自動化]
- use_case: [繰り返しタスク, 定型フォーマット出力, 業務自動化]

スキルは「Claudeが特定のタスクをこなすための手順書」を1フォルダにまとめたもの。SKILL.mdに指示・手順・使用ツールを記述してClaudeに読み込ませると、再現性の高い高品質なアウトプットを毎回得られる。「繰り返し同じフォーマットで出力したいもの」をスキル化すると指示コストがゼロになる。

---

## hint: feature-models
- category: プラットフォーム機能
- 4d_framework: [Delegation]
- tags: [モデル選択, Opus, Sonnet, Haiku, Adaptive Thinking]
- use_case: [タスクに応じた使い分け, コスト最適化]

入力欄左側のモデル名をクリックして切り替えられる。Haiku（短い返答・高頻度繰り返し）・Sonnet（通常のほぼすべてのタスク、デフォルト）・Opus（複雑な戦略立案・大規模エージェントタスク）の3段階。「Adaptive Thinking」スイッチをONにすると内部推論を実行（数学・論理・バグ解析に有効、トークン消費大）。

---

## hint: workflow-ai-mapping ⭐ 見過ごされがち
- category: ワークフロー設計
- 4d_framework: [Delegation, Description]
- tags: [プロセス設計, AI活用計画, 仕事の分解, 上級]
- use_case: [記事執筆, コース設計, 提案書作成, プロジェクト計画, 業務改善]

`〇〇のワークフローをステップで教えて。各ステップでAIをどう使えるか、具体的なプロンプト例も含めて提案して` と依頼すると、業務プロセス全体を俯瞰したAI活用マップが得られる。機能の使い方を知っていても「どこに使うか」で迷っているときに特に効果的。各ステップへの役割分担を設計することが Delegation の本質であり、このヒントはその出発点になる。

**例：**「Substackニュースレターの執筆プロセスをステップで教えて。各ステップでClaudeをどう活用できるか、プロンプト例も付けて提案して」

**応用：**「私はすでに〇〇と△△のステップは自分でやっている。残りのステップでClaudeを使うとしたらどこが効果的？」と現状を踏まえた絞り込みも可能。

---

## hint: diligence-bias-check
- category: Diligence（責任・検証）
- 4d_framework: [Diligence]
- tags: [バイアス, 死角, セルフレビュー]
- use_case: [記事公開前, 教育コンテンツ, 戦略文書]

`この文章に偏りや見落とした視点はないか確認して` と依頼すると、Claudeが自分の出力のバイアス・死角を能動的に指摘する。公開前のセルフレビューや、特定の立場に偏りがちな戦略文書の点検に使える。

**例：**「この記事に偏りや見落とした視点はないか、批判的な読者の目線で確認して」

---

## hint: diligence-assumption
- category: Diligence（責任・検証）
- 4d_framework: [Diligence, Discernment]
- tags: [前提の明示化, 暗黙の仮定, 設計判断]
- use_case: [戦略立案, システム設計, コース設計, 意思決定]

`この回答で前提にしていることを列挙して` と依頼すると、Claudeが暗黙に置いた前提を明示する。特に戦略立案・設計判断の場面で「なぜその結論になったか」の根拠を可視化でき、前提ミスを表面化できる。

**例：**「この設計案で前提にしていることをすべて列挙して。それぞれが覆ったとき設計がどう変わるかも教えて」

---

## hint: diligence-disclosure
- category: Diligence（責任・検証）
- 4d_framework: [Diligence]
- tags: [AI使用開示, 透明性, 読者への説明責任]
- use_case: [Substack記事, 教育コンテンツ, レポート公開, ブログ投稿]

`このコンテンツのAI使用開示文を書いて` と依頼すると、Substackや教育コンテンツ向けの適切な開示文を生成する。どこまでAIを使ったかを読者・受講者に正直に伝えるための文章を数秒で用意できる。業界や媒体に合わせたトーンも指定可能。

**例：**「この記事のAI使用開示文を、Substackの読者向けに自然な語り口で書いて」

---

## hint: diligence-factcheck ⭐ 見過ごされがち
- category: Diligence（責任・検証）
- 4d_framework: [Diligence, Discernment]
- tags: [ファクトチェック, ハルシネーション, 要確認フラグ, 上級]
- use_case: [記事公開前, 技術文書, 教育コンテンツ, データを含む出力]

`この内容のファクトチェックをして。不確かな箇所には【要確認】とフラグを立てて` と依頼すると、Claudeが自分の出力を再評価して検証が必要な箇所を列挙する。**さらに精度を上げたい場合は、成果物を新しいチャット（またはGemini・ChatGPT等の別AIツール）に貼り付けて同じ確認を依頼するのが効果的。**同一チャット内では文脈バイアスがかかるため、外部の目でのクロスチェックが公開前の最終関門になる。

**例：**「この記事の内容をファクトチェックして。自信がない箇所には【要確認】を付けて」
**クロスチェック例：**新しいチャットを開き「以下の文章で事実確認が必要な箇所を指摘して」と貼り付ける。または同じ文章をGemini等に確認させて結果を比較する。

---

## hint: diligence-second-opinion ⭐ 見過ごされがち
- category: Diligence（責任・検証）
- 4d_framework: [Diligence, Discernment]
- tags: [セカンドオピニオン, 別AI活用, クロスチェック, 上級]
- use_case: [重要な意思決定, 戦略文書, 技術設計, 公開前最終確認]

同じ問い・成果物を**別の新しいチャット（またはGemini・ChatGPT等の別AIツール）**に投げて比較する手法。同一チャット内ではClaudeが文脈に引きずられた回答をするため、新規チャットや別AIからの「第三者視点」が重要な判断の精度を大きく上げる。AIごとに学習データや推論の癖が違うため、複数の視点を束ねることで盲点が減る。

**実践フロー：**
1. 現在のチャットで成果物・結論を生成する
2. 新しいチャットを開き「以下を批判的に評価して」と貼り付ける（文脈を渡さない）
3. 余裕があればGeminiやChatGPTにも同じ文章を投げて観点を比較する
4. 差異が出た箇所が「本当に検討すべき論点」

**例：**「このコース設計案を、前の会話を知らない状態で批判的に評価して」（新チャットで）