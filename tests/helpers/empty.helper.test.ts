import { empty } from '../../src/helpers/helpers'

describe('empty', () => {
  it('should return empty value', () => {
    // arrange
    const value = {
      a: 1,
      b: 2,
    }

    // assert
    expect(empty(value)).toEqual({})
  })

  it('should return value with the same refference', () => {
    // arrange
    const value = {
      a: 1,
      b: 2,
    }

    // assert
    expect(empty(value)).toBe(value)
  })
})
