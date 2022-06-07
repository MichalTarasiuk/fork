import { renderHook } from '@testing-library/react-hooks'

import { useCreation } from '../../src/hooks/hooks'
import { ignoreReact18Error } from '../tests.utils'

import type { ArrowFunction } from '../../src/types/types'
import type { DependencyList } from 'react'

class Foo {
  readonly number: number

  constructor(spy: ArrowFunction) {
    spy()
    // eslint-disable-next-line functional/no-this-expression -- tests
    this.number = Math.random()
  }
}

describe('useCreation', () => {
  ignoreReact18Error()

  it('should invoke foo constructor only on mount when dependency list is empty', () => {
    // given
    const spy = jest.fn()
    const { rerender } = renderHook(() => useCreation(() => new Foo(spy), []))

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
      readonly dependencyList: DependencyList
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

  it('should not invoke foo constructor when dependency list is the same', () => {
    // given
    type Props = {
      readonly dependencyList: DependencyList
    }
    const spy = jest.fn()
    const { rerender } = renderHook(
      ({ dependencyList }: Props) =>
        useCreation(() => new Foo(spy), dependencyList),
      { initialProps: { dependencyList: [] as DependencyList } }
    )

    // when
    rerender({ dependencyList: [] })
    rerender({ dependencyList: [] })
    rerender({ dependencyList: [] })

    // then
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
