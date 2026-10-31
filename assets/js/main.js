
const form = document.getElementById('project-form');
const message = document.getElementById('form-message');
const success = document.getElementById('success-state');
document.getElementById('year').textContent = new Date().getFullYear();

const errorMessages = {
  server_not_configured: 'На сервере не найдены TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID. Проверьте переменные в Cloudflare и заново запустите деплой.',
  telegram_token_invalid: 'Новый токен не прошёл проверку Telegram. Вставьте в TELEGRAM_BOT_TOKEN полный токен от BotFather без пробелов и выполните новый Production-деплой.',
  telegram_chat_not_found: 'Telegram не нашёл чат. TELEGRAM_CHAT_ID — это ID вашего личного чата или группы, а не ID самого бота. Откройте нового бота и отправьте /start.',
  telegram_start_required: 'Откройте именно нового бота, отправьте ему /start и затем повторите отправку заявки.',
  telegram_no_chat_permission: 'У бота нет разрешения писать в этот чат. Добавьте бота в нужный чат и проверьте его права.',
  telegram_rate_limited: 'Telegram временно ограничил отправку. Подождите немного и попробуйте снова.',
  telegram_rejected: 'Telegram отклонил заявку. Проверьте токен, ID чата и права бота.',
  telegram_unavailable: 'Cloudflare не смог связаться с Telegram. Проверьте логи функции в Cloudflare.',
  invalid_content_type: 'Сервер получил запрос в неверном формате. Обновите страницу и попробуйте снова.',
  invalid_request: 'Не удалось прочитать запрос. Обновите страницу и попробуйте снова.',
  required_fields_missing: 'Заполните все обязательные поля.',
  request_too_large: 'Сообщение слишком большое. Сократите описание задачи.',
  invalid_json: 'Не удалось прочитать данные формы. Обновите страницу и попробуйте снова.'
};

// Переход к форме по кнопкам сайта.
document.querySelectorAll('[data-open-form]').forEach((el) => {
  el.addEventListener('click', (event) => {
    event.preventDefault();
    document.getElementById('request').scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => document.getElementById('name').focus({ preventScroll: true }), 450);
  });
});

document.getElementById('success-close').addEventListener('click', () => {
  success.classList.remove('show');
  form.style.display = '';
  form.reset();
  message.textContent = '';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  message.textContent = '';

  const nameField = document.getElementById('name');
  const contactField = document.getElementById('contact-way');
  const detailsField = document.getElementById('details');
  const requiredFields = [nameField, contactField, detailsField];
  const firstInvalid = requiredFields.find((field) => !field.value.trim());

  requiredFields.forEach((field) => {
    if (!field.value.trim()) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
  });

  if (firstInvalid) {
    message.textContent = 'Заполните обязательные поля.';
    firstInvalid.focus();
    return;
  }
  if (!document.getElementById('consent').checked) {
    message.textContent = 'Подтвердите согласие на обработку данных.';
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.innerHTML;
  submitButton.disabled = true;
  submitButton.innerHTML = 'Отправляем…';
  message.textContent = 'Отправляем заявку…';

  try {
    const response = await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      cache: 'no-store',
      body: JSON.stringify({
        name: nameField.value.trim(),
        contact: contactField.value.trim(),
        projectType: document.getElementById('project-type').value,
        details: detailsField.value.trim()
      })
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (response.status === 404) {
        throw new Error('function_not_deployed');
      }
      throw new Error('unexpected_server_response');
    }

    const result = await response.json();
    if (!response.ok || !result.ok) {
      throw new Error(result.error || 'telegram_unavailable');
    }

    form.style.display = 'none';
    message.textContent = '';
    success.classList.add('show');
  } catch (error) {
    const code = error && error.message ? error.message : 'telegram_unavailable';
    if (code === 'function_not_deployed') {
      message.textContent = 'Cloudflare не нашёл функцию /api/telegram. Проверьте, что папки functions и public находятся рядом в корне GitHub-репозитория, а Build output directory задан как public. Затем выполните новый деплой через GitHub.';
    } else if (code === 'unexpected_server_response') {
      message.textContent = 'Сервер вернул неожиданный ответ. Проверьте последний деплой Cloudflare Pages.';
    } else if (code === 'Failed to fetch' || code === 'NetworkError when attempting to fetch resource.') {
      message.textContent = 'Не удалось связаться с сервером сайта. Проверьте адрес сайта и откройте /api/telegram для диагностики.';
    } else {
      message.textContent = errorMessages[code] || 'Не удалось отправить заявку. Откройте /api/telegram и проверьте состояние функции.';
    }
    console.error('Form submit failed:', code);
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
});

// Плавное появление блоков при прокрутке.
const revealItems = [...document.querySelectorAll('.reveal')];
revealItems.forEach((el) => {
  const siblings = [...el.parentElement.children].filter((node) => node.classList && node.classList.contains('reveal'));
  el.style.setProperty('--reveal-delay', `${Math.min(siblings.indexOf(el), 5) * 65}ms`);
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });
  revealItems.forEach((el) => observer.observe(el));
} else {
  revealItems.forEach((el) => el.classList.add('visible'));
}
