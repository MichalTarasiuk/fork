export * from './observer.helper'
export * from './resolveState.helper'
export { isPrimitive } from './isPrimitive.helper'
export { equals } from './equals.helper'
export { cloneObject } from './cloneObject.helper'
export { merge } from './merge.helper'
export { watch } from './watch.helper'
export { isFunction } from './isFunction.helper'
export { pick } from './pick.helper'
export { compose } from './compose.helper'
export { pickKeysByValue } from './pickKeysByValue.helper'
export { isAsyncFunction } from './isAsyncFunction.helper'
export { pickByValue } from './pickByValue.helper'

export const noop = () => {}

export const entries = <TObject extends Record<PropertyKey, unknown>>(
  obj: TObject
) => Object.entries(obj) as [keyof TObject, TObject[keyof TObject]][]

export const fromEntries = <
  TArr extends readonly (readonly [PropertyKey, unknown])[]
>(
  arr: TArr
) => {
  return Object.fromEntries(arr) as Record<TArr[number][0], TArr[number][1]>
}

export const mapObject = <TObject extends Record<PropertyKey, unknown>, TValue>(
  obj: TObject,
  fn: (key: keyof TObject, value: TObject[keyof TObject]) => TValue
): Record<keyof TObject, TValue> =>
  fromEntries(
    entries(obj).map(([key, value]) => [key, fn(key, value)] as const)
  )
