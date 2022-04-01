import { assign } from '../../src/helpers/helpers'

describe('assign', () => {
  it('should assign array and plain object', () => {
    // arrange
    const result = assign([1], { first: 1 })

    // assert
    expect(result[0]).toBe(1)
    expect(result.first).toBe(1)
  })
})
