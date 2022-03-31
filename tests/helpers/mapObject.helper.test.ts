import { mapObject } from '../../src/helpers/helpers'

describe('mapObject', () => {
  it('should map object', () => {
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    }

    const fn = (key: keyof typeof obj, value: typeof obj[keyof typeof obj]) =>
      value + 1

    const result = mapObject(obj, fn)

    expect(result).toEqual({
      a: 2,
      b: 3,
      c: 4,
    })
  })
})
