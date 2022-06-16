import type { PlainObject } from '../types/types'

export const entries = <TObject extends PlainObject>(obj: TObject) =>
  Object.entries(obj) as readonly (readonly [
    keyof TObject,
    TObject[keyof TObject]
  ])[]

export const fromEntries = <
  TArr extends readonly (readonly [PropertyKey, unknown])[]
>(
  arr: TArr
) => {
  return Object.fromEntries(arr) as Record<TArr[number][0], TArr[number][1]>
}

export const filterObject = <TObject extends PlainObject>(
  object: TObject,
  fn: (key: keyof TObject, value: TObject[keyof TObject]) => boolean
) =>
  fromEntries(
    entries(object).filter(([key, value]) => fn(key, value))
  ) as TObject

export const mapObject = <TObject extends PlainObject, TValue>(
  obj: TObject,
  fn: (key: keyof TObject, value: TObject[keyof TObject]) => TValue
): Record<keyof TObject, TValue> =>
  fromEntries(
    entries(obj).map(([key, value]) => [key, fn(key, value)] as const)
  )

export const objectKeys = <TObject extends PlainObject>(object: TObject) =>
  Object.keys(object) as readonly (keyof TObject)[]

export const keyInObject = <TObject extends PlainObject>(
  object: TObject,
  key: PropertyKey
): key is keyof TObject => key in object

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */

const is = (x: any, y: any) => {
  return (x === y && (x !== 0 || 1 / x === 1 / y)) || (x !== x && y !== y)
}

export const objectIs: (x: unknown, y: unknown) => boolean =
  typeof Object.is === 'function' ? Object.is : is
