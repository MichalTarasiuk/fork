import { renderHook } from '@testing-library/react-hooks'
import { act } from '@testing-library/react'

import { useListener } from '../../src/hooks/hooks'

describe('useListener', () => {
  it('should set state to initial state on mount', () => {
    // arrange
    const listener = jest.fn().mockImplementation((value) => value)
    const { result } = renderHook(() => useListener(1, listener))

    // assert
    expect(result.current[0]).toBe(1)
  })

  it('should set state on invoke observer', () => {
    // given
    const listener = jest.fn().mockImplementation((value) => value)
    const { result } = renderHook(() => useListener(1, listener))

    // when
    const observer = result.current[1]
    act(() => {
      observer(2)
    })

    // then
    expect(result.current[0]).toBe(2)
  })

  it('should not invoke observer on unmounted component', () => {
    // given
    const listener = jest.fn().mockImplementation((value) => value)
    const { result, unmount } = renderHook(() => useListener(1, listener))

    // when
    const observer = result.current[1]
    unmount()
    act(() => {
      observer(2)
    })

    // then
    expect(result.current[0]).toBe(1)
  })
})
