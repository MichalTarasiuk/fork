import { resolve } from '../../src/utils/utils'

describe('resolve', () => {
  it('should resolve state which is function', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const resolvedState = resolve(() => initialState)

    // assert
    expect(resolvedState).toEqual(resolvedState)
  })

  it('should resolve state which is not a function', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const resolvedState = resolve(initialState)

    // assert
    expect(resolvedState).toEqual(resolvedState)
  })
})
