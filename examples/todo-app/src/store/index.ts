import remind from 'remind'

import { State } from './store.types'

const wait = (ms = 0) => new Promise((res) => setTimeout(res, ms))

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
