import { renderHook } from '@testing-library/react-hooks'

import { usePrevious } from '../../src/hooks'

const setUp = () =>
  renderHook(({ state }) => usePrevious(state), { initialProps: { state: 0 } })

it('should return undefined on initial render', () => {
  const { result } = setUp()

  expect(result.current).toBeUndefined()
})

it('should always return previous state after each update', () => {
  const { result: hook, rerender } = setUp()

  // when
  rerender({ state: 2 })

  // then
  expect(hook.current).toBe(0)

  // when
  rerender({ state: 4 })

  // then
  expect(hook.current).toBe(2)

  // when
  rerender({ state: 6 })

  // then
  expect(hook.current).toBe(4)
})
