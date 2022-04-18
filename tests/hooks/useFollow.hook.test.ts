import { renderHook } from '@testing-library/react-hooks'

import { useFollow } from '../../src/hooks/hooks'

describe('useFollow', () => {
  it('it should set value', () => {
    // given
    const {
      result: { current: hook },
    } = renderHook(() => useFollow(1, () => {}))

    // when
    hook.current = 2

    // then
    expect(hook.current).toBe(2)
  })

  it('should invoke callback on set value', () => {
    // given
    const callback = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => useFollow<number>(1, callback))

    // when
    hook.current = 2

    // then
    expect(callback).toHaveBeenCalledWith(2)
  })
})
