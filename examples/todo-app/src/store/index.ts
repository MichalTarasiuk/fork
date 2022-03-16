import remind from 'remind'

import { State } from './store.types'
import { wait } from './store.helpers'

const { useRemind } = remind<State>((set) => ({
  block: true,
  unlock: async () => {
    await wait(2000)

    set({
      block: false,
    })
  },
  notes: [],
}))

export { useRemind }
