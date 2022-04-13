import { renderHook } from '@testing-library/react-hooks'

import { usePrevious } from '../../src/hooks/hooks'

const setUp = () =>
  renderHook(({ state }) => usePrevious(state), { initialProps: { state: 0 } })

it('should return undefined on initial render', () => {
  // arrange
  const { result } = setUp()

  // assert
  expect(result.current).toBeUndefined()
})

it('should always return previous state after each update', () => {
  // given
  const { result, rerender } = setUp()

  // when
  rerender({ state: 2 })

  // then
  expect(result.current).toBe(0)

  // when
  rerender({ state: 4 })

  // then
  expect(result.current).toBe(2)

  // when
  rerender({ state: 6 })

  // then
  expect(result.current).toBe(4)
})
