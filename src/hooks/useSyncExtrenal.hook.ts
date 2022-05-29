import { useSyncExternalStore } from 'react'

import { noop } from '../utils/utils'

import type { Noop } from '../types/types'

// END
export const useSyncExtrenal = (subscribe: (onStoreChange: Noop) => Noop) => {
  useSyncExternalStore(subscribe, noop)
}
