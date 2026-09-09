---
name: substack-quick-fix
description: "Substackの編集画面（Tiptap/ProseMirror）で、指摘済みの誤字脱字などの修正リストをスクリーンショット操作なしで高速に反映するスキル。jp-checkの校正結果をSubstack下書きに適用するときなどに使う。"
license: MIT
metadata:
  author: toieelab Kameda
  version: 1.0.0
  tags: [substack, editing, automation, browser]
---

# Substack Quick Fix

Substackの編集画面はTiptap/ProseMirrorベースのcontenteditableエディタです。修正箇所を1件ずつ「スクリーンショットを撮る→文字を目視で探す→座標をクリック→入力する」というループで直すのは遅く、トークン消費も大きくなります。代わりに、JavaScriptで編集領域のDOMを直接操作し、ブラウザの標準的なテキスト入力コマンドを使って修正を反映します。この方法はProseMirrorの内部状態（トランザクション）ときちんと同期し、Substackの自動保存にも正しく反映されることを実機で検証済みです。

## 前提条件

- 対象のブラウザタブがSubstackの編集画面（URLが `https://<subdomain>.substack.com/publish/post/<id>` の形）であること
- `mcp__claude-in-chrome__javascript_tool`（およびナビゲーション確認用に `mcp__claude-in-chrome__navigate` や `mcp__claude-in-chrome__computer` のscreenshot）が使えること
- 適用したい「誤字→修正後」のペアのリストがあること（jp-checkの校正レポートなど）

## 手順

### 1. 編集領域を確認する

まず対象タブで編集領域（contenteditable要素）が存在し、想定した内容を含んでいることを確認する。

```javascript
const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
editables.map(el => ({
  tag: el.tagName,
  cls: el.className.slice(0, 120),
  textLen: el.textContent.length
}));
```

Substackの本文編集領域は通常 `class="tiptap ProseMirror"` を持つ `div[contenteditable="true"]`。これをセレクタ `.tiptap.ProseMirror[contenteditable="true"]` で取得する。

### 2. 修正リストを整理する

各修正について、本文中で一意にマッチする検索文字列（`search`）と置換後の文字列（`replace`）を用意する。

- 検索文字列は前後の文字を含めて、本文中で1箇所にしか出現しないようにする（例: 単に「点」ではなく「残せる点が魅力」のように文脈を含める）
- **重要**: 検索文字列は「1つのテキストノード内」に収まっていなければならない。太字（`<strong>`）やリンクなどの書式タグの境界をまたぐ文字列（例: 装飾の終わりと直後のスペースを含む範囲）は同じテキストノードにないことがあり、その場合は置換が失敗する（`execCommand` が `false` を返す）。
  - 対処法: 失敗したら、まず対象付近のテキストノード構造を調べる。
    ```javascript
    const editor = document.querySelector('.tiptap.ProseMirror[contenteditable="true"]');
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node, all = [];
    while (node = walker.nextNode()) all.push({text: node.nodeValue, parent: node.parentElement.tagName});
    // 対象キーワードを含む/前後のノードを確認し、ノード境界をまたがない範囲に検索文字列を狭める
    ```
  - 境界をまたぐ場合は、修正を「ノードA側の一部を直す操作」と「ノードB側の一部を直す操作」に分割する（例: 前のノード末尾のみ、後ろのノード先頭のみ、といった具合に）。

### 3. 置換を実行する

以下の関数を使い、修正リストを順番に適用する。1回のJS実行でまとめて処理してよい。

```javascript
function replaceOnce(root, search, replace) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node;
  while (node = walker.nextNode()) {
    const idx = node.nodeValue.indexOf(search);
    if (idx !== -1) {
      const range = document.createRange();
      range.setStart(node, idx);
      range.setEnd(node, idx + search.length);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      return document.execCommand('insertText', false, replace);
    }
  }
  return false; // 見つからなかった、またはノード境界をまたいでいる
}

const editor = document.querySelector('.tiptap.ProseMirror[contenteditable="true"]');
editing: editor.focus();

const fixes = [
  ['誤字を含む一意な文脈', '修正後の一意な文脈'],
  // ... 続けて追加
];

const results = fixes.map(([search, replace]) => ({ search, replace, ok: replaceOnce(editor, search, replace) }));
results;
```

`ok: false` が返った項目は手順4の方法で個別に調査し、検索文字列を調整して再実行する。

### 4. 保存とページ内容の検証

Substackは自動保存だが、確実性のためページをリロードして修正が保持されているか確認する。

```javascript
// リロード後
const editor = document.querySelector('.tiptap.ProseMirror[contenteditable="true"]');
const text = editor.textContent;
// 各修正について「修正後の文字列が含まれる」かつ「誤字が含まれない」ことをチェック
```

併せて `mcp__claude-in-chrome__computer` の `screenshot` アクションで見た目（太字などの書式が壊れていないか）を1回だけ確認する。全箇所を screenshot でいちいち探す必要はない — 検証は最後にまとめて1回でよい。

### 5. 完了報告

ユーザーには、何件中何件成功したか、失敗があれば原因（ノード境界をまたいだ等）と対応を簡潔に報告する。全文を貼り直す必要はない。

## 注意点・既知の制約

- `document.execCommand` は非推奨APIだが、2026年時点の主要ブラウザ（Chrome）では引き続き動作し、contenteditable系エディタ（Tiptap/ProseMirror、Slate等）が期待する `beforeinput`/`input` イベントを正しく発火させるため、DOM直接書き換え（`textContent` 代入など）より信頼性が高い。
- この技術はTiptap/ProseMirror系のエディタ全般に応用できるが、編集領域のセレクタ（`.tiptap.ProseMirror[contenteditable="true"]`）はSubstack向け。他のサービスに使う場合は手順1でセレクタを調べ直すこと。
- 検索文字列が本文中に複数回出現する場合、最初に見つかったノードのみが置換される点に注意（`replaceOnce` は最初の一致のみ処理する）。曖昧な場合は前後の文脈を増やして一意にする。
- 記事本文以外（タイトル、Description、タグなど）を編集する場合は、それぞれ別のcontenteditable/input要素になっているため、対象要素を都度確認すること。