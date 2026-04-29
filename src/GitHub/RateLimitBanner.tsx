import { useEffect, useState } from "react"
import { Alert } from "@mui/material"
import { useRateLimit } from "./useRateLimit"

const WARN_THRESHOLD = 100
const TICK_INTERVAL_MS = 30_000

const formatReset = (resetAt: number | null): string => {
  if (resetAt === null) return 'soon'
  const seconds = Math.max(0, Math.round((resetAt - Date.now()) / 1000))
  if (seconds < 60) return `in ${seconds}s`
  const minutes = Math.ceil(seconds / 60)
  return `in ~${minutes} min`
}

export default function RateLimitBanner() {
  const { rest, graphql } = useRateLimit()
  const [, setTick] = useState(0)

  const lowPools: Array<{ name: string; state: typeof rest }> = []
  if (rest.remaining !== null && rest.remaining < WARN_THRESHOLD) {
    lowPools.push({ name: 'REST', state: rest })
  }
  if (graphql.remaining !== null && graphql.remaining < WARN_THRESHOLD) {
    lowPools.push({ name: 'GraphQL', state: graphql })
  }

  const isAnyLow = lowPools.length > 0

  useEffect(() => {
    if (!isAnyLow) return
    const id = setInterval(() => setTick(t => t + 1), TICK_INTERVAL_MS)
    return () => clearInterval(id)
  }, [isAnyLow])

  if (!isAnyLow) return null

  return (
    <Alert severity="warning" sx={{ mb: 1 }}>
      {lowPools.map(({ name, state }) => (
        <div key={name}>
          GitHub {name} rate limit low: {state.remaining} requests remaining,
          resets {formatReset(state.resetAt)}. Polling paused until reset.
        </div>
      ))}
    </Alert>
  )
}
