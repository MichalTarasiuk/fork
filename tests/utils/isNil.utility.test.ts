import { isNil } from '../../src/utils/utils'

describe('isNil', () => {
  it('should return true if value is null', () => {
    expect(isNil(null)).toBe(true)
  })

  it('should return true if value is undefined', () => {
    expect(isNil(undefined)).toBe(true)
  })

  it('should return false if value is not null or undefined', () => {
    expect(isNil(0)).toBe(false)
    expect(isNil('')).toBe(false)
    expect(isNil(false)).toBe(false)
    expect(isNil(true)).toBe(false)
    expect(isNil(NaN)).toBe(false)
    expect(isNil(Infinity)).toBe(false)
    expect(isNil({})).toBe(false)
    expect(isNil([])).toBe(false)
  })
})
