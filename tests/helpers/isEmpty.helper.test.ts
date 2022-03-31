import { isEmpty } from '../../src/helpers/helpers'

describe('isEmpty', () => {
  it('should return false when value is primitive value', () => {
    expect(isEmpty(1)).toBe(false)
    expect(isEmpty('')).toBe(false)
    expect(isEmpty(null)).toBe(false)
    expect(isEmpty(undefined)).toBe(false)
    expect(isEmpty(false)).toBe(false)
  })

  it('should return true when value is empty plain object', () => {
    expect(isEmpty({})).toBe(true)
  })

  it('should return true when value is empty array', () => {
    expect(isEmpty([])).toBe(true)
  })

  it('should return false when value is fill plain object', () => {
    expect(isEmpty({ a: 1 })).toBe(false)
  })

  it('should return false when value is empty array', () => {
    expect(isEmpty([1])).toBe(false)
  })
})
