import { entries, fromEntries } from '../../src/utils/utils'

describe('entries', () => {
  it('should return an array of arrays', () => {
    expect(entries({ a: 1, b: 2 })).toEqual([
      ['a', 1],
      ['b', 2],
    ])
  })

  it('should return an empty array if the object is empty', () => {
    expect(entries({})).toEqual([])
  })
})

describe('fromEntries', () => {
  it('should return an object', () => {
    expect(
      fromEntries([
        ['a', 1],
        ['b', 2],
      ])
    ).toEqual({ a: 1, b: 2 })
  })

  it('should return an empty object if the array is empty', () => {
    expect(fromEntries([])).toEqual({})
  })
})
