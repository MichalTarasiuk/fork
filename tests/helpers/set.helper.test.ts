import { set } from '../../src/helpers/helpers'

describe('set', () => {
  it('should set selected value of property when slug is correct', () => {
    // arrange
    const value = {
      a: {
        b: {
          c: '',
        },
      },
    }
    const result = set(value, 'a.b.c', 3)

    // assert
    expect(result.a.b.c).toBe(3)
  })

  it('should not set selected value of property when slug is incorrect', () => {
    // arrange
    const value = {
      a: {
        b: {
          c: '',
        },
      },
    }
    const result = set(value, 'a.h.c', 3)

    // assert
    expect(result.a.b.c).toBe('')
  })

  it('should set only value which is defined', () => {
    // arrange
    const value = {
      a: {
        b: {},
      },
    }
    const result = set(value, 'a.b.c', 3)

    // assert
    // @ts-ignore
    expect(result.a.b.c).toBe(undefined)
  })
})
