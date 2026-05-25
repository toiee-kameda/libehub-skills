#!/usr/bin/env python3
"""serve.py <js_file> <token> [port]

127.0.0.1 限定の CORS 対応・単一ファイル配信サーバ。
build_and_serve.sh から background 起動され、結合済み JS を 1 ファイルだけ配信する。

セキュリティ:
  - 127.0.0.1 のみにバインド（外部公開しない）
  - Origin 許可リスト（Substack のみ）を Access-Control-Allow-Origin にエコー（"*" は使わない）
  - ランダムトークン付きパス /post-<token>.js でのみ本体を配信（推測困難）
  - 90 秒の自己停止タイマー（停止し忘れ対策）
"""
import sys
import signal
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

JS_FILE = sys.argv[1]
TOKEN = sys.argv[2]
PORT = int(sys.argv[3]) if len(sys.argv) > 3 else 8765
PATH = "/post-" + TOKEN + ".js"
ALLOWED_ORIGIN = "https://ccwm.substack.com"
IDLE_TIMEOUT = 90  # 秒。停止し忘れの保険


class Handler(BaseHTTPRequestHandler):
    def _maybe_cors(self):
        # 許可 Origin のときだけエコー。curl ヘルスチェック（Origin なし）には付けない。
        if self.headers.get("Origin", "") == ALLOWED_ORIGIN:
            self.send_header("Access-Control-Allow-Origin", ALLOWED_ORIGIN)

    def do_OPTIONS(self):
        # 単純 GET では preflight は飛ばないが、念のため対応
        self.send_response(204)
        self._maybe_cors()
        self.send_header("Access-Control-Allow-Methods", "GET")
        self.end_headers()

    def do_GET(self):
        if self.path == "/ping":  # ヘルスチェック（Origin なし）は常に 200
            self.send_response(200)
            self.end_headers()
            self.wfile.write(b"ok")
            return
        if self.path != PATH:
            self.send_response(404)
            self.end_headers()
            return
        origin = self.headers.get("Origin", "")
        # ブラウザからの fetch（Substack Origin）と、Origin なし（localhost curl）のみ許可
        if origin not in ("", ALLOWED_ORIGIN):
            self.send_response(403)
            self.end_headers()
            return
        with open(JS_FILE, "rb") as f:
            body = f.read()
        self.send_response(200)
        self.send_header("Content-Type", "application/javascript; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self._maybe_cors()
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # ログ抑制


srv = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
# shutdown() は serve_forever とは別スレッドから呼ぶ必要がある（シグナルハンドラ直呼びはデッドロック）
signal.signal(signal.SIGTERM, lambda *a: threading.Thread(target=srv.shutdown).start())
# 自己停止タイマーは daemon にする（非 daemon だと serve_forever 終了後もプロセスが残り続ける）
_timer = threading.Timer(IDLE_TIMEOUT, srv.shutdown)
_timer.daemon = True
_timer.start()
srv.serve_forever()
