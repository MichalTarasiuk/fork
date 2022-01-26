import { useRef, useEffect } from 'react'

type Config<TValue> = {
  mock?: TValue
}

export const usePrevious = <TValue>(value: TValue, config?: Config<TValue>) => {
  const { mock } = config || {}

  const savedValue = useRef<TValue | undefined>(mock || undefined)

  useEffect(() => {
    savedValue.current = value
  }, [value])

  return savedValue.current
}
