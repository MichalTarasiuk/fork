import { useRef, useEffect } from 'react'

const useFirstMount = () => {
  const ref = useRef(true)

  useEffect(() => {
    if (ref.current) {
      ref.current = false
    }
  }, [])

  return ref.current
}

export const useReRenderCount = () => {
  const ref = useRef(0)
  const isFirstMount = useFirstMount()

  if (!isFirstMount) {
    ref.current++
  }

  return ref.current
}
