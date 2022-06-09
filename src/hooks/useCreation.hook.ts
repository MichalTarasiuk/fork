import { isEqual } from 'lodash'
import { useRef } from 'react'

import { useHasMounted } from '../hooks/hooks'

import type { DependencyList, MutableRefObject } from 'react'

export const useCreation = <TData>(
  factory: () => TData,
  dependencies: DependencyList
) => {
  const data = useRef<TData | undefined>(undefined)
  const savedDependencies = useRef(dependencies)

  const hasMounted = useHasMounted()

  if (
    !hasMounted.current ||
    !isEqual(savedDependencies.current, dependencies)
  ) {
    savedDependencies.current = dependencies
    data.current = factory()
  }

  return data as unknown as MutableRefObject<TData>
}
