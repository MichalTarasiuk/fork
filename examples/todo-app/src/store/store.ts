import remind from 'remind'

import { Mind } from './store.types'

const { useRemind } = remind<Mind>((set) => ({
  block: true,
  notes: [],
}))

export { useRemind }
