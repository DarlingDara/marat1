# Сайт Леонида — Cloudflare Pages

Это оригинальный сайт из `volkov_site_telegram_diagnostic_full.zip`, с сохранением разметки и стилей. `index.html` находится в корне репозитория.

## Структура
- `index.html` — главная страница
- `assets/css/styles.css` — исходные стили
- `assets/js/main.js` — исходный JS, включая отправку формы
- `images/` — изображения
- `functions/api/telegram.js` — Cloudflare Pages Function для Telegram

## Деплой
1. Загрузите **содержимое** архива в корень GitHub репозитория.
2. Cloudflare Pages → Connect to Git → репозиторий.
3. Framework preset: None, Build command: пусто, Build output directory: `.` (точка), Root directory: `/`.
4. Production Variables and secrets: `TELEGRAM_BOT_TOKEN` (Secret), `TELEGRAM_CHAT_ID` (Text).
5. Сохраните настройки и запустите новый Production deployment.
6. Откройте `/api/telegram`: ожидается JSON с `ready: true`. Затем отправьте реальную тестовую заявку через форму.

**Важно:** проверка GET API не доказывает успешность POST отправки. Если форма не работает, смотрите Network → Fetch/XHR → `/api/telegram` → Response. Не публикуйте токен бота в GitHub.
