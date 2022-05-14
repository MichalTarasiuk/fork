import type { ArrowFunction } from '../types/types'

export function compose(...funcs: readonly never[]): <TArg>(arg: TArg) => TArg
export function compose<TFunction extends (...args: readonly any[]) => unknown>(
  ...funcs: readonly TFunction[]
): (...args: Parameters<TFunction>) => ReturnType<TFunction>

export function compose(...funcs: readonly ArrowFunction[]) {
  if (funcs.length === 0) {
    // infer the argument type so it is usable in inference down the line
    return <TArg>(arg: TArg) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => {
    return (...args: readonly unknown[]) => a(b(...args))
  })
}
