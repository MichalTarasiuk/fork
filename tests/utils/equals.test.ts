import { equals } from 'src/utils'

describe.only('equals', () => {
  it('should return false when two sets not match', () => {
    expect(
      equals([{ test: '123' }, { test: '455' }, { test: '455' }], [])
    ).toBeFalsy()

    expect(
      equals(
        [{ test: '123' }, { test: '455' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }, { test: '455', test1: 'what' }]
      )
    ).toBeFalsy()

    expect(equals([{}], [])).toBeFalsy()

    expect(equals([], [{}])).toBeFalsy()
    expect(equals(new Date(), new Date('1999'))).toBeFalsy()

    expect(
      equals(
        {
          unknown: undefined,
          userName: '',
          fruit: '',
        },
        {
          userName: '',
          fruit: '',
          break: {},
        }
      )
    ).toBeFalsy()
  })

  it('should return false when either type is primitive', () => {
    expect(equals(null, [])).toBeFalsy()
    expect(equals([], null)).toBeFalsy()
    expect(equals({}, undefined)).toBeFalsy()
    expect(equals(undefined, {})).toBeFalsy()
  })

  it('should return true when two sets matches', () => {
    expect(
      equals([{ name: 'useFieldArray' }], [{ name: 'useFieldArray' }])
    ).toBeTruthy()

    expect(
      equals(
        [{ test: '123' }, { test: '455' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }, { test: '455' }]
      )
    ).toBeTruthy()

    expect(equals({}, {})).toBeTruthy()

    expect(equals([], [])).toBeTruthy()

    expect(
      equals(
        [{ test: '123' }, { test: '455' }],
        [{ test: '123' }, { test: '455' }]
      )
    ).toBeTruthy()

    expect(
      equals(
        [
          {
            test: '123',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
          {
            test: '455',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
        ],
        [
          {
            test: '123',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
          {
            test: '455',
            nestedArray: [{ test: '123' }, { test: '455' }, { test: '455' }],
          },
        ]
      )
    ).toBeTruthy()
  })

  it('should compare date time object valueOf', () => {
    expect(
      equals({ test: new Date('1990') }, { test: new Date('1990') })
    ).toBeTruthy()
  })
})
