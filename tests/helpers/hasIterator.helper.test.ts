import { hasIterator } from '../../src/helpers/helpers'

describe('hasIterator', () => {
  it('should return true when value has iterator', () => {
    // arrange
    const value = {
      [Symbol.iterator]: () => {},
    }

    // assert
    expect(hasIterator(value)).toBeTruthy()
  })

  it('should return false when value has not iterator', () => {
    // arrange
    const value = {}

    // assert
    expect(hasIterator(value)).toBeFalsy()
  })
})
