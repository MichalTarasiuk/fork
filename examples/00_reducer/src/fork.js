import fork from 'react-fork'

export const action = {
  increase: 'INCREASE',
  decrease: 'DECREASE',
}

const reducer = (counter, action) => {
  switch (action.type) {
    case action.increase:
      return {
        counter: counter + 1,
      }
    case action.decrease:
      return {
        counter: counter - 1,
      }
    default:
      return {
        counter,
      }
  }
}

export const { ForkProvider, useFork } = fork({ counter: 0 }, (set, get) => ({
  counter: 0,
  setCounter: (action) => {
    set((state) => reducer(state.counter, action))
  },
  isDivisible() {
    return get().counter % 2 === 0
  },
}))
