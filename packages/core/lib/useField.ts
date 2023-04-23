import { useContext, useEffect, useMemo, useCallback } from 'react'

import dot from 'dot-object'

import { FormContext } from './Context'
import { UnformContext } from './types'

export function useField(name: string) {
  const {
    initialData,
    errors,
    scopePath,
    unregisterField,
    registerField,
    clearFieldError,
  } = useContext<UnformContext>(FormContext)

  if (!name) {
    throw new Error('You need to provide the "name" prop.')
  }

  const fieldName = useMemo(() => {
    return scopePath ? `${scopePath}.${name}` : name
  }, [name, scopePath])

  const defaultValue = useMemo(() => {
    console.log(initialData);
    return dot.pick(fieldName, initialData?.current)
  }, [fieldName, initialData?.current])

  const error = useMemo(() => {
    return errors[fieldName]
  }, [errors, fieldName])

  const clearError = useCallback(() => {
    clearFieldError(fieldName)
  }, [clearFieldError, fieldName])

  useEffect(() => () => unregisterField(fieldName), [
    fieldName,
    unregisterField,
  ])

  return {
    fieldName,
    registerField,
    defaultValue,
    clearError,
    error,
  }
}
