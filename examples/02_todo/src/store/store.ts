import hooray from 'hooray'

import { wait } from './store.helpers'

export type Note = {
  id: number
  title: string
  content: string
}

const { useHooray } = hooray({ block: true, notes: [] as Note[] }, (set) => ({
  async unlock() {
    await wait(1000)

    set({ block: false })
  },
}))

export { useHooray }
