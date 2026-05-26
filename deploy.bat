@echo off
chcp 65001 > nul
title Деплой Терпилы на GitHub Pages

echo ===================================================
echo   ПОДГОТОВКА К ДЕПЛОЮ ПРИЛОЖЕНИЯ "ТЕРПИЛА"
echo ===================================================
echo.
echo Шаг 1. Инициализация Git-репозитория...
if not exist .git (
    git init
)

git add .
git commit -m "Deploy PWA version of Terpila"

echo.
echo ===================================================
echo Шаг 2. Создание репозитория на GitHub:
echo 1. Перейдите по ссылке: https://github.com/new
echo 2. Войдите в свой аккаунт GitHub.
echo 3. Введите название репозитория: terpila
echo 4. Оставьте его Public.
echo 5. НЕ ставьте галочку "Add a README file".
echo 6. Нажмите кнопку "Create repository".
echo ===================================================
echo.

:prompt_url
set /p repo_url="Вставьте ссылку на ваш новый репозиторий (например, https://github.com/имя/terpila.git): "

if "%repo_url%"=="" (
    echo Ссылка не может быть пустой!
    goto prompt_url
)

echo.
echo Шаг 3. Привязка удаленного репозитория...
git remote remove origin >nul 2>&1
git remote add origin %repo_url%
git branch -M main

echo.
echo Шаг 4. Отправка файлов на GitHub...
echo (Если потребуется, войдите в аккаунт во всплывающем окне Windows)
git push -u origin main -f

if %errorlevel% neq 0 (
    echo.
    echo [ОШИБКА] Не удалось отправить файлы на GitHub. Проверьте ссылку и авторизацию.
    pause
    exit /b
)

echo.
echo ===================================================
echo   ФАЙЛЫ УСПЕШНО ЗАГРУЖЕНЫ!
echo ===================================================
echo.
echo Последний шаг:
echo 1. Откройте ваш репозиторий на сайте GitHub.
echo 2. Перейдите во вкладку "Settings" (Настройки) сверху.
echo 3. В левом меню выберите раздел "Pages".
echo 4. В блоке "Build and deployment" под словом "Branch" выберите:
echo    - Вместо "None" выберите "main".
echo    - Папку оставьте "/ (root)".
echo 5. Нажмите кнопку "Save" (Сохранить).
echo.
echo Через 1-2 минуты ваше приложение будет доступно всему миру!
echo Ссылка появится прямо на этой странице сверху.
echo ===================================================
echo.
pause
