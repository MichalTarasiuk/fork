/* eslint-disable functional/no-loop-statement -- loop-statement */
import { objectIs } from '../utils/utils'

export const areHookInputsEqual = (
  nextDeps: ReadonlyArray<unknown>,
  prevDeps: ReadonlyArray<unknown> | null
) => {
  if (prevDeps === null) {
    return false
  }

  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (objectIs(nextDeps[i], prevDeps[i])) {
      continue
    }
    return false
  }

  return true
}
