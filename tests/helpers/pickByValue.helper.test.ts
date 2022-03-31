import { pickByValue } from '../../src/helpers/helpers'

describe('pickByValue', () => {
  it('should return empty object when value is primitive', () => {
    // @ts-ignore
    expect(pickByValue(1, null)).toEqual({})
    // @ts-ignore
    expect(pickByValue('', null)).toEqual({})
    // @ts-ignores
    expect(pickByValue(null, null)).toEqual({})
    // @ts-ignore
    expect(pickByValue(undefined, null)).toEqual({})
    // @ts-ignore
    expect(pickByValue(false, null)).toEqual({})
  })

  it('should pick values which are 1', () => {
    const object = {
      a: 1,
      b: 2,
      c: 3,
    }

    expect(pickByValue(object, 1)).toEqual({
      a: 1,
    })
  })

  it('should pick values which are match to the callback', () => {
    const object = {
      a: 1,
      b: 2,
      c: 3,
    }

    expect(pickByValue(object, (item) => item === 1)).toEqual({
      a: 1,
    })
  })
})
