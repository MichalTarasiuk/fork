import { pickKeysByType } from '../../src/helpers/helpers'

const value = {
  a: 1,
  b: 2,
}

describe('pickKeysByType', () => {
  it('should return keys with true value', () => {
    // arrange
    const result = pickKeysByType(value, 1)

    // assert
    expect(result).toMatchInlineSnapshot(`
      Array [
        "a",
      ]
    `)
  })
})
