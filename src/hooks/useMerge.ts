import { useRef } from 'react'

import { useFirstMountState } from '../hooks/hooks'

export const useMerge = <TObject extends Record<PropertyKey, unknown>>(
  object: TObject
) => {
  const isFirstMount = useFirstMountState()
  const savedObject = useRef(object)

  if (!isFirstMount) {
    savedObject.current = { ...savedObject.current, ...object }
  }

  return savedObject
}
