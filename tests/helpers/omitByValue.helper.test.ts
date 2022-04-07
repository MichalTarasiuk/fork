import { omitByValue } from '../../src/helpers/helpers'

describe('omitByValue', () => {
  it('should return empty object when value is primitive', () => {
    // @ts-ignore
    expect(omitByValue(1, null)).toEqual({})
    // @ts-ignore
    expect(omitByValue('', null)).toEqual({})
    // @ts-ignores
    expect(omitByValue(null, null)).toEqual({})
    // @ts-ignore
    expect(omitByValue(undefined, null)).toEqual({})
    // @ts-ignore
    expect(omitByValue(false, null)).toEqual({})
  })

  it(`should pick values which are't 1`, () => {
    // arrange
    const object = {
      a: 1,
      b: 2,
      c: 3,
    }

    // assert
    expect(omitByValue(object, 1)).toEqual({
      b: 2,
      c: 3,
    })
  })

  it(`should pick values which are't match to the callback`, () => {
    // arrange
    const object = {
      a: 1,
      b: 2,
      c: 3,
    }

    // assert
    expect(omitByValue(object, (item) => item === 1)).toEqual({
      b: 2,
      c: 3,
    })
  })
})
