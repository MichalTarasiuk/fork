import { createStash } from '../../src/logic/logic'

describe('createStash', () => {
  const stash = createStash()

  afterEach(() => {
    stash.clear()
  })

  it('should save and read a value', () => {
    // given
    const value = { foo: 'bar' }

    // when
    stash.save(value)

    // then
    expect(stash.read()).toEqual({
      success: true,
      value,
    })
  })

  it('should clear the value', () => {
    // given
    const value = { foo: 'bar' }

    // when
    stash.save(value)
    stash.clear()

    // then
    expect(stash.read()).toEqual({
      success: false,
      error: new Error('Item with key "localhost" does not exist'),
    })
  })
})
