import { merge } from '../../src/utils'

describe('merge', () => {
  it('should merge array and plain object', () => {
    // arrange
    const result = merge([1], { first: 1 })

    // assert
    expect(result[0]).toBe(1)
    expect(result.first).toBe(1)
  })
})
