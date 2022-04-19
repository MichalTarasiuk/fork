export const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

export const random = <TValue extends unknown>(arr: TValue[]): TValue =>
  arr[Math.floor(Math.random() * arr.length)]
