import { renderHook, act } from '@testing-library/react-hooks'

import { useMount } from '../../src/hooks/hooks'
import { ignoreReact18Error } from '../tests.utils'

const mockEffectCleanup = jest.fn()
const mockEffectCallback = jest.fn().mockReturnValue(mockEffectCleanup)

describe('useMount', () => {
  ignoreReact18Error()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should run provided effect only once', () => {
    // given
    const { rerender } = renderHook(() => useMount(mockEffectCallback))

    // when
    rerender()

    // then
    expect(mockEffectCallback).toHaveBeenCalledTimes(1)
  })

  it('should run clean-up provided on unmount', () => {
    // given
    const { unmount } = renderHook(() => useMount(mockEffectCallback))

    // when
    act(() => {
      unmount()
    })

    // then
    expect(mockEffectCleanup).toHaveBeenCalled()
  })

  it('should not call on re-render', () => {
    // given
    const { rerender } = renderHook(() => useMount(mockEffectCallback))

    // when
    rerender()

    // then
    expect(mockEffectCallback).toHaveBeenCalledTimes(1)
  })
})
