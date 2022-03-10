import remind from 'remind'

import { State } from './store.types'

const { useRemind } = remind<State & { a: any }>({
  notes: [],
  async a() {},
})

export { useRemind }
