import { isAsyncFunction } from '../../src/helpers/helpers'

describe('isAsyncFunction', () => {
  it('should return false when value is a string', () => {
    expect(isAsyncFunction('foobar')).toBeFalsy()
  })

  it('should return false when value is a boolean', () => {
    expect(isAsyncFunction(false)).toBeFalsy()
  })

  it('should return false when value is a number', () => {
    expect(isAsyncFunction(123)).toBeFalsy()
  })

  it('should return false when value is a symbol', () => {
    expect(isAsyncFunction(Symbol())).toBeFalsy()
  })

  it('should return false when value is null', () => {
    expect(isAsyncFunction(null)).toBeFalsy()
  })

  it('should return false when value is undefined', () => {
    expect(isAsyncFunction(undefined)).toBeFalsy()
  })

  it('should return false when value is an object', () => {
    expect(isAsyncFunction({})).toBeFalsy()
  })

  it('should return false when value is an array', () => {
    expect(isAsyncFunction([])).toBeFalsy()
  })

  it('should return false when value is pure function', () => {
    expect(isAsyncFunction(() => {})).toBeFalsy()
  })

  it('should return true when value is async function', () => {
    expect(isAsyncFunction(async () => {})).toBeTruthy()
  })
})
