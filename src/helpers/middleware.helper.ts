import { cloneObject } from './helpers'

type Middleware = (value?: any) => { next: boolean; value: any }

export const isMiddleware = (value: any): value is Middleware => {
  if (typeof value === 'function') {
    const firstBracket = value.toString().indexOf('(')
    const secondBracket = value.toString().indexOf(')')

    const { length: paramsLength } = value
      .toString()
      .slice(firstBracket + 1, secondBracket)
      .split(',')
      .filter(Boolean)

    if (paramsLength === 0) {
      return false
    }

    const constantsParamsLength = value.length
    const defaultParamsLength = paramsLength - constantsParamsLength

    return paramsLength === defaultParamsLength
  }

  return false
}

export const invokeMiddlewares = <TState>(
  middlewares: TState,
  state: TState,
  nextState?: TState
): TState => {
  const currentState: any = cloneObject(nextState || state)
  const initialStateCreate = !nextState

  for (const [key, middleware] of Object.entries(middlewares)) {
    const fallbackValue = state && (state as any)[key]
    const nextValue = nextState && (nextState as any)[key]

    const { value: middlewareValue, next } = middleware(nextValue)

    currentState[key] =
      next || initialStateCreate ? middlewareValue : fallbackValue
  }

  return currentState
}

export const getMiddlewares = <TState extends Record<string, any>>(
  state: TState
) =>
  Object.fromEntries(
    Object.entries(state).filter(([, value]) => isMiddleware(value))
  ) as TState
