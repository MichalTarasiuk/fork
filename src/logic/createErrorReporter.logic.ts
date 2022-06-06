import { mapObject } from '../utils/utils'

export type StateError = {
  readonly type: string
  readonly message: string
}

export const createErrorReporter = <
  TState extends Record<PropertyKey, unknown>
>(
  state: TState
) => {
  type Errors = Record<keyof TState, StateError | null>

  const initialErrors = mapObject(state, () => null)
  let errors = initialErrors as Errors

  const setErrors = (nextErrors: Errors) => {
    errors = Object.assign(errors, nextErrors)
  }

  const resetErrors = () => {
    errors = initialErrors
  }

  return { errors, setErrors, resetErrors }
}
