import { renderHook } from '@testing-library/react-hooks'

import { useAsync } from '../../src/hooks/hooks'
import { wait, ignoreReact18Error } from '../tests.utils'

const mockUser = {
  name: 'John',
  surname: 'Doe',
  age: 20,
  getAge: () => Promise.resolve(20),
  getName: () => Promise.resolve('John'),
  getSurname: () => Promise.resolve('Doe'),
}

const object = {
  async getUser() {
    await wait(1000)

    return mockUser
  },
}

describe('useAsync', () => {
  ignoreReact18Error()

  it('should generate status for async action', () => {
    // arrange
    const {
      result: { current: hook },
    } = renderHook(() => useAsync(object, () => {}))

    // assert
    expect(hook).toMatchInlineSnapshot(`
      Object {
        "getUser": Array [
          [Function],
          "idle",
        ],
      }
    `)
  })

  it('should invoke callback on each state change', async () => {
    // given
    const callback = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => useAsync(object, callback))

    // when
    const [getUser] = hook.getUser

    // when
    await getUser()

    // then
    expect(callback.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "getUser": Array [
              [Function],
              "loading",
            ],
          },
        ],
        Array [
          Object {
            "getUser": Array [
              [Function],
              "success",
            ],
          },
        ],
      ]
    `)
  })

  it('should return stale state after async action call', async () => {
    // given
    const callback = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => useAsync(object, callback))

    // when
    const [getUser, status] = hook.getUser

    // when
    await getUser()

    // then
    expect(status).toBe('idle')
  })
})
