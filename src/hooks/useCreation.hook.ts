import { useRef } from 'react'
import type { DependencyList, MutableRefObject } from 'react'

import { equals } from '../helpers/helpers'
import { useHasMounted } from '../hooks/hooks'

export const useCreation = <TValue>(
  factory: () => TValue,
  ...dependencies: DependencyList
) => {
  const hasMounted = useHasMounted()
  const savedDependencies = useRef(dependencies)
  const state = useRef<TValue | undefined>(undefined)

  if (!hasMounted.current || !equals(savedDependencies.current, dependencies)) {
    savedDependencies.current = dependencies
    state.current = factory()
  }

  return state as unknown as MutableRefObject<TValue>
}
