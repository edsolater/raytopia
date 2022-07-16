import { AnyFn } from '@edsolater/fnkit'

export function cloneFn<T extends AnyFn>(fn: T): T {
  return fn.bind(undefined) as T 
}
