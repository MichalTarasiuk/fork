import { findDiffrence } from '../../src/helpers/helpers'

describe('findDiffrence', () => {
  it('should return empty object when arguments are the same', () => {
    // arrange
    const value = {
      a: 1,
      b: 2,
    }
    const mapper = findDiffrence(value, value)

    // assert
    expect(mapper).toEqual({})
  })

  it('should return diffrence of arguments', () => {
    // arrange
    const old = {
      a: 1,
      b: 2,
    }
    const next = {
      a: 1,
      b: 3,
    }
    const mapper = findDiffrence(next, old)

    // assert
    expect(mapper).toEqual({
      b: {
        from: 2,
        to: 3,
      },
    })
  })

  it('should return diffrence of arguments when key is deleted', () => {
    // arrange
    const old = {
      a: 1,
      b: 2,
    }
    const next = {
      a: 1,
    }
    const mapper = findDiffrence(next, old)

    // assert
    expect(mapper).toEqual({ b: { from: 2 } })
  })

  it('should return diffrence of arguments when key is added', () => {
    // arrange
    const old = {
      a: 1,
    }
    const next = {
      a: 1,
      b: 2,
    }
    const mapper = findDiffrence(next, old)

    // assert
    expect(mapper).toEqual({ b: { to: 2 } })
  })
})
