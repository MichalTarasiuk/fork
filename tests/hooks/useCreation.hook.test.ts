import type { DependencyList } from 'react'
import { renderHook } from '@testing-library/react-hooks'

import { useCreation } from '../../src/hooks/hooks'

class Foo {
  number: number

  constructor(spy: Function) {
    spy()
    this.number = Math.random()
  }
}

describe('useCreation', () => {
  it('should invoke foo constructor only on mount when dependency list is empty', () => {
    // given
    const spy = jest.fn()
    const { rerender } = renderHook(() => useCreation(() => new Foo(spy)))

    // when
    rerender()
    rerender()
    rerender()

    // then
    expect(spy).toHaveBeenCalledTimes(1)
  })

  it('should invoke foo constructor when dependency list change', () => {
    // given
    type Props = {
      dependencyList: DependencyList
    }
    const spy = jest.fn()
    const { rerender } = renderHook(
      ({ dependencyList }: Props) =>
        useCreation(() => new Foo(spy), dependencyList),
      { initialProps: { dependencyList: [] as DependencyList } }
    )

    // when
    rerender({ dependencyList: [{}] })
    rerender({ dependencyList: [{}, {}] })
    rerender({ dependencyList: [{}, {}, {}] })

    // then
    expect(spy).toHaveBeenCalledTimes(4)
  })
})
