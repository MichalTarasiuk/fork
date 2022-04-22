import { renderHook } from '@testing-library/react-hooks'

import { useDidUnmount } from '../../src/hooks/hooks'

describe('useUnmount', () => {
  it('should not call provided callback on mount', () => {
    const spy = jest.fn()
    renderHook(() => useDidUnmount(spy))

    expect(spy).not.toHaveBeenCalled()
  })

  it('should not call provided callback on re-renders', () => {
    const spy = jest.fn()
    const hook = renderHook(() => useDidUnmount(spy))

    hook.rerender()
    hook.rerender()
    hook.rerender()
    hook.rerender()

    expect(spy).not.toHaveBeenCalled()
  })

  it('should call provided callback on unmount', () => {
    const spy = jest.fn()
    const hook = renderHook(() => useDidUnmount(spy))

    hook.unmount()

    expect(spy).toHaveBeenCalledTimes(1)
  })
})
