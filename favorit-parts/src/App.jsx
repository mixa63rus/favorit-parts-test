import { useSelector, useDispatch } from 'react-redux'
import { fetchBrands, setNumber, clearSearch } from './store/searchSlice'
import SearchForm from './components/SearchForm'
import BrandsList from './components/BrandsList'
import OffersTable from './components/OffersTable'

/**
 * Корневой компонент: двухэтапный процесс подбора.
 * Этап 1 — ввод артикула и выбор производителя.
 * Этап 2 — таблица аналогов и предложений по выбранному бренду.
 */
export default function App() {
  const dispatch = useDispatch()
  const { number, brand, brandsStatus, brands, itemsStatus, items } = useSelector((s) => s.search)

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = number.trim()
    if (trimmed) dispatch(fetchBrands(trimmed))
  }

  const handleReset = () => dispatch(clearSearch())

  // Этап 2 считается пройденным, когда бренд выбран и данные пришли.
  const step2Done = Boolean(brand) && itemsStatus === 'succeeded'
  const step2Active = Boolean(brand)
  const step1Done = brandsStatus === 'succeeded' && brands.length > 0

  return (
    <div className="container py-4 py-lg-5" style={{ maxWidth: 980 }}>
      <header className="app-header mb-4">
        <div className="d-flex align-items-center gap-3 mb-3">
          <span className="app-logo" aria-hidden="true">F</span>
          <div>
            <h1 className="app-title h3">Favorit Parts</h1>
            <div className="text-faint" style={{ fontSize: '0.82rem' }}>
              Подбор запчастей и аналогов по артикулу
            </div>
          </div>
        </div>

        {/* Степпер: подсвечивает текущий этап */}
        <div className="stepper" role="group" aria-label="Этапы подбора">
          <div className={`step ${step1Done ? 'done' : ''} ${!brand ? 'active' : ''}`}>
            <span className="step-num">{step1Done ? '✓' : '1'}</span>
            <span className="d-none d-sm-inline">Поиск производителя</span>
            <span className="d-sm-none">Артикул</span>
          </div>
          <div className={`step ${step2Done ? 'done' : ''} ${step2Active && !step2Done ? 'active' : ''}`}>
            <span className="step-num">{step2Done ? '✓' : '2'}</span>
            <span className="d-none d-sm-inline">Аналоги и предложения</span>
            <span className="d-sm-none">Аналоги</span>
          </div>
        </div>
      </header>

      <div className="search-panel mb-4">
        <SearchForm
          number={number}
          onChange={(v) => dispatch(setNumber(v))}
          onSubmit={handleSubmit}
          onReset={handleReset}
          loading={brandsStatus === 'loading'}
        />
      </div>

      {/* Этап 1: список производителей */}
      <BrandsList />

      {/* Этап 2: аналоги и предложения */}
      <OffersTable />

      <footer className="app-footer text-center mt-2">
        Данные: Web-сервис «Проценка»{' '}
        <a
          href="https://lk.favorit-parts.ru"
          target="_blank"
          rel="noreferrer"
        >
          Favorit Parts
        </a>
      </footer>
    </div>
  )
}
