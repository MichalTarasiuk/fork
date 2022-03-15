import { resolveState } from '../../src/helpers/helpers'

describe('resolveState', () => {
  it('should resolve state which is function', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const resolvedState = resolveState(() => initialState)

    // assert
    expect(resolvedState).toEqual(resolvedState)
  })

  it('should resolve state which is not a function', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const resolvedState = resolveState(initialState)

    // assert
    expect(resolvedState).toEqual(resolvedState)
  })
})
