import { useEffect, useState } from 'react'

// Returns a debounced copy of `value` that only updates after `delay` ms of no
// changes. Used to throttle search inputs so each keystroke doesn't fire a
// query/refetch. Replaces the previous `useDeferredValue` usage (which defers
// but doesn't actually rate-limit network calls).
export function useDebounce<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debounced
}
