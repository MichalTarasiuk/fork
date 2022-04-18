import { isNill } from '../../src/helpers/helpers'

describe('isNill', () => {
  it('should return true if value is null', () => {
    expect(isNill(null)).toBe(true)
  })

  it('should return true if value is undefined', () => {
    expect(isNill(undefined)).toBe(true)
  })

  it('should return false if value is not null or undefined', () => {
    expect(isNill(0)).toBe(false)
    expect(isNill('')).toBe(false)
    expect(isNill(false)).toBe(false)
    expect(isNill(true)).toBe(false)
    expect(isNill(NaN)).toBe(false)
    expect(isNill(Infinity)).toBe(false)
    expect(isNill({})).toBe(false)
    expect(isNill([])).toBe(false)
  })
})
