import { renderHook } from '@testing-library/react-hooks'

import { useUpdate } from '../../src/hooks/hooks'

const mockEffectCallback = jest.fn()
const mockEffectCleanup = jest.fn()
mockEffectCallback.mockReturnValue(mockEffectCleanup)

describe('useUpdate', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should call effect callback  on mount', () => {
    // arrange
    renderHook(() => useUpdate(mockEffectCallback))

    // assert
    expect(mockEffectCallback).toHaveBeenCalledTimes(0)
  })

  it('should effect callback call on update', () => {
    // given
    const { rerender } = renderHook(() =>
      useUpdate(mockEffectCallback, Math.random())
    )

    // when
    rerender()

    // assert
    expect(mockEffectCallback).toHaveBeenCalledTimes(1)
  })
})
