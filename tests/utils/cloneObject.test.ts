import { cloneObject } from 'src/utils'

describe('cloneObject', () => {
  it('should clone object and not mutate the original object', () => {
    const data = {
      items: [],
      test: {
        date: new Date('2020-10-15'),
        test0: 12,
        test1: '12',
        test2: [1, 2, 3, 4],
        deep: {
          date: new Date('2020-10-15'),
          test0: 12,
          test1: '12',
          test2: [1, 2, 3, 4],
        },
      },
      test2: new Set([1, 2]),
      test1: new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]),
    }

    const copy = cloneObject(data)
    expect(cloneObject(data)).toEqual(copy)

    // @ts-expect-error
    copy.test.what = '1243'
    copy.test.date = new Date('2020-10-16')
    // @ts-expect-error
    copy.items[0] = 2

    expect(data).toEqual({
      items: [],
      test: {
        date: new Date('2020-10-15'),
        test0: 12,
        test1: '12',
        test2: [1, 2, 3, 4],
        deep: {
          date: new Date('2020-10-15'),
          test0: 12,
          test1: '12',
          test2: [1, 2, 3, 4],
        },
      },
      test2: new Set([1, 2]),
      test1: new Map([
        [1, 'one'],
        [2, 'two'],
        [3, 'three'],
      ]),
    })

    // @ts-expect-error
    data.items = [1, 2, 3]

    expect(copy.items).toEqual([2])
  })
})
