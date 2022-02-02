import { renderHook } from '@testing-library/react-hooks'
import { act } from '@testing-library/react'

import { useListener } from 'src/hooks'
import { createObserver } from 'src/utils'

describe('useListener', () => {
  it('should update state', () => {
    // given
    const { result: hook } = renderHook(() => useListener(0))

    // when
    act(() => {
      hook.current.listener(1)
    })

    // then
    expect(hook.current.state).toBe(1)
  })

  it('notify function from observer should update state', () => {
    // given
    const observer = createObserver<number>()
    const { result: hook } = renderHook(() => useListener(0))

    // when
    observer.subscribe(hook.current.listener)

    // then
    expect(observer.getListeners)

    // when
    act(() => {
      observer.notify(1)
    })

    // then
    expect(hook.current.state).toBe(1)
  })
})
