import { renderHook } from '@testing-library/react-hooks'

import { useMultipleMutations } from '../../src/hooks/hooks'
import { wait } from '../tests.utils'

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

describe('useMutationsMap', () => {
  it('should generate status for async action', () => {
    // arrange
    const {
      result: { current: hook },
    } = renderHook(() => useMultipleMutations(object, () => {}))

    // assert
    expect(hook.multipleMutations).toMatchInlineSnapshot(`
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
    } = renderHook(() => useMultipleMutations(object, callback))

    // when
    const [getUser] = hook.multipleMutations.getUser

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

  it('should return update async slice', async () => {
    // given
    const callback = jest.fn()
    const {
      result: { current: hook },
    } = renderHook(() => useMultipleMutations(object, callback))

    // when
    const [getUser] = hook.multipleMutations.getUser

    // when
    await getUser()

    // then
    const [, status] = hook.multipleMutations.getUser
    expect(status).toBe('success')
  })
})
