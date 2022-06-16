import { cloneDeep } from 'lodash'

import { mapObject } from '../utils/utils'

import type { PlainObject } from '../types/types'

export type Error = {
  readonly type: string
  readonly message: string
}

export const createErrorReporter = <TState extends PlainObject>(
  state: TState
) => {
  type Errors = Record<keyof TState, Error | null>

  const initialErrors = mapObject(state, () => null) as Errors
  let errors = cloneDeep(initialErrors)

  const setErrors = (nextErrors: Errors) => {
    errors = Object.assign(errors, nextErrors)
  }

  const resetErrors = () => {
    errors = Object.assign(errors, initialErrors)
  }

  return { errors, setErrors, resetErrors }
}
