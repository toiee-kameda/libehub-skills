---
name: craft-whiteboard-excalidraw
description: |
  Craft のホワイトボードに Excalidraw 要素を追加・描画するときに必ず使うスキル。
  whiteboardElements_add を使う場面、Craft ホワイトボードに図を描く場面、
  Excalidraw の JSON を Craft に反映させる場面では常にこのスキルを参照すること。
  label 内包記法や cameraUpdate を使うと Craft でテキストが消えるため、
  このスキルの互換フォーマットに従う必要がある。
license: MIT
metadata:
  author: toieelab Kameda
  version: 1.0.0
  tags: [education, ai, coaching, ai-fluency, learning-by-doing]
---

# Craft ホワイトボード × Excalidraw 互換ガイド

## 背景・発見した問題

Craft のホワイトボードは Excalidraw を内蔵しているが、
**バージョンが古い**ため、Excalidraw の新しい記法に対応していない。

具体的に問題になるのは以下の2点：

| 問題の記法 | 症状 |
|---|---|
| シェイプへの `label` 内包 | テキストが**全消え**する |
| `cameraUpdate` 疑似要素 | エラー・警告の原因になる |

---

## ルール：使ってはいけない記法

### ❌ NG: `label` 内包記法（新しい Excalidraw 記法）

```json
{ "type": "rectangle", "id": "r1", "label": { "text": "顧客", "fontSize": 18 } }
{ "type": "arrow",     "id": "a1", "label": { "text": "① 注文", "fontSize": 16 } }
```

### ❌ NG: `cameraUpdate` 疑似要素

```json
{ "type": "cameraUpdate", "id": "cam1", "width": 800, "height": 600, "x": 0, "y": -10 }
```

---

## ルール：正しい互換記法

### ✅ OK: テキストを独立した `text` 要素として分離する

シェイプ側に `boundElements`、テキスト側に `containerId` で**双方向に紐付ける**。

#### 矩形の場合

```json
{
  "type": "rectangle",
  "id": "r_user",
  "x": 15, "y": 38, "width": 130, "height": 42,
  "backgroundColor": "#a5d8ff",
  "fillStyle": "solid",
  "strokeColor": "#4a9eed",
  "strokeWidth": 2,
  "roundness": { "type": 3 },
  "boundElements": [{ "id": "t_user", "type": "text" }]
},
{
  "type": "text",
  "id": "t_user",
  "containerId": "r_user",
  "x": 15, "y": 38, "width": 130, "height": 42,
  "text": "顧客",
  "fontSize": 18,
  "fontFamily": 1,
  "textAlign": "center",
  "verticalAlign": "middle",
  "strokeColor": "#1a5276"
}
```

**ポイント：** テキストの `x`,`y`,`width`,`height` はコンテナ矩形と同じ値にする。

#### 矢印ラベルの場合

```json
{
  "type": "arrow",
  "id": "a_m1",
  "x": 80, "y": 115, "width": 180, "height": 0,
  "points": [[0, 0], [180, 0]],
  "strokeColor": "#4a9eed",
  "strokeWidth": 2,
  "endArrowhead": "arrow",
  "boundElements": [{ "id": "t_m1", "type": "text" }]
},
{
  "type": "text",
  "id": "t_m1",
  "containerId": "a_m1",
  "x": 115, "y": 100, "width": 110, "height": 20,
  "text": "① 注文",
  "fontSize": 14,
  "fontFamily": 1,
  "textAlign": "center",
  "verticalAlign": "middle",
  "strokeColor": "#1a5276"
}
```

**ポイント：** テキストの `x` は矢印の中点付近に配置する（`arrow.x + width/2 - textWidth/2`）。

---

## テキスト位置の計算方法

### 矩形内テキスト
テキストの `x`,`y`,`width`,`height` = コンテナ矩形と同値でよい。
Excalidraw が `textAlign: center` / `verticalAlign: middle` に基づいて自動センタリングする。

### 矢印ラベル
矢印の中点に配置する：

```
midX = arrow.x + (points の dx の合計) / 2
midY = arrow.y + (points の dy の合計) / 2

text.x = midX - textWidth / 2
text.y = midY - 10  （矢印の少し上）
```

---

## 適用例：シーケンス図の場合

互換フォーマットの適用例として、シーケンス図でよく使う要素を示す。
他の図種（フローチャート、マインドマップ等）でも、基本ルール（独立 `text` + `containerId`）は同じ。

### アクター（矩形 + テキスト）

```json
{ "type": "rectangle", "id": "r_{name}",
  "x": {X}, "y": 38, "width": 130, "height": 42,
  "backgroundColor": "{COLOR_FILL}", "fillStyle": "solid",
  "strokeColor": "{COLOR_STROKE}", "strokeWidth": 2,
  "roundness": { "type": 3 },
  "boundElements": [{ "id": "t_{name}", "type": "text" }] },
{ "type": "text", "id": "t_{name}", "containerId": "r_{name}",
  "x": {X}, "y": 38, "width": 130, "height": 42,
  "text": "{ラベル}", "fontSize": 18, "fontFamily": 1,
  "textAlign": "center", "verticalAlign": "middle",
  "strokeColor": "{TEXT_COLOR}" }
```

### ライフライン（縦の点線）

```json
{ "type": "arrow", "id": "l_{name}",
  "x": {CENTER_X}, "y": 80, "width": 0, "height": 390,
  "points": [[0, 0], [0, 390]],
  "strokeColor": "#b0b0b0", "strokeStyle": "dashed",
  "strokeWidth": 1, "endArrowhead": null }
```

### メッセージ矢印（矢印 + テキスト）

```json
{ "type": "arrow", "id": "a_{msg}",
  "x": {FROM_X}, "y": {Y}, "width": {DX}, "height": 0,
  "points": [[0, 0], [{DX}, 0]],
  "strokeColor": "{COLOR}", "strokeWidth": 2,
  "strokeStyle": "solid",
  "endArrowhead": "arrow",
  "boundElements": [{ "id": "t_{msg}", "type": "text" }] },
{ "type": "text", "id": "t_{msg}", "containerId": "a_{msg}",
  "x": {FROM_X + DX/2 - textWidth/2}, "y": {Y - 15},
  "width": {textWidth}, "height": 20,
  "text": "{ラベル}", "fontSize": 14, "fontFamily": 1,
  "textAlign": "center", "verticalAlign": "middle",
  "strokeColor": "{TEXT_COLOR}" }
```

---

## Excalidraw `create_view` → Craft への変換チェックリスト

Excalidraw の `create_view` で図を描いた後、Craft の `whiteboardElements_add` に渡す前に確認：

- [ ] `label` プロパティがあるシェイプ → 独立した `text` 要素に分離
- [ ] `cameraUpdate` 要素 → **削除**する
- [ ] 各テキスト要素に `containerId` が設定されているか
- [ ] 各シェイプの `boundElements` にテキスト ID が含まれているか
- [ ] テキスト要素の `x`,`y` がコンテナ内に収まる位置か

---

## 注意事項

- `fontFamily: 1` は Excalidraw 標準フォント（Virgil）を指す
- `roughness: 1` がデフォルト。整った印象にしたい場合は `roughness: 0` を使う
- Craft の `whiteboardElements_add` は `id` が重複すると上書きされるため、
  同一ホワイトボードに追加する場合は**一意な ID** を使うこと
