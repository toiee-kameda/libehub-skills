# Claude Desktop App で、Enterキーで送信しない設定

Claude Desktop Appを活用する上で、「Enterキーで送信」は、誤送信することがあり、ストレスです。

日本語で、たくさんのコンテキストをすらすら書き込み、活用するには、Enterキーで改行、Shift+Enterで送信する設定に変更するのが一番です。

## 方法

1. AutoHotkeyをインストールする（ver2.0以後） [AutoHotkeyのWebサイト](https://www.autohotkey.com/)
2. 設定ファイルを適当な場所にダウンロード [設定ファイルのダウンロード](https://github.com/toiee-kameda/libehub-skills/raw/main/resources/windows/claude-desktop-app.ahk)
3. AutoHotkeyの設定ファイルを開き、Enterキーの動作を確認
4. Windows+Rで、`shell:startup`を入力し、AutoHotkeyの設定ファイルを保存する
5. 再起動後、Enterキーで送信しない設定が適用される

## 注意点: 漢字変換の確定方法が変わります

上記の設定をすると、漢字変換の「確定」が Enterキーでは、できなくなります。
以下の方法で確定をしてください

- 「Ctrl + m」で確定ができます（標準機能）
- 「Ctrl + Enter」で確定（もう一度、実行すると送信されてしまいます）

なお、Ctrl + m は、標準機能なので、他の場所でも使えます。Ctrl+mを習慣にしても問題ありません。
