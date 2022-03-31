import { entries, fromEntries } from '../../src/helpers/helpers'

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

  it('should return an empty array if the object is null', () => {
    expect(entries(null)).toEqual([])
  })

  it('should return an empty array if the object is undefined', () => {
    expect(entries(undefined)).toEqual([])
  })

  it('should return an empty array if the object is not an object', () => {
    // @ts-ignore
    expect(entries(1)).toEqual([])
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

  it('should return an empty object if the value is null', () => {
    expect(fromEntries(null)).toEqual({})
  })

  it('should return an empty object if the value is undefined', () => {
    expect(fromEntries(undefined)).toEqual({})
  })

  it('should return an empty object if the value is not an object', () => {
    // @ts-ignore
    expect(fromEntries(1)).toEqual({})
  })
})
