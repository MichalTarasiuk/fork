import { empty } from '../../src/utils/utils'

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
})
