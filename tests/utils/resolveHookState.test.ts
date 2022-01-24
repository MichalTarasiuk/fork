import { resolveHookState } from '../../src/utils'

describe('resolveHookState', () => {
  it('should resolve state which is function', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const resolvedState = resolveHookState(() => initialState)

    // assert
    expect(resolvedState).toEqual(resolvedState)
  })

  it('should resolve state which is not a function', () => {
    // arrange
    const initialState = {
      counter: 0,
    }
    const resolvedState = resolveHookState(initialState)

    // assert
    expect(resolvedState).toEqual(resolvedState)
  })
})
