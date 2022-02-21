import { useReducer } from 'react'

export const useForce = () => {
  const [, force] = useReducer(() => Math.random(), Math.random())

  return force
}
