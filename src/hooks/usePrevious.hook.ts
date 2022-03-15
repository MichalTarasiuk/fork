import { useRef, useEffect } from 'react'

export const usePrevious = <TValue>(value: TValue) => {
  const savedValue = useRef<TValue | undefined>(undefined)

  useEffect(() => {
    savedValue.current = value
  }, [value])

  return savedValue.current
}
