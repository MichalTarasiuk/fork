import { AsyncFunction } from '../types'

export const isAsyncFunction = (value: any): value is AsyncFunction =>
  Object.prototype.toString.call(value) === '[object AsyncFunction]'
