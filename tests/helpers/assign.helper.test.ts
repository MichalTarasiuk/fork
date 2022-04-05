import { assign } from '../../src/helpers/helpers'

describe('assign', () => {
  it('should assign array and plain object', () => {
    // arrange
    const result = assign([1], { first: 1 })

    // assert
    expect(result[0]).toBe(1)
    expect(result.first).toBe(1)
  })

  it('it should return b if a is nill', () => {
    // arrange
    const result = assign(undefined, 1)

    // assert
    expect(result).toBe(1)
  })

  it('it should return a if b is nill', () => {
    // arrange
    const result = assign(1, undefined)

    // assert
    expect(result).toBe(1)
  })

  it('should return b when a and b are nill', () => {
    // arrange
    const result = assign(undefined, null)

    // assert
    expect(result).toBe(null)
  })
})
