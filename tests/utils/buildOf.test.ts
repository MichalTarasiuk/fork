import { buildOf } from 'src/utils'

describe('buildOf', () => {
  it('should build value on empty object', () => {
    // arrange
    const value = {
      a: {
        b: {
          c: '',
        },
      },
    }
    const result = buildOf(value, {})

    // assert
    expect(value).toEqual(result)
  })

  it('should build value in the schema without modifying the other keys', () => {
    // arrange
    const value = {
      a: '',
      b: '',
    }
    const result = buildOf(value, { a: 'A' })

    // assert
    expect(result).toEqual({
      a: 'A',
      b: '',
    })
  })
})
