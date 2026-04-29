import { useEffect, useState } from "react"
import { getRateLimitState, RateLimitState, subscribeRateLimit } from "./Api"

export interface RateLimitSnapshot {
  rest: RateLimitState
  graphql: RateLimitState
}

const snapshot = (): RateLimitSnapshot => {
  const state = getRateLimitState()
  return {
    rest: { ...state.rest },
    graphql: { ...state.graphql },
  }
}

export const useRateLimit = (): RateLimitSnapshot => {
  const [state, setState] = useState<RateLimitSnapshot>(snapshot)

  useEffect(() => {
    return subscribeRateLimit(() => setState(snapshot()))
  }, [])

  return state
}
