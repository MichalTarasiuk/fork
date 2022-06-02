import { renderHook, act } from '@testing-library/react-hooks'

import { useListener } from '../../src/hooks/hooks'
import { ignoreReact18Error } from '../tests.utils'

describe('useListener', () => {
  ignoreReact18Error()

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

  it('should invoke fn on listener call', () => {
    // arrange
    const initialState = {
      a: 1,
    }
    const actions = {
      b: () => {},
    }
    const fn = jest.fn().mockImplementation((state) => state)

    const {
      result: { current: hook },
    } = renderHook(() => useListener(initialState, actions, fn))

    // when
    const [, listener] = hook
    act(() => {
      listener({ a: 1 }, { a: 2 })
    })

    // then
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should invoke fn on mutate call', async () => {
    // arrange
    const initialState = {
      a: 1,
    }
    const actions = {
      b: async () => {},
    }
    const fn = jest.fn().mockImplementation((state) => state)

    const {
      result: { current: hook },
    } = renderHook(() => useListener(initialState, actions, fn))

    // when
    const [state] = hook
    const [mutate] = state.b

    await act(async () => {
      await mutate()
    })

    // then
    expect(fn).toHaveBeenCalledTimes(3)
  })
})
