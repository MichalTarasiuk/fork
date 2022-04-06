export function compose(...funcs: never[]): <TArg>(arg: TArg) => TArg
export function compose<TFunction extends (...args: any[]) => unknown>(
  ...funcs: readonly TFunction[]
): (...args: Parameters<TFunction>) => ReturnType<TFunction>

export function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    // infer the argument type so it is usable in inference down the line
    return <TArg>(arg: TArg) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => {
    return (...args: unknown[]) => a(b(...args))
  })
}
