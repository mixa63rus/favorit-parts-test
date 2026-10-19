/*
 * Клиент Web-сервиса «Проценка» Favorit Parts.
 * Документация: https://lk.favorit-parts.ru/static/wsprice.pdf
 *
 * Все запросы — GET на http://api.favorit-parts.ru/hs/hsprice/
 * Параметры: key, number, brand (опц.), analogues=on (опц.), info=on (опц.)
 */

const API_URL = 'https://api.favorit-parts.ru/hs/hsprice/'

/**
 * Ключ покупателя. В реальном проекте выдавался бы бэкендом каждому
 * клиенту персонально; для демо — тестовый ключ из документации.
 */
export const API_KEY = '00000000-0000-0000-0000-000000000001'

/** Таймаут запроса, мс */
const REQUEST_TIMEOUT = 30000

/**
 * Человекочитаемые тексты ошибок API.
 * Ключи — дословные значения параметра error из документации.
 */
const ERROR_MESSAGES = {
  'Empty key!': 'Не указан ключ покупателя.',
  'Invalid key client!': 'Неверный ключ покупателя.',
  'Empty number goods!': 'Не указан номер детали.',
  'Request quota exceeded!': 'Превышен лимит запросов, попробуйте позже.',
}

/**
 * GET-запрос к API с параметрами.
 * @param {object} params - параметры запроса (key, number, brand, ...)
 * @returns {Promise<object>} распарсенный JSON-ответ
 * @throws {Error} сетевая ошибка, таймаут или ошибка, возвращённая API
 */
export async function fetchPrice(params) {
  const url = new URL(API_URL)
  Object.entries(params).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(name, String(value))
    }
  })

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)

  let response
  try {
    response = await fetch(url, { signal: controller.signal })
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Превышено время ожидания ответа сервера (30 с).')
    }
    throw new Error('Не удалось связаться с сервером. Проверьте подключение к сети.')
  } finally {
    clearTimeout(timer)
  }

  if (!response.ok) {
    throw new Error(`Сервер ответил ошибкой HTTP ${response.status}.`)
  }

  let data
  try {
    data = await response.json()
  } catch {
    throw new Error('Сервер вернул некорректный ответ (ожидается JSON).')
  }

  // Контракт API: при ошибке возвращается объект { error: "..." }
  // (может содержать несколько ошибок).
  if (data && typeof data.error === 'string') {
    throw new Error(ERROR_MESSAGES[data.error] || `Ошибка сервиса: ${data.error}`)
  }

  return data
}

/**
 * Этап 1 — поиск по номеру. Возвращает список производителей.
 * Если деталь не найдена, API отдаёт goods из одной пустой структуры —
 * отфильтровываем её здесь и возвращаем [].
 * @param {string} number - артикул детали
 * @returns {Promise<Array>} массив товаров (каждый = бренд + остатки + склады)
 */
export function searchBrands(number) {
  return fetchPrice({ key: API_KEY, number, info: 'on' }).then((data) => {
    const goods = Array.isArray(data.goods) ? data.goods : []
    return goods.filter((g) => g && g.brand && g.number)
  })
}

/**
 * Этап 2 — аналоги и предложения по номеру + бренду.
 * Возвращает плоский список позиций: сам товар плюс его аналоги.
 * @param {string} number - артикул детали
 * @param {string} brand - производитель
 * @returns {Promise<Array>} массив позиций для итоговой таблицы
 */
export function searchAnalogues(number, brand) {
  return fetchPrice({ key: API_KEY, number, brand, analogues: 'on', info: 'on' }).then(
    (data) => {
      const goods = Array.isArray(data.goods) ? data.goods : []
      const rows = []
      goods.forEach((g) => {
        if (!g || !g.brand) return
        rows.push(g)
        if (Array.isArray(g.analogues)) {
          g.analogues.forEach((a) => {
            if (a && a.brand && a.number) rows.push(a)
          })
        }
      })
      return rows
    },
  )
}
