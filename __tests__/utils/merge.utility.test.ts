import { merge } from '../../src/utils/utils'

describe('merge', () => {
  it('should merge objects', () => {
    // given
    const obj1 = {
      a: 1,
      b: 2,
    }
    const obj2 = {
      a: 3,
      b: 4,
    }

    // when
    const merged = merge(obj1, obj2, (a, b) => a + b)

    // then
    expect(merged).toEqual({
      a: 4,
      b: 6,
    })
  })
})
