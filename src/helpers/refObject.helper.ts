import { isPlainObject } from '../helpers/helpers'

export type RefObject<TValue> = {
  current: TValue
}

const isRefObject = <TValue>(value: unknown): value is RefObject<TValue> =>
  isPlainObject(value) && 'current' in value

export const inferRefObject = <TValue>(value: RefObject<TValue> | TValue) =>
  isRefObject(value) ? value.current : value
