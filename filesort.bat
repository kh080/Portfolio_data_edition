@echo off
setlocal enabledelayedexpansion

rem 準備①:仕分けたいファイルが入っているフォルダの中に、このバッチファイルを直接入れてください。
rem 実行①:ダブルクリックして実行してください。
rem 実行②:自動で「[共通単語]まとめ」フォルダが作られ、ファイルが仕訳けられます。

rem ---- 設定 ----
set "DELIM=_"
rem --------------

echo 区切り文字「%DELIM%」を基準に共通単語を自動検出し、
echo 「[共通単語]まとめ」フォルダを作成して仕分けます
echo --------------------------------------------------

set "COUNT=0"

for %%F in (*) do (
    if not exist "%%F\" (
        if not "%%~nxF"=="%~nx0" (
            
            set "FILE_NAME=%%~nF"
            
            echo(!FILE_NAME!| findstr "%DELIM%" >nul
            if !errorlevel! equ 0 (
                
                for /f "tokens=1 delims=%DELIM%" %%A in ("%%~nF") do (
                    set "WORD=%%A"
                )
                
                set "NEW_DIR=!WORD!まとめ"
                
                if not exist "!NEW_DIR!" (
                    mkdir "!NEW_DIR!"
                )
                
                rem 移動先に同名ファイルが「ない」場合のみ移動する
                if not exist "!NEW_DIR!\%%~nxF" (
                    move "%%F" "!NEW_DIR!\" >nul
                    echo   [-^>] %%~nxF を移動しました
                    set /a COUNT+=1
                ) else (
                    echo   [スキップ] %%~nxF は既に移動先に存在します
                )
            )
        )
    )
)

echo --------------------------------------------------
rem 結果で表示分け
if %COUNT% equ 0 (
    echo 仕分け対象のファイルは存在しませんでした。
) else (
    echo 処理が完了しました。仕分けたファイル数: %COUNT% 個
)
echo.
pause