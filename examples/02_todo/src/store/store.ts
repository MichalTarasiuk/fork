import remind from 'react-remind'

import { wait } from './store.helpers'

export type Note = {
  id: number
  title: string
  content: string
}

const { useRemind } = remind({ block: true, notes: [] as Note[] }, (set) => ({
  async unlock() {
    await wait(1000)

    set({ block: false })
  },
}))

export { useRemind }
