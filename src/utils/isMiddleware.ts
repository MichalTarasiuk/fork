type Middleware = (value?: any) => { next: boolean; value: any }

export const isMiddleware = (value: any): value is Middleware => {
  if (typeof value === 'function') {
    const firstBracket = value.toString().indexOf('(')
    const secondBracket = value.toString().indexOf(')')

    const { length: paramsLength } = value
      .toString()
      .slice(firstBracket + 1, secondBracket)
      .split(',')
      .filter(Boolean)

    if (paramsLength === 0) {
      return false
    }

    const constantsParamsLength = value.length
    const defaultParamsLength = paramsLength - constantsParamsLength

    return paramsLength === defaultParamsLength
  }

  return false
}
