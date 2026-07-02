@echo off
setlocal enabledelayedexpansion

rem 準備①:フォルダを作成して下さい。
rem 準備②:「〇〇_1」という基準ファイルを[準備①]フォルダに入れてください。
rem 準備③:このバッチを同じく[準備①]フォルダに入れてください。
rem 実行①:ダブルクリックで実行してください。

rem ---- 設定エリア（ここを変更してください） ----
rem 1. ファイルの「_1」より前の部分の名前
set "BASE_NAME=〇〇"

rem 2. ファイルの拡張子（ドットも含めてください）
set "EXT=.pdf"
rem --------------------------------------------

rem 設定から自動的に基準となるファイル名を作成
set "SRC_FILE=%BASE_NAME%_1%EXT%"

echo 処理を開始します。

rem 元ファイル（_1）が存在するかチェック
if not exist "%SRC_FILE%" (
    echo 【エラー】このフォルダ内に %SRC_FILE% が見つかりません。
    echo フォルダ名やファイル名、バッチの配置場所を確認してください。
    pause
    exit /b
)

echo 基準ファイル「%SRC_FILE%」をもとに複製中。

rem 基準の「_1」が既に存在するため、ループは「2から100まで」実行します
for /L %%i in (2,1,100) do (
    copy "%SRC_FILE%" "%BASE_NAME%_%%i%EXT%" >nul
)

echo.
echo 成功: 基準ファイルを含めて、合計100個のファイルが複製されました。
pause