import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { searchBrands, searchAnalogues } from '../api/favoritApi'

/**
 * Этап 1: поиск производителей по артикулу.
 */
export const fetchBrands = createAsyncThunk('search/fetchBrands', async (number, { rejectWithValue }) => {
  try {
    return await searchBrands(number)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

/**
 * Этап 2: аналоги и предложения по артикулу + бренду.
 */
export const fetchAnalogues = createAsyncThunk(
  'search/fetchAnalogues',
  async ({ number, brand }, { rejectWithValue }) => {
    try {
      return await searchAnalogues(number, brand)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  },
)

const initialState = {
  number: '',      // введённый артикул
  brand: null,     // выбранный производитель (товар из этапа 1)
  brands: [],      // список производителей
  items: [],       // итоговые позиции (товар + аналоги)
  brandsStatus: 'idle', // idle | loading | succeeded | failed
  itemsStatus: 'idle',
  brandsError: null,
  itemsError: null,
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    /** Установка введённого артикула. */
    setNumber(state, action) {
      state.number = action.payload
    },
    /** Выбор производителя — запускает этап 2. */
    selectBrand(state, action) {
      state.brand = action.payload
      state.items = []
      state.itemsStatus = 'idle'
      state.itemsError = null
    },
    /** Сброс к началу: вернуться к выбору производителя. */
    resetToBrands(state) {
      state.brand = null
      state.items = []
      state.itemsStatus = 'idle'
      state.itemsError = null
    },
    /** Полный сброс формы. */
    clearSearch(state) {
      state.number = ''
      state.brand = null
      state.brands = []
      state.items = []
      state.brandsStatus = 'idle'
      state.itemsStatus = 'idle'
      state.brandsError = null
      state.itemsError = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Этап 1
      .addCase(fetchBrands.pending, (state) => {
        state.brandsStatus = 'loading'
        state.brandsError = null
        state.brands = []
        state.brand = null
        state.items = []
        state.itemsStatus = 'idle'
        state.itemsError = null
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brandsStatus = 'succeeded'
        state.brands = action.payload
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.brandsStatus = 'failed'
        state.brandsError = action.payload || 'Неизвестная ошибка'
      })
      // Этап 2
      .addCase(fetchAnalogues.pending, (state) => {
        state.itemsStatus = 'loading'
        state.itemsError = null
        state.items = []
      })
      .addCase(fetchAnalogues.fulfilled, (state, action) => {
        state.itemsStatus = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchAnalogues.rejected, (state, action) => {
        state.itemsStatus = 'failed'
        state.itemsError = action.payload || 'Неизвестная ошибка'
      })
  },
})

export const { setNumber, selectBrand, resetToBrands, clearSearch } = searchSlice.actions
export default searchSlice.reducer
