import { pickKeysByValue } from '../../src/helpers/helpers'

describe('pickKeysByValue', () => {
  it('should return empty array when value is primitive', () => {
    expect(pickKeysByValue(null, 1)).toEqual([])
    expect(pickKeysByValue(undefined, 1)).toEqual([])
    // @ts-ignore
    expect(pickKeysByValue('Hello world', 1)).toEqual([])
  })

  it('should return keys which values match to value', () => {
    expect(pickKeysByValue({ a: 1, b: 2, c: 3 }, 1)).toEqual(['a'])
    expect(pickKeysByValue({ a: 1, b: 2, c: 3 }, 2)).toEqual(['b'])
    expect(pickKeysByValue({ a: 1, b: 2, c: 3 }, 3)).toEqual(['c'])
  })
})
