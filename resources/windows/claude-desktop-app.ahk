#Requires AutoHotkey v2

; Claude Desktop のウィンドウがアクティブなときだけ有効にする
#HotIf WinActive("ahk_exe Claude.exe") ; ←実際の exe 名は確認して変更

; Enter を Shift+Enter に置き換え（= 改行）
Enter::
{
    Send "+{Enter}"
    return
}

; Ctrl+Enter は本来の Enter（= 送信）
^Enter::
{
    Send "{Enter}"
    return
}
#HotIf