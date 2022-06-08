import { renderHook } from '@testing-library/react-hooks'

import { useUnmount } from '../../src/hooks/hooks'
import { ignoreReact18Error } from '../tests.utils'

describe('useUnmount', () => {
  ignoreReact18Error()

  it('should not call provided callback on mount', () => {
    // arrange
    const spy = jest.fn()
    renderHook(() => useUnmount(spy))

    // assert
    expect(spy).not.toHaveBeenCalled()
  })

  it('should not call provided callback on re-renders', () => {
    // given
    const spy = jest.fn()
    const hook = renderHook(() => useUnmount(spy))

    // when
    hook.rerender()
    hook.rerender()
    hook.rerender()
    hook.rerender()

    // then
    expect(spy).not.toHaveBeenCalled()
  })

  it('should call provided callback on unmount', () => {
    // given
    const spy = jest.fn()
    const hook = renderHook(() => useUnmount(spy))

    // when
    hook.unmount()

    // then
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
