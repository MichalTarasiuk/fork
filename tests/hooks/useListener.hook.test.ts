import { renderHook } from '@testing-library/react-hooks'

import { useListener } from '../../src/hooks/hooks'

describe('useListener', () => {
  it('should return merged initial state and actions', () => {
    // arrange
    const initialState = {
      a: 1,
    }

    const actions = {
      b: () => {},
    }

    const { result } = renderHook(() =>
      useListener(initialState, actions, (state) => state)
    )

    // assert
    expect(result.current[0]).toEqual({
      ...initialState,
      ...actions,
    })
  })
})
