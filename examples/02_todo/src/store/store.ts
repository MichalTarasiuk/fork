import remest from 'remest'

import { wait } from './store.helpers'

export type Note = {
  id: number
  title: string
  content: string
}

export const { RemestProvider, useRemest } = remest(
  { block: true, notes: [] as Note[] },
  (set) => ({
    async unlock() {
      await wait(1000)

      set({ block: false })
    },
  })
)
