import { mapObject } from '../../src/utils/utils'

describe('mapObject', () => {
  it('should map object', () => {
    // arrange
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    }
    const fn = (_: keyof typeof obj, value: typeof obj[keyof typeof obj]) =>
      value + 1

    const result = mapObject(obj, fn)

    // assert
    expect(result).toEqual({
      a: 2,
      b: 3,
      c: 4,
    })
  })

  it('should return object with different reference', () => {
    // arrange
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    }
    const fn = (_: keyof typeof obj, value: typeof obj[keyof typeof obj]) =>
      value + 1

    const result = mapObject(obj, fn)

    // assert
    expect(result).not.toBe(obj)
  })
})
