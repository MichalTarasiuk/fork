import React, { createContext, useContext } from 'react'

import { LIBLARY_NAME } from '../constants'
import { noop } from '../utils/utils'

import type { PlainFunction, Noop } from '../types/types'
import type { ReactNode } from 'react'

type ProviderProps = { readonly children: ReactNode }

const uppercaseFirst = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1)

export const createSafeHookCall = () => {
  const formatedName = uppercaseFirst(LIBLARY_NAME)
  const border = createContext(false)

  const safeHookCall = <THook extends PlainFunction>(hook: THook) => {
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

  let providerBody = noop

  const setProviderBody = (nextProviderBody: Noop) => {
    providerBody = nextProviderBody
  }

  const Provider = ({ children }: ProviderProps) => {
    providerBody()

    return React.createElement(border.Provider, { value: true }, children)
  }

  return { Provider, safeHookCall, setProviderBody }
}
