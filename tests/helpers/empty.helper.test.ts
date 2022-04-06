import { empty } from '../../src/helpers/helpers'

describe('empty', () => {
  it('should return empty object', () => {
    // arrange
    const value = {
      a: 1,
      b: 2,
    }

    // assert
    expect(empty(value)).toEqual({})
  })

  it('should return object with the same refference', () => {
    // arrange
    const value = {
      a: 1,
      b: 2,
    }

    // assert
    expect(empty(value)).toBe(value)
  })

  it('should return empty array', () => {
    // arrange
    const value = [1, 2, 3, 4]

    // assert
    expect(empty(value)).toEqual([])
  })

  it('should return array with the same refference', () => {
    // arrange
    const value = [1, 2, 3, 4]

    // assert
    expect(empty(value)).toBe(value)
  })
})
