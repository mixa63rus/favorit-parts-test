import { useSelector, useDispatch } from 'react-redux'
import { selectBrand, resetToBrands, fetchBrands, fetchAnalogues } from '../store/searchSlice'
import { formatPrice, formatCount } from '../utils/format'

/**
 * Этап 1: список производителей по введённому артикулу.
 * Клик по строке — выбор бренда и переход к этапу 2.
 */
export default function BrandsList() {
  const dispatch = useDispatch()
  const { brands, brandsStatus, brandsError, number, brand } = useSelector((s) => s.search)

  // Список имеет смысл показывать, пока не выбран бренд
  // (после выбора его заменяет таблица предложений).
  if (brand) return null

  if (brandsStatus === 'idle') return null

  return (
    <div className="card-main mb-4" style={{ animationDelay: '0.12s' }}>
      <div className="card-header d-flex justify-content-between align-items-center">
        <span>
          Производители
          {brandsStatus === 'succeeded' && (
            <span className="chip chip-own ms-2">{brands.length}</span>
          )}
        </span>
        {brandsStatus === 'succeeded' && number.trim() && (
          <span className="mono text-faint" style={{ fontSize: '0.82rem' }}>
            {number.trim()}
          </span>
        )}
      </div>
      <div className="card-body">
        {brandsStatus === 'loading' && (
          <TableSkeleton rows={5} cols={[34, '2fr', 70, 90]} />
        )}

        {brandsStatus === 'failed' && (
          <ErrorState error={brandsError} onRetry={() => dispatch(fetchBrands(number.trim()))} />
        )}

        {brandsStatus === 'succeeded' && brands.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon" aria-hidden="true">🔍</div>
            <div className="fw-semibold mb-1">Ничего не найдено</div>
            <div className="text-soft" style={{ fontSize: '0.9rem' }}>
              По артикулу «{number.trim()}» производителей нет.
              <br />
              Проверьте номер и попробуйте снова.
            </div>
          </div>
        )}

        {brandsStatus === 'succeeded' && brands.length > 0 && (
          <div className="table-responsive">
            <table className="table table-hover table-compact align-middle stagger">
              <thead>
                <tr>
                  <th>Производитель</th>
                  <th>Деталь</th>
                  <th className="text-end">Остаток</th>
                  <th className="text-end">Цена от</th>
                  <th className="text-end" style={{ width: 100 }} />
                </tr>
              </thead>
              <tbody>
                {brands.map((item, index) => (
                  <BrandRow
                    key={`${item.goodsID}-${index}`}
                    item={item}
                    onSelect={() => {
                      dispatch(selectBrand(item))
                      dispatch(fetchAnalogues({ number: number.trim(), brand: item.brand }))
                    }}
                  />
                ))}
              </tbody>
            </table>
            <div className="text-faint mt-3" style={{ fontSize: '0.82rem' }}>
              Выберите производителя, чтобы найти аналоги и предложения
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/** Строка производителя этапа 1. */
function BrandRow({ item, onSelect }) {
  const initial = (item.brand || '?').trim().charAt(0).toUpperCase()

  return (
    <tr className="brand-row" onClick={onSelect}>
      <td>
        <div className="d-flex align-items-center gap-2">
          <span className="brand-initial" aria-hidden="true">{initial}</span>
          <span className="brand-name">{item.brand}</span>
        </div>
      </td>
      <td>
        <div className="text-truncate" style={{ maxWidth: 340 }} title={item.name}>
          {item.name || <span className="text-faint">—</span>}
        </div>
        <span className="mono text-faint" style={{ fontSize: '0.78rem' }}>{item.number}</span>
      </td>
      <td className="text-end">
        {item.count > 0 ? (
          <span className="chip chip-stock">{formatCount(item.count)} шт.</span>
        ) : (
          <span className="chip chip-empty">нет</span>
        )}
      </td>
      <td className="text-end">
        <span className="price-main">{formatPrice(minPrice(item))}</span>
      </td>
      <td className="text-end">
        <button className="back-link" type="button" onClick={(e) => e.stopPropagation() || onSelect()}>
          Аналоги →
        </button>
      </td>
    </tr>
  )
}

/** Кнопка возврата к списку производителей (используется в этапе 2). */
export function BackToBrandsButton() {
  const dispatch = useDispatch()
  return (
    <button className="back-link" type="button" onClick={() => dispatch(resetToBrands())}>
      ← Производители
    </button>
  )
}

/** Shimmer-скелетон таблицы. */
export function TableSkeleton({ rows = 5, cols = [1, 1, 1, 1] }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="skeleton-row" key={r}>
          {cols.map((c, i) => (
            <span
              key={i}
              className="skeleton-block"
              style={{ flex: typeof c === 'number' ? `0 0 ${c}px` : c }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

/** Состояние ошибки с повтором запроса. */
export function ErrorState({ error, onRetry }) {
  return (
    <div role="alert">
      <div className="alert alert-danger d-flex align-items-start gap-2 mb-3">
        <span aria-hidden="true">⚠</span>
        <div>{error}</div>
      </div>
      {onRetry && (
        <div className="text-center">
          <button className="btn btn-ghost px-3 py-2" type="button" onClick={onRetry}>
            Повторить запрос
          </button>
        </div>
      )}
    </div>
  )
}

/** Минимальная цена по складам (поле price товара не используется — см. документацию). */
function minPrice(item) {
  const prices = (item.warehouses || []).map((w) => w.price).filter((p) => typeof p === 'number')
  return prices.length ? Math.min(...prices) : item.price
}
