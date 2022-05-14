import { flatObject } from '../../src/utils/utils'

describe('flatObject', () => {
  it('should flatten object', () => {
    // arrange
    const object = {
      a: {
        b: {
          c: 1,
        },
      },
      d: 2,
    }

    // assert
    expect(flatObject(object, 'a')).toEqual({ b: { c: 1 }, d: 2 })
  })

  it('should not flatten object', () => {
    // arrange
    const object = {
      a: 1,
      b: {
        c: 2,
      },
    }

    // assert
    expect(flatObject(object, 'a')).toEqual({
      a: 1,
      b: {
        c: 2,
      },
    })
  })
})
