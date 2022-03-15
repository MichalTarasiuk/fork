import { pick } from '../../src/helpers/helpers'

const value = {
  a: {
    b: '',
  },
  c: '',
  d: [],
}

describe('pick', () => {
  it('should pick selected keys', () => {
    // arrange
    const result = pick(value, ['a'])

    // assert
    expect(result).toEqual({ a: { b: '' } })
  })

  it('result should not have the same reference', () => {
    // arrange
    const result = pick(value)

    // arrange
    expect(result).not.toBe(value)
  })
})
