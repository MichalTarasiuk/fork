import { renderHook } from '@testing-library/react-hooks'

import { usePatch } from '../../src/hooks/hooks'

describe('useRefState', () => {
  it('should change state after setState action', () => {
    // given
    const callback = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => usePatch({ a: 1, b: 2 }, callback))

    // when
    hook.setState({ a: 2 })

    // then
    expect(hook.state.current).toEqual({ a: 2, b: 2 })
  })

  it('should invoke callback after setState action', () => {
    // given
    const callback = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => usePatch({ a: 1 }, callback))

    // when
    hook.setState({ a: 2 })

    // then
    expect(callback).toHaveBeenCalledWith({ a: 2 })
  })

  it('should not invoke callback after replaceState action', () => {
    // given
    const callback = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => usePatch({ a: 1 }, callback))

    // when
    hook.replaceState({ a: 2 })

    // then
    expect(callback).not.toHaveBeenCalled()
  })
})
