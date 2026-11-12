---
name: substack-quick-fix
description: "Substackの編集画面（Tiptap/ProseMirror）で、指摘済みの誤字脱字などの修正リストをスクリーンショット操作なしで高速に反映するスキル。jp-checkの校正結果をSubstack下書きに適用するときなどに使う。"
license: MIT
metadata:
  author: toieelab Kameda
  version: '1.1.0'
  tags:
  - substack
  - editing
  - automation
  - browser
---

# Substack Quick Fix

Substackの編集画面はTiptap/ProseMirrorベースのcontenteditableエディタです。修正箇所を1件ずつ「スクリーンショットを撮る→文字を目視で探す→座標をクリック→入力する」というループで直すのは遅く、トークン消費も大きくなります。代わりに、JavaScriptで編集領域のDOMを直接操作し、ブラウザの標準的なテキスト入力コマンドを使って修正を反映します。この方法はProseMirrorの内部状態（トランザクション）ときちんと同期し、Substackの自動保存にも正しく反映されることを実機で検証済みです。

## 前提条件

- 対象のブラウザタブがSubstackの編集画面（URLが `https://<subdomain>.substack.com/publish/post/<id>` の形）であること
- Claude in Chrome のブラウザツールが使えること。ツール名は環境によって異なる（例: `mcp__claude-in-chrome__javascript_tool`、Chromeサイドパネルでは `mcp__claude-device__chrome_javascript_tool`）ので、名前を決め打ちせず、次の役割のツールを探して使う
  - JavaScript実行: 名前が `javascript_tool` で終わるもの
  - 通信の確認: 名前が `read_network_requests` で終わるもの
  - 見た目の確認: 名前が `computer` で終わるもの（`screenshot` アクション）
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

このあと手順4で自動保存を確認するため、**修正を適用する前に**通信確認ツール（`read_network_requests`）を一度呼んでおく（通信の記録はこのツールを最初に呼んだ時点から始まるため）。

### 2. 修正リストを整理する

各修正について、本文中で一意にマッチする検索文字列（`search`）と置換後の文字列（`replace`）を用意する。

- 検索文字列は前後の文字を含めて、本文中で1箇所にしか出現しないようにする（例: 単に「点」ではなく「残せる点が魅力」のように文脈を含める）。手順3のコードは出現回数を数え、1箇所でなければ置換せずに `ambiguous` として報告する
- 修正リストは上から順に適用される。先の修正で書き換わった箇所を、後の修正の検索文字列に含めないよう注意する
- **重要**: 検索文字列は「1つのテキストノード内」に収まっていなければならない。太字（`<strong>`）やリンクなどの書式タグの境界や、段落の境界をまたぐ文字列は、1つのテキストノードの中に存在しない。置換関数はテキストノードごとに検索するため一致を見つけられず、`not_found` になる。
  - 対処法: `not_found` になったら、まず対象付近のテキストノード構造を調べる。
    ```javascript
    const editor = document.querySelector('.tiptap.ProseMirror[contenteditable="true"]');
    const walker = document.createTreeWalker(editor, NodeFilter.SHOW_TEXT);
    let node, all = [];
    while (node = walker.nextNode()) all.push({text: node.nodeValue, parent: node.parentElement.tagName});
    all;
    // 対象キーワードを含む/前後のノードを確認し、ノード境界をまたがない範囲に検索文字列を狭める
    ```
  - 境界をまたぐ場合は、修正を「ノードA側の一部を直す操作」と「ノードB側の一部を直す操作」に分割する（例: 前のノード末尾のみ、後ろのノード先頭のみ、といった具合に）。

### 3. 置換を実行する

以下のコードを使い、修正リストを順番に適用する。1回のJS実行でまとめて処理してよい。

```javascript
// 本文全体での出現回数（テキストノードをまたぐ一致も数える）
function countOccurrences(text, search) {
  let count = 0, pos = 0;
  while ((pos = text.indexOf(search, pos)) !== -1) { count++; pos += search.length; }
  return count;
}

function replaceOnce(root, search, replace) {
  const total = countOccurrences(root.textContent, search);
  if (total === 0) return 'not_found';
  if (total > 1) return `ambiguous(${total}箇所)`;

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
      return document.execCommand('insertText', false, replace) ? 'ok' : 'execCommand_failed';
    }
  }
  // 本文には1箇所あるが、書式や段落の境界をまたいでいて1つのテキストノードに収まっていない
  return 'not_found(ノード境界をまたいでいる)';
}

const editor = document.querySelector('.tiptap.ProseMirror[contenteditable="true"]');
editor.focus();

const fixes = [
  ['誤字を含む一意な文脈', '修正後の一意な文脈'],
  // ... 続けて追加
];

const results = fixes.map(([search, replace]) => ({ search, replace, status: replaceOnce(editor, search, replace) }));
results;
```

`status` の意味と対応:

- `ok`: 置換成功
- `not_found`: 本文に存在しない。誤字の写し間違いがないか確認する
- `not_found(ノード境界をまたいでいる)`: 手順2の方法でテキストノード構造を調べ、検索文字列を狭めるか分割して再実行する
- `ambiguous(n箇所)`: 本文に複数あるため置換していない。前後の文脈を足して一意にしてから再実行する
- `execCommand_failed`: まれ。エディタにフォーカスが当たっているか確認して再実行する

### 4. 反映と保存の検証

リロードはしない。保存が終わる前にリロードすると、変更が失われるおそれがあるため。代わりに次の2点で確認する。

1. **エディタ内部の状態を確認する。** 画面の文字だけでなく、Tiptapの内部データに反映されているかを見る。

    ```javascript
    const editor = document.querySelector('.tiptap.ProseMirror[contenteditable="true"]');
    // Tiptap本体が参照できればその内部データを、できなければ画面上のテキストを使う
    const text = editor.editor ? editor.editor.state.doc.textContent : editor.textContent;
    const fixes = [ /* 手順3と同じリスト */ ];
    fixes.map(([search, replace]) => ({
      search,
      replaced: text.includes(replace),
      stillHasTypo: text.includes(search) && !replace.includes(search)
    }));
    ```

    すべて `replaced: true` かつ `stillHasTypo: false` であればよい。

2. **自動保存を確認する。** 修正の適用から数秒待ってから、通信確認ツール（`read_network_requests`）で `/api/v1/drafts/<id>` への `PUT` が `statusCode: 200` で記録されていることを確認する。記録が見当たらなければ、さらに数秒待って再確認する。

併せて `computer` ツールの `screenshot` アクションで見た目（太字などの書式が壊れていないか）を1回だけ確認する。全箇所を screenshot でいちいち探す必要はない — 検証は最後にまとめて1回でよい。

### 5. 完了報告

ユーザーには、何件中何件成功したか、失敗があれば原因（ノード境界をまたいだ、複数箇所に一致した等）と対応を簡潔に報告する。全文を貼り直す必要はない。

## 注意点・既知の制約

- `document.execCommand` は非推奨APIだが、2026年時点の主要ブラウザ（Chrome）では引き続き動作し、contenteditable系エディタ（Tiptap/ProseMirror、Slate等）が期待する `beforeinput`/`input` イベントを正しく発火させるため、DOM直接書き換え（`textContent` 代入など）より信頼性が高い。
- この技術はTiptap/ProseMirror系のエディタ全般に応用できるが、編集領域のセレクタ（`.tiptap.ProseMirror[contenteditable="true"]`）はSubstack向け。他のサービスに使う場合は手順1でセレクタを調べ直すこと。
- 記事本文以外（タイトル、サブタイトル、Description、タグなど）は本文とは別の要素になっている。タイトルとサブタイトルは contenteditable ではなく `textarea` で、空の要素（例: プレースホルダーが `Add a title...`）と値の入った要素（例: プレースホルダーが `タイトル`）が同時に存在することがある。値が入っている要素を選んで操作すること。
