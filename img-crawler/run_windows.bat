@echo off
chcp 65001 > nul
title 이미지 크롤러

echo 🖼️ 이미지 크롤러를 시작합니다...
echo.

REM Python 버전 확인
python --version > nul 2>&1
if errorlevel 1 (
    echo ❌ Python이 설치되지 않았거나 PATH에 추가되지 않았습니다.
    echo Python 3.8 이상을 설치하고 PATH에 추가해주세요.
    echo.
    pause
    exit /b 1
)

REM 의존성 설치 확인
echo 📦 의존성을 확인 중...
pip show PyQt5 > nul 2>&1
if errorlevel 1 (
    echo 📥 의존성을 설치 중입니다...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ 의존성 설치에 실패했습니다.
        pause
        exit /b 1
    )
)

REM 앱 실행
echo 🚀 이미지 크롤러를 실행합니다...
python main.py

REM 오류 시 일시정지
if errorlevel 1 (
    echo.
    echo ❌ 앱 실행 중 오류가 발생했습니다.
    pause
) 