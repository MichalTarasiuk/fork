export const isAsyncFunction = (value: any) =>
  Object.prototype.toString.call(value) === '[object AsyncFunction]'
