// store/store.js
import { configureStore } from '@reduxjs/toolkit'
import contactsSlice from './slices/contactsSlice'

const store = configureStore({
  reducer: {
    contacts:contactsSlice,
  },
})

export default store
