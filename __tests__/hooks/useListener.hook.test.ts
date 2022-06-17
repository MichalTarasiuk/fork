import { renderHook, act } from '@testing-library/react-hooks'

import { useListener } from '../../src/hooks/hooks'
import { ignoreReact18Error } from '../tests.utils'

describe('useListener', () => {
  ignoreReact18Error()

  it('should merge state and actions', () => {
    // arrange
    const initialState = {
      a: 1,
    }

    const actions = {
      b: () => {},
    }

    const { result } = renderHook(() =>
      useListener(initialState, actions, {
        onListen: (state) => state,
        beforeListen: () => true,
      })
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
      useListener(initialState, actions, { beforeListen: () => true, onListen })
    )

    // when
    const [_, listener] = hook
    act(() => {
      listener({ a: 1 }, { a: 2 })
    })

    // then
    expect(onListen).toHaveBeenCalledTimes(2)
  })


  it('should invoke beforeListen on listener invoke', () => {
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
        beforeListen,
        onListen: (state) => state,
      })
    )

    // when
    const [_, listener] = hook
    act(() => {
      listener({ a: 1 }, { a: 2 })
    })

    // then
    expect(beforeListen).toHaveBeenCalledTimes(1)
  })
})
