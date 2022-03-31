import remind from 'remind'

import { wait } from './store.helpers'
import type { Mind } from './store.types'

const { useRemind } = remind<Mind>((set) => ({
  block: true,
  async unlock() {
    await wait(1000)

    set({ block: false })
  },
  notes: [],
}))

export { useRemind }
