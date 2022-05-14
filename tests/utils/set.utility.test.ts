import { set } from '../../src/utils/utils'

describe('set', () => {
  it('should set value', () => {
    // arrange
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

    // assert
    expect(set(value, mapper)).toEqual({
      a: 'A',
      b: 'B',
      c: 'C',
    })
  })

  it('should remove value', () => {
    // arrange
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

    // assert
    expect(set(value, mapper)).toEqual({
      a: 'A',
      b: 'B',
    })
  })
})
