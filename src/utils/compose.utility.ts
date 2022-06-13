import type { ArrowFunction } from '../types/types'

export function compose(
  ...functions: readonly never[]
): <TArgument>(argument: TArgument) => TArgument
export function compose<TFunction extends ArrowFunction>(
  ...functions: readonly TFunction[]
): (...args: Parameters<TFunction>) => ReturnType<TFunction>

export function compose(...functions: readonly ArrowFunction[]) {
  if (functions.length === 0) {
    // infer the argument type so it is usable in inference down the line
    return <TArg>(arg: TArg) => arg
  }

  if (functions.length === 1) {
    return functions[0]
  }

  return functions.reduce((a, b) => {
    return (...args: readonly unknown[]) => a(b(...args))
  })
}
