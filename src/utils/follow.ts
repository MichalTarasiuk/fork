import type { Noop } from '../typings'

const weakMap = new WeakMap()

const isObject = (value: any): value is object =>
  typeof value === 'object' && value !== null

export const follow = <TValue extends object>(
  value: TValue,
  callback: Noop
) => {
  if (weakMap.has(value)) {
    return weakMap.get(value)
  }

  const proxy = new Proxy(value, {
    get(target, prop, receiver) {
      const result = Reflect.get(target, prop, receiver)
      const observer: any = isObject(result) ? follow(result, callback) : result

      return observer
    },
    set(target, prop, value) {
      const ret = Reflect.set(target, prop, value)

      callback()
      return ret
    },
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key)
      callback()
      return ret
    },
  })

  weakMap.set(value, proxy)

  return proxy
}
