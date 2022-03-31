import { set } from '../../src/helpers/helpers'

describe('set', () => {
  it('should set value', () => {
    const value = {
      a: 1,
      b: 2,
      c: 3,
    }

    const mapper = {
      a: {
        to: 'A',
      },
      b: {
        to: 'B',
      },
      c: {
        to: 'C',
      },
    }

    const result = set(value, mapper)

    expect(result).toEqual({
      a: 'A',
      b: 'B',
      c: 'C',
    })
  })

  it('should remove value', () => {
    const value = {
      a: 1,
      b: 2,
      c: 3,
    }

    const mapper = {
      a: {
        to: 'A',
      },
      b: {
        to: 'B',
      },
      c: {
        from: 'C',
      },
    }

    const result = set(value, mapper)

    expect(result).toEqual({
      a: 'A',
      b: 'B',
    })
  })
})
