import { nestObject } from '../../src/helpers/helpers'

describe('nestObject', () => {
  it('should return nest object by value which is function', () => {
    // arrange
    const object = {
      a: 1,
      b: 2,
      c: 3,
    }

    // assert
    expect(nestObject(object, 'd', (value) => value === 2)).toEqual({
      a: 1,
      d: {
        b: 2,
      },
      c: 3,
    })
  })

  it('should return nest object by value which is primitive', () => {
    // arrange
    const object = {
      a: 1,
      b: 2,
      c: 3,
    }

    // assert
    expect(nestObject(object, 'd', 2)).toEqual({
      a: 1,
      d: {
        b: 2,
      },
      c: 3,
    })
  })
})
