/**
 * Форма этапа 1: ввод артикула.
 * Отправка — по кнопке «Найти» или Enter; пустой артикул не отправляется.
 */
export default function SearchForm({ number, onChange, onSubmit, onReset, loading }) {
  const disabled = loading || !number.trim()

  return (
    <form onSubmit={onSubmit} noValidate>
      <label htmlFor="number-input" className="form-label fw-semibold mb-2">
        Артикул детали
      </label>
      <div className="d-flex flex-column flex-sm-row gap-2">
        <div className="search-input-wrap flex-grow-1">
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            id="number-input"
            type="text"
            className="search-input mono"
            placeholder="01089"
            value={number}
            onChange={(e) => onChange(e.target.value)}
            disabled={loading}
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />
        </div>
        <button className="btn btn-gradient px-4 py-2" type="submit" disabled={disabled}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Поиск…
            </>
          ) : (
            'Найти'
          )}
        </button>
        {number && !loading && (
          <button className="btn btn-ghost px-3 py-2" type="button" onClick={onReset}>
            Сброс
          </button>
        )}
      </div>
      <div className="text-faint mt-2" style={{ fontSize: '0.82rem' }}>
        Введите номер детали — покажем производителей, которые её выпускают
      </div>
    </form>
  )
}
