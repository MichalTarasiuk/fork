import { hasIterator } from '../../src/helpers/helpers'

describe('hasIterator', () => {
  it('should return true when value has iterator', () => {
    const value = {
      [Symbol.iterator]: () => {},
    }

    expect(hasIterator(value)).toBeTruthy()
  })

  it('should return false when value has not iterator', () => {
    const value = {}

    expect(hasIterator(value)).toBeFalsy()
  })
})
