import { renderHook } from '@testing-library/react-hooks'

import { useDidUpdate } from '../../src/hooks/hooks'

const mockEffectCallback = jest.fn()
const mockEffectCleanup = jest.fn()
mockEffectCallback.mockReturnValue(mockEffectCleanup)

describe('useDidUpdate', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call effect callback  on mount', () => {
    // arrange
    renderHook(() => useDidUpdate(mockEffectCallback))

    // assert
    expect(mockEffectCallback).toHaveBeenCalledTimes(0)
  })

  it('should effect callback call on update', () => {
    // given
    const { rerender } = renderHook(() =>
      useDidUpdate(mockEffectCallback, Math.random())
    )

    // when
    rerender()

    // assert
    expect(mockEffectCallback).toHaveBeenCalledTimes(1)
  })
})
