import { AsyncFunction } from '../typings'

export const isAsyncFunction = (value: any): value is AsyncFunction =>
  Object.prototype.toString.call(value) === '[object AsyncFunction]'
