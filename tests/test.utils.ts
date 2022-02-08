const wait = (ms: number) => new Promise((res) => setTimeout(res, ms))

const random = <TValue extends any>(arr: TValue[]): TValue =>
  arr[Math.floor(Math.random() * arr.length)]

const noop = () => {}

export { wait, random, noop }
