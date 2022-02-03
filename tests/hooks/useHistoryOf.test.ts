import { useState } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { useHistoryOf } from '../../src/hooks'
import type { Config } from '../../src/hooks/useHistoryOf'

const renderUseHistoryOf = (config?: Config<number>) =>
  renderHook(() => {
    const [counter, setCounter] = useState(0)
    const [darkMode, setDarkMode] = useState(false)
    const history = useHistoryOf(counter, config)

    const increase = () => {
      setCounter((prevState) => prevState + 1)
    }

    const toggleDarkMode = () => {
      setDarkMode((prevState) => !prevState)
    }

    return { counter, increase, history, darkMode, toggleDarkMode }
  })

describe('useHistoryOf', () => {
  it('should apply initial history from config', () => {
    // arrange
    const { result } = renderUseHistoryOf({
      initialHistory: [1, 2, 3],
    })
    const hook = result.current

    // assert
    expect(hook.history.savedHistory).toEqual([1, 2, 3])
  })

  it('should cut history to capacity', () => {
    // arrange
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const capacity = 11
    const { result } = renderUseHistoryOf({
      initialHistory,
      capacity,
    })
    const hook = result.current

    // assert
    expect(hook.history.savedHistory).toEqual(initialHistory.slice(0, capacity))
  })

  it('should move back', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { result } = renderUseHistoryOf({
      initialHistory,
    })
    const hook = result.current
    const initialPosition = { ...hook.history.handler.position }

    // when
    hook.history.handler.back()

    // then
    expect(hook.history.handler.position.index).toBe(initialPosition.index - 1)
  })

  it('it should not move back when the current position is first', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { result } = renderUseHistoryOf({
      initialHistory,
      initialIndex: 0,
    })
    const hook = result.current
    const initialPosition = { ...hook.history.handler.position }

    // when
    hook.history.handler.back()

    // then
    expect(hook.history.handler.position).toEqual(initialPosition)
  })

  it('should move forward', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { result } = renderUseHistoryOf({
      initialHistory,
      initialIndex: 0,
    })
    const hook = result.current
    const initialPosition = { ...hook.history.handler.position }

    // when
    hook.history.handler.forward()

    // then
    expect(hook.history.handler.position.index).toBe(initialPosition.index + 1)
  })

  it('should not move forward when the current position is final', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { result } = renderUseHistoryOf({
      initialHistory,
    })
    const hook = result.current
    const initialPosition = { ...hook.history.handler.position }

    // when
    hook.history.handler.forward()

    // then
    expect(hook.history.handler.position).toEqual(initialPosition)
  })

  it('should go to a position that is in the range', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { result } = renderUseHistoryOf({
      initialHistory,
    })
    const hook = result.current

    // when
    hook.history.handler.go(5)

    // then
    expect(hook.history.handler.position.index).toBe(5)
  })

  it('should not go to a position that is not in the range', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { result } = renderUseHistoryOf({
      initialHistory,
    })
    const hook = result.current
    const initialPosition = { ...hook.history.handler.position }

    // when
    hook.history.handler.go(100)

    // then
    expect(hook.history.handler.position).toEqual(initialPosition)
  })

  it('should round index in move by go', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { result } = renderUseHistoryOf({
      initialHistory,
      initialIndex: 0,
    })
    const hook = result.current
    const initialPosition = { ...hook.history.handler.position }

    // when
    const index = 4.8239289
    hook.history.handler.go(index)

    // then
    expect(hook.history.handler.position.index).toEqual(5)
  })

  it('should save data in history on each rerender', () => {
    // given
    const { result } = renderUseHistoryOf()

    // when
    act(() => {
      result.current.increase()
    })
    act(() => {
      result.current.increase()
    })

    // then
    expect(result.current.counter).toBe(2)
    expect(result.current.history.savedHistory).toEqual([0, 1])
  })
})
