import { useSelector, useDispatch } from 'react-redux'
import { fetchAnalogues } from '../store/searchSlice'
import { BackToBrandsButton, TableSkeleton, ErrorState } from './BrandsList'
import { formatPrice, formatCount, formatShipmentDate } from '../utils/format'

/**
 * Этап 2: итоговая таблица аналогов и предложений
 * по выбранному номеру и производителю.
 *
 * Требование: для каждой позиции — название, производитель, цена, остаток.
 * Цена берётся из конкретного склада (warehouses[].price),
 * поле price товара не используется (см. документацию API).
 */
export default function OffersTable() {
  const dispatch = useDispatch()
  const { number, brand, items, itemsStatus, itemsError } = useSelector((s) => s.search)

  if (!brand || itemsStatus === 'idle') return null

  const retry = () => dispatch(fetchAnalogues({ number: number.trim(), brand: brand.brand }))

  return (
    <div className="card-main mb-4" style={{ animationDelay: '0.16s' }}>
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
        <span>
          Аналоги и предложения
          {itemsStatus === 'succeeded' && (
            <span className="chip chip-own ms-2">{items.length}</span>
          )}
        </span>
        <div className="d-flex align-items-center gap-2">
          <span className="mono text-faint" style={{ fontSize: '0.82rem' }}>
            {brand.brand} · {number.trim()}
          </span>
          <BackToBrandsButton />
        </div>
      </div>
      <div className="card-body">
        {itemsStatus === 'loading' && (
          <>
            <div className="loading-hint">
              <span className="spinner-border" role="status" aria-hidden="true" />
              <span>Загружаем аналоги и предложения…</span>
            </div>
            <TableSkeleton rows={7} cols={[40, '2fr', 70, 90, 110]} />
          </>
        )}

        {itemsStatus === 'failed' && <ErrorState error={itemsError} onRetry={retry} />}

        {itemsStatus === 'succeeded' && items.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">📦</div>
            <div className="fw-semibold mb-1">Предложений нет</div>
            <div className="text-soft" style={{ fontSize: '0.9rem' }}>
              Для «{brand.brand} {number.trim()}» аналоги и предложения не найдены.
            </div>
          </div>
        )}

        {itemsStatus === 'succeeded' && items.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover table-compact align-middle stagger">
              <thead>
                <tr>
                  <th>Наименование</th>
                  <th>Производитель</th>
                  <th className="text-end">Остаток</th>
                  <th>Цена и склады</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <OfferRow key={`${item.goodsID}-${index}`} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/** Одна позиция таблицы: товар-аналог со складами. */
function OfferRow({ item }) {
  const warehouses = item.warehouses || []
  const best = bestOffer(warehouses)

  return (
    <tr>
      <td>
        <div className="text-truncate" style={{ maxWidth: 320 }} title={item.name}>
          {item.name || <span className="text-faint">—</span>}
        </div>
        <span className="mono text-faint" style={{ fontSize: '0.78rem' }}>{item.number}</span>
        {item.rate > 1 && <span className="chip chip-warn ms-1">кратно {item.rate}</span>}
      </td>
      <td>
        <span className="fw-semibold">{item.brand}</span>
        {item.notRefund && <span className="chip chip-warn ms-1">невозврат</span>}
      </td>
      <td className="text-end">
        {item.count > 0 ? (
          <span className="chip chip-stock">{formatCount(item.count)} шт.</span>
        ) : (
          <span className="chip chip-empty">нет</span>
        )}
        {item.count > 0 && (
          <div className="text-faint" style={{ fontSize: '0.76rem' }}>
            на {warehouses.length} {warehouseWord(warehouses.length)}
          </div>
        )}
      </td>
      <td>
        {best ? (
          <>
            <span className="price-main">{formatPrice(best.price)}</span>
            <ul className="warehouse-list">
              {warehouses.map((w, i) => (
                <li key={`${w.id}-${i}`}>
                  <span className="warehouse-code">{w.code || 'Склад'}</span>
                  <span className="warehouse-price">{formatPrice(w.price)}</span>
                  <span>{formatCount(w.stock)} шт.</span>
                  <span className="text-faint">отгрузка {formatShipmentDate(w.shipmentDate)}</span>
                  {w.own && <span className="chip chip-own">наш склад</span>}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <span className="text-faint">нет предложений на складах</span>
        )}
      </td>
    </tr>
  )
}

/** Форма слова «склад» для подписи «на N …»: складе / складах. */
function warehouseWord(n) {
  return n === 1 ? 'складе' : 'складах'
}

/** Лучшее предложение: минимальная цена среди складов с остатком. */
function bestOffer(warehouses) {
  const withStock = warehouses.filter((w) => w.stock > 0 && typeof w.price === 'number')
  if (withStock.length === 0) return null
  return withStock.reduce((acc, w) => (w.price < acc.price ? w : acc), withStock[0])
}
