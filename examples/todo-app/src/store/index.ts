import remind from 'remind'

import { State } from './store.types'

const { useRemind } = remind<State>({
  notes: [],
})

export { useRemind }
