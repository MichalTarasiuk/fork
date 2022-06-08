import { partition } from '../../src/utils/utils'

describe('split', () => {
  it('should split an object into two objects', () => {
    // arrange
    const object = {
      a: 1,
      b: 2,
      c: 3,
      d: 4,
      e: 5,
      f: 6,
      g: 7,
      h: 8,
      i: 9,
      j: 10,
      k: 11,
      l: 12,
      m: 13,
      n: 14,
      o: 15,
      p: 16,
      q: 17,
      r: 18,
      s: 19,
      t: 20,
      u: 21,
      v: 22,
      w: 23,
      x: 24,
      y: 25,
      z: 26,
    }
    const [a, b] = partition(object, (value) =>
      typeof value === 'number' ? value % 2 === 0 : false
    )

    // assert
    expect(a).toEqual({
      b: 2,
      d: 4,
      f: 6,
      h: 8,
      j: 10,
      l: 12,
      n: 14,
      p: 16,
      r: 18,
      t: 20,
      v: 22,
      x: 24,
      z: 26,
    })
    expect(b).toEqual({
      a: 1,
      c: 3,
      e: 5,
      g: 7,
      i: 9,
      k: 11,
      m: 13,
      o: 15,
      q: 17,
      s: 19,
      u: 21,
      w: 23,
      y: 25,
    })
  })
})
