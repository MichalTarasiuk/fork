import remind from 'remind'

import { State } from './store.types'

const { useRemind } = remind<State>((set) => ({
  block: true,
  notes: [],
}))

export { useRemind }
