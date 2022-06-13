import { useRef } from 'react'

import { areHookInputsEqual } from './hooks.helpers'

import type { DependencyList, MutableRefObject } from 'react'

const customAreHookInputsEqual = (
  nextDeps: ReadonlyArray<unknown>,
  prevDeps: ReadonlyArray<unknown> | null
) =>
  areHookInputsEqual(nextDeps, prevDeps) &&
  nextDeps.length === (prevDeps || []).length

export const useCreation = <TData>(
  nextCreate: () => TData,
  dependencies: DependencyList
) => {
  const data = useRef<TData | null>(null)
  const savedDependencies = useRef<DependencyList | null>(null)

  if (!customAreHookInputsEqual(dependencies, savedDependencies.current)) {
    savedDependencies.current = dependencies
    data.current = nextCreate()
  }

  return data as unknown as MutableRefObject<TData>
}
