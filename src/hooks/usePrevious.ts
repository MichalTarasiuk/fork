import { useRef, useEffect } from 'react'

export const usePrevious = <TValue>(value: TValue, initialState?: TValue) => {
  const savedValue = useRef<TValue | undefined>(initialState || undefined)

  useEffect(() => {
    savedValue.current = value
  }, [value])

  return savedValue.current
}
