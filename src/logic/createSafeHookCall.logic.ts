import React, { createContext, useContext } from 'react'

import { createRef, noop } from '../utils/utils'

import type { ArrowFunction } from '../types/types'
import type { ReactNode } from 'react'

type ProviderProps = { readonly children: ReactNode }

const uppercaseFirst = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

export const createSafeHookCall = (name: string) => {
  const formatedName = uppercaseFirst(name)
  const border = createContext(false)

  const safeHookCall = <THook extends ArrowFunction>(hook: THook) => {
    return ((...params: Parameters<THook>) => {
      const isSafeCall = useContext(border)

      if (!isSafeCall) {
        throw new Error(
          `use${formatedName} must be used within a ${formatedName}Provider`
        )
      }

      return hook(...params)
    }) as THook
  }

  const { ref: providerBody, setRef: setProviderBody } =
    createRef<ArrowFunction>(noop)

  const Provider = ({ children }: ProviderProps) => {
    providerBody.current()

    return React.createElement(border.Provider, { value: true }, children)
  }

  return { Provider, safeHookCall, setProviderBody }
}
