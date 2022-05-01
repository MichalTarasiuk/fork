import { isEqual } from 'lodash'
import { useRef } from 'react'

import { useHasMounted } from '../hooks/hooks'

import type { DependencyList, MutableRefObject } from 'react'

export const useCreation = <TValue>(
  factory: () => TValue,
  ...dependencies: DependencyList
) => {
  const hasMounted = useHasMounted()
  const savedDependencies = useRef(dependencies)
  const state = useRef<TValue | undefined>(undefined)

  if (
    !hasMounted.current ||
    !isEqual(savedDependencies.current, dependencies)
  ) {
    savedDependencies.current = dependencies
    state.current = factory()
  }

  return state as unknown as MutableRefObject<TValue>
}
