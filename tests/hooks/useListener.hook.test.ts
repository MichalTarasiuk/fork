import { renderHook, act } from '@testing-library/react-hooks'

import { useListener } from '../../src/hooks/hooks'
import { ignoreReact18Error } from '../tests.utils'

const mockLifeCycles = {
  onListen: (state) => state,
  beforeListen: () => true,
}

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
      useListener(initialState, actions, mockLifeCycles)
    )

    // assert
    expect(result.current[0]).toEqual({
      ...initialState,
      ...actions,
    })
  })

  it('should invoke onListen on listener call', () => {
    // arrange
    const initialState = {
      a: 1,
    }
    const actions = {
      b: () => {},
    }
    const onListen = jest.fn().mockImplementation((state) => state)

    const {
      result: { current: hook },
    } = renderHook(() =>
      useListener(initialState, actions, { ...mockLifeCycles, onListen })
    )

    // when
    const [_, listener] = hook
    act(() => {
      listener({ a: 1 }, { a: 2 })
    })

    // then
    expect(onListen).toHaveBeenCalledTimes(2)
  })

  it('should invoke onListen on mutate call', async () => {
    // arrange
    const initialState = {
      a: 1,
    }
    const actions = {
      b: async () => {},
    }
    const onListen = jest.fn().mockImplementation((state) => state)

    const {
      result: { current: hook },
    } = renderHook(() =>
      useListener(initialState, actions, { ...mockLifeCycles, onListen })
    )

    // when
    const [state] = hook
    const [mutate] = state.b

    await act(async () => {
      await mutate()
    })

    // then
    expect(onListen).toHaveBeenCalledTimes(3)
  })

  it('should invoke beforeListen on listener invoke', async () => {
    // arrange
    const initialState = {
      a: 1,
    }
    const actions = {
      b: () => {},
    }
    const beforeListen = jest.fn().mockImplementation(() => true)

    const {
      result: { current: hook },
    } = renderHook(() =>
      useListener(initialState, actions, {
        ...mockLifeCycles,
        beforeListen,
      })
    )

    // when
    const [_, listener] = hook
    await act(async () => {
      listener({ a: 1 }, { a: 2 })
    })

    // then
    expect(beforeListen).toHaveBeenCalledTimes(1)
  })
})
