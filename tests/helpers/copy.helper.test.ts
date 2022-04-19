import { copy } from '../../src/helpers/helpers'

describe('copy', () => {
  it('should clone object and not mutate the original object', () => {
    // arrange
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

    const copy1 = copy(data)

    // assert
    expect(copy(data)).toEqual(copy1)
    // @ts-expect-error
    copy1.test.what = '1243'
    copy1.test.date = new Date('2020-10-16')
    // @ts-ignore
    copy1.items[0] = 2

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

    // @ts-ignore
    data.items = [1, 2, 3]

    expect(copy1.items).toEqual([2])
  })
})
