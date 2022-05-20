import { isEqual } from 'lodash'
import { useRef } from 'react'

import { useHasMounted } from '../hooks/hooks'

import type { DependencyList, MutableRefObject } from 'react'

export const useCreation = <TResult>(
  factory: () => TResult,
  dependencies: DependencyList
) => {
  const result = useRef<TResult | undefined>(undefined)
  const savedDependencies = useRef(dependencies)

  const hasMounted = useHasMounted()

  if (
    !hasMounted.current ||
    !isEqual(savedDependencies.current, dependencies)
  ) {
    savedDependencies.current = dependencies
    result.current = factory()
  }

  return result as unknown as MutableRefObject<TResult>
}
