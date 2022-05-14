import { filterObject } from '../../src/utils/utils'

describe('filterObject', () => {
  it('should filter object', () => {
    // arrange
    const obj = {
      a: 1,
      b: 2,
      c: 3,
    }

    const result = filterObject(obj, (_, value) => value !== 2)

    // assert
    expect(result).toEqual({
      a: 1,
      c: 3,
    })
  })
})
