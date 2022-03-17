export * from './observer.helper'
export * from './resolveState.helper'
export { isPrimitive } from './isPrimitive.helper'
export { buildOf } from './buildOf.helper'
export { equals } from './equals.helper'
export { cloneObject } from './cloneObject.helper'
export { merge } from './merge.helper'
export { watch } from './watch.helper'
export { isFunction } from './isFunction.helper'
export { pick } from './pick.helper'
export { compose } from './compose.helper'
export { pickKeysByType } from './pickKeysByType.helper'
export { isStateMap } from './isStateMap.helper'
export { isAsyncFunction } from './isAsyncFunction.helper'
export { deepPickAsyncFunctions } from './deepPickAsyncFunctions.helper'
export { getSlugs } from './getSlugs.helper'
export { set } from './set.helper'
export { deepReplace } from './deepReplace.helper'
export { mergeFactory } from './mergeFactory.helper'

export const noop = () => {}

export const isMessageEvent = (
  event: any,
  callback: (data: string) => any
): event is MessageEvent<string> => event.data && callback(event.data)

export const isPlainObject = (value: any) =>
  value !== null && typeof value === 'object' && value.constructor === Object
