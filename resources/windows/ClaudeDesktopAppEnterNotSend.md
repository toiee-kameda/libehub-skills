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

## さらに便利にするために

Ctrlキーは、今後多用する可能性があります（ショートカットキーとして）。この場合、Ctrlキーを押しやすい場所（Aキーの隣）に設定すると良いです。

多くのWindows PCの日本語キーボードは、Ctrlキーが、左下に小さく用意されています。一方で、Aキーの横には、ほぼ使わないCapsLockキーがあります（大文字を固定）。この２つを入れ替えると良いです。

### (1) PowerToys のインストール

1. Microsoft PowerToys を[公式サイトからダウンロード](https://learn.microsoft.com/en-us/windows/powertoys/)してインストールします
2. インストール後、PowerToys を起動します

### (2) キーボードマネージャーでリマップ

- PowerToys のメニューから「Keyboard Manager」を選ぶ
- 「Remap a key」（キーの再マップ）をクリック
- 「＋」ボタンで新しいマッピングを追加し、
  - 左側を CapsLock
  - 右側を Ctrl
- 「OK」「Apply」を実行

### (3) 自動起動の設定

PowerToys の「全般」設定で「起動時に実行する」を ON にすると、Windowsサインイン時から常にこのキー配置が有効になります。
