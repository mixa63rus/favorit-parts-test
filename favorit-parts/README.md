# Поиск автозапчастей — клиент Web-сервиса «Проценка» Favorit Parts

Тестовое задание: клиентское приложение на React для интеграции с внешним
API-сервисом поиска автозапчастей и аналогов.

Документация API: https://lk.favorit-parts.ru/static/wsprice.pdf

## Возможности

**Этап 1 — поиск производителей.**
Ввод артикула → GET-запрос `?key=…&number=…` → таблица производителей,
выпускающих деталь с этим номером (бренд, наименование, остаток, минимальная
цена по складам).

**Этап 2 — аналоги и предложения.**
Клик по производителю → GET-запрос `?key=…&number=…&brand=…&analogues=on` →
итоговая таблица: сам товар и все его аналоги. Для каждой позиции:

- наименование и производитель;
- цена (лучшее предложение + все склады с ценой, остатком и датой отгрузки);
- доступный остаток (суммарный и по складам);
- бейджи «невозврат» и «кратность» (при `info=on`).

## Стек

- React 18 (JavaScript, без TypeScript)
- Redux Toolkit (`@reduxjs/toolkit` + `react-redux`) — состояние этапов, загрузки и ошибок в slice `search`
- Bootstrap 5 — стилизация, спиннеры, скелетоны-загрузки, адаптивные таблицы
- Vite — сборка и dev-сервер

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес, который выведет Vite (по умолчанию http://localhost:5173).

Продакшен-сборка:

```bash
npm run build && npm run preview
```

## Публикация на GitHub Pages

1. Зарегистрируйтесь на [github.com](https://github.com) (если аккаунта ещё нет).
2. Создайте **публичный** репозиторий с именем `favorit-parts-test`.
3. Из папки проекта:

```bash
git init
git add .
git commit -m "Favorit Parts — тестовое задание"
git branch -M main
git remote add origin https://github.com/<username>/favorit-parts-test.git
git push -u origin main
```

4. Опубликуйте собранную версию:

```bash
npm run deploy
```

   (скрипт соберёт проект и зальёт `dist` в ветку `gh-pages`).

5. В репозитории: **Settings → Pages → Branch: gh-pages → Save**.

Сайт появится по адресу:
`https://<username>.github.io/favorit-parts-test/`

> `base: '/favorit-parts-test/'` уже настроен в `vite.config.js` под этот путь.
> При смене имени репозитория поменяйте `base` соответственно.

## Конфигурация API

Ключ покупателя задаётся константой `API_KEY` в
`src/api/favoritApi.js`. По умолчанию — тестовый ключ из документации
(`00000000-0000-0000-0000-000000000001`). Базовый URL API — там же.

## Обработка состояний

- **Загрузка** — спиннер в кнопке, скелетон-строки таблиц (Bootstrap placeholders).
- **Ошибки API** — параметр `error` из ответа переводится в человекочитаемые
  тексты (`Empty key!`, `Invalid key client!` и т.д.); есть кнопка «Повторить запрос».
- **Сеть/таймаут** — свои сообщения (таймаут 30 с через `AbortController`).
- **Пустые ответы** — «ничего не найдено»: API при отсутствии детали возвращает
  одну пустую структуру в `goods`, она отфильтровывается на уровне API-клиента.
- **Цена** — согласно документации, поле `price` товара не используется:
  цена выводится из конкретного склада (`warehouses[].price`).

## Структура

```
src/
├── api/
│   └── favoritApi.js      # клиент API: fetchPrice, searchBrands, searchAnalogues
├── store/
│   ├── index.js           # configureStore
│   └── searchSlice.js     # slice: number, brand, brands, items, статусы, ошибки
├── components/
│   ├── SearchForm.jsx     # этап 1: ввод артикула
│   ├── BrandsList.jsx     # этап 1: список производителей
│   └── OffersTable.jsx    # этап 2: аналоги и предложения
├── utils/
│   └── format.js          # форматирование цены, остатка, даты отгрузки
├── App.jsx
├── index.css              # акценты поверх Bootstrap
└── main.jsx
```
