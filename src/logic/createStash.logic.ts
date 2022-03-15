export const createStash = <TState>() => {
  const name = window.location.hostname

  const read = () => {
    try {
      const state = localStorage.getItem(name)

      if (state) {
        return JSON.parse(state) as TState
      }

      return null
    } catch (error) {
      return null
    }
  }

  const set = (state: TState) => {
    try {
      localStorage.setItem(name, JSON.stringify(state))

      return state
    } catch (error) {
      return null
    }
  }

  return {
    get isNotReadable() {
      const state = read()

      return !state
    },
    read,
    set,
  }
}
