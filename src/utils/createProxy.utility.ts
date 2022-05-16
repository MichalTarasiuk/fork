import { isSymbol } from './utils'

export const createProxy = <TTarget extends Record<PropertyKey, unknown>>(
  target: TTarget,
  fn: (terget: TTarget) => void
) => {
  const proxy = new Proxy(target, {
    set(terget: TTarget, propertyKey: PropertyKey, value: unknown) {
      if (isSymbol(propertyKey)) {
        return true
      }

      const result = Reflect.set(terget, propertyKey, value)

      fn(target)

      return result
    },
    defineProperty(
      target: TTarget,
      propertyKey: PropertyKey,
      attributes: PropertyDescriptor
    ) {
      const result = Reflect.defineProperty(target, propertyKey, attributes)

      fn(target)

      return result
    },
    deleteProperty(target: TTarget, propertyKey: PropertyKey) {
      const result = Reflect.deleteProperty(target, propertyKey)

      fn(target)

      return result
    },
  })

  return proxy
}
