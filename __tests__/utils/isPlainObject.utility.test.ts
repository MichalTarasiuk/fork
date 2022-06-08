import { isPlainObject } from '../../src/utils/utils'

describe('isPlainObject', () => {
  it('should return false if value is an object', () => {
    expect(isPlainObject([])).toBe(false)
    expect(isPlainObject(new Map())).toBe(false)
  })

  it('should return false for non-objects', () => {
    expect(isPlainObject(null)).toBe(false)
    expect(isPlainObject(undefined)).toBe(false)
    expect(isPlainObject(1)).toBe(false)
    expect(isPlainObject('foo')).toBe(false)
    expect(isPlainObject(true)).toBe(false)
    expect(isPlainObject(false)).toBe(false)
    expect(isPlainObject(Symbol('foo'))).toBe(false)
    expect(isPlainObject(() => {})).toBe(false)
  })

  it('should return true for plain objects', () => {
    expect(isPlainObject({})).toBe(true)
    expect(isPlainObject({ a: 1 })).toBe(true)
    expect(isPlainObject({ a: 1, b: 2 })).toBe(true)
    expect(isPlainObject({ a: 1, b: 2, c: 3 })).toBe(true)
  })
})
