/** Форматирование цены: 1 234,56 ₽ */
export function formatPrice(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 2,
  }).format(Number(value))
}

/** Форматирование остатка. */
export function formatCount(value) {
  if (value === null || value === undefined) return '—'
  const n = Number(value)
  if (Number.isNaN(n)) return '—'
  return n === 0 ? 'нет' : new Intl.NumberFormat('ru-RU').format(n)
}

/** Дата и время отгрузки в читаемом виде: «21.10.2026, до 20:00». */
export function formatShipmentDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  const date = d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const time = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
  return `${date}, до ${time}`
}
