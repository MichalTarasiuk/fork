import type { Noop } from '../typings/typings'

const weakMap = new WeakMap()

const isObject = (value: any): value is object =>
  typeof value === 'object' && value !== null

export const watch = <TValue extends object>(
  value: TValue,
  callback: Noop
): TValue => {
  if (weakMap.has(value)) {
    return weakMap.get(value)
  }

  const proxy = new Proxy(value, {
    get(target, prop, receiver) {
      const ret = Reflect.get(target, prop, receiver)
      const observer = isObject(ret) ? watch(ret, callback) : ret

      return observer
    },
    set(target, prop, value) {
      const ret = Reflect.set(target, prop, value)

      if (prop !== 'length' && typeof prop !== 'symbol') {
        callback()
      }

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
