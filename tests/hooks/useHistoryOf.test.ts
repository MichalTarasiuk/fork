import { useState } from 'react'
import { renderHook, act } from '@testing-library/react-hooks'

import { useHistoryOf } from 'src/hooks'
import type { Config } from 'src/hooks/useHistoryOf'

const renderUseHistoryOf = (config?: Config<number>) =>
  renderHook(() => {
    const [counter, setCounter] = useState(0)
    const history = useHistoryOf(counter, config)

    const increase = () => {
      setCounter((prevState) => prevState + 1)
    }

    return { counter, increase, history }
  }).result.current

describe('useHistoryOf', () => {
  it('should apply initial history from config', () => {
    // arrange
    const { history } = renderUseHistoryOf({
      initialHistory: [1, 2, 3],
    })

    // assert
    expect(history.savedHistory).toEqual([1, 2, 3])
  })

  it('should cut history to capacity', () => {
    // arrange
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const capacity = 11
    const { history } = renderUseHistoryOf({
      initialHistory,
      capacity,
    })

    // assert
    expect(history.savedHistory).toEqual(initialHistory.slice(0, capacity))
  })

  it('should move back', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { history } = renderUseHistoryOf({
      initialHistory,
    })
    const initialPosition = { ...history.handler.position }

    // when
    history.handler.back()

    // then
    expect(history.handler.position.index).toBe(initialPosition.index - 1)
  })

  it('it should not move back when the current position is first', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { history } = renderUseHistoryOf({
      initialHistory,
      initialIndex: 0,
    })
    const initialPosition = { ...history.handler.position }

    // when
    history.handler.back()

    // then
    expect(history.handler.position).toEqual(initialPosition)
  })

  it('should move forward', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { history } = renderUseHistoryOf({
      initialHistory,
      initialIndex: 0,
    })
    const initialPosition = { ...history.handler.position }

    // when
    history.handler.forward()

    // then
    expect(history.handler.position.index).toBe(initialPosition.index + 1)
  })

  it('should not move forward when the current position is final', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { history } = renderUseHistoryOf({
      initialHistory,
    })
    const initialPosition = { ...history.handler.position }

    // when
    history.handler.forward()

    // then
    expect(history.handler.position).toEqual(initialPosition)
  })

  it('should go to a position that is in the range', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { history } = renderUseHistoryOf({
      initialHistory,
    })

    // when
    history.handler.go(5)

    // then
    expect(history.handler.position.index).toBe(5)
  })

  it('should not go to a position that is not in the range', () => {
    // given
    const initialHistory = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
    const { history } = renderUseHistoryOf({
      initialHistory,
    })
    const initialPosition = { ...history.handler.position }

    // when
    history.handler.go(100)

    // then
    expect(history.handler.position).toEqual(initialPosition)
  })

  it.todo('should save data in history on each rerender')
  it.todo(
    'should not save data in history on each rerender when state does not change'
  )
})
