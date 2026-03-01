import { createSlice } from '@reduxjs/toolkit'

const contactsSlice = createSlice({
  name: 'contacts',
  initialState: {
    list: [],   // starts empty
  },
  reducers: {
    addContact: (state, action) => {
      state.list.push(action.payload)  // add a new contact
    },
    removeContact: (state, action) => {
      state.list = state.list.filter((contact) => contact.id !== action.payload)
    },
    updateContact: (state, action) => {
      const index = state.list.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = action.payload   // replace with updated contact
      }
    },
    setContacts: (state, action) => {
      state.list = action.payload   // overwrite with a new array (e.g. from API or phone contacts)
    },
    clearContacts: (state) => {
      state.list = []
    },
  },
})

export const { addContact, removeContact, updateContact, setContacts, clearContacts } = contactsSlice.actions
export default contactsSlice.reducer
