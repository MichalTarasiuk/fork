import { getSlugs } from '../../src/utils'

describe('getSlugs', () => {
  it('should return slugs for value', () => {
    // arrange
    const value = {
      a: 1,
      b: 2,
    }
    const slugs = getSlugs(value)

    // assert
    expect(slugs).toMatchInlineSnapshot(`
      Object {
        "a": "a",
        "b": "b",
      }
    `)
  })

  it('should returm slugs for nested value', () => {
    // arrange
    const value = {
      a: 1,
      b: 2,
      c: {
        d: 3,
      },
    }
    const slugs = getSlugs(value)

    // assert
    expect(slugs).toMatchInlineSnapshot(`
      Object {
        "a": "a",
        "b": "b",
        "c": "c",
        "d": "c.d",
      }
    `)
  })
})
