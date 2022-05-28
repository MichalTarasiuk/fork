import { useReducer } from 'react'

export const useForce = () => {
  const [, force] = useReducer((state) => !state, false)

  return force
}
