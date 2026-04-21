import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchPullRequests } from '../PullRequests/fetchPullRequests'
import { loadSeenPrKeys, saveSeenPrKeys, makePrKey } from '../notifications/seenPrStore'
import { showPrNotification } from '../notifications/notificationService'

const POLL_INTERVAL_MS = 60_000

interface UsePollingResult {
  rows: any[]
  isLoading: boolean
  lastPollTime: Date | null
}

export function usePolling(filters: string): UsePollingResult {
  const [rows, setRows] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [lastPollTime, setLastPollTime] = useState<Date | null>(null)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const seenKeysRef = useRef<Set<string> | null>(null)
  const isFirstFetchRef = useRef(true)
  const filtersRef = useRef(filters)
  const isFetchingRef = useRef(false)

  // Keep filtersRef in sync
  filtersRef.current = filters

  const poll = useCallback(async (isFilterChange: boolean) => {
    if (isFetchingRef.current) return
    isFetchingRef.current = true
    setIsLoading(true)

    try {
      const fetchedRows = await fetchPullRequests(filtersRef.current)
      setRows(fetchedRows)
      setLastPollTime(new Date())

      // Build set of fetched PR keys
      const fetchedKeys = new Set(
        fetchedRows.map((row: any) => makePrKey(row.repository, row.number))
      )

      // Load seen keys on first call
      if (seenKeysRef.current === null) {
        const stored = loadSeenPrKeys()
        seenKeysRef.current = stored ?? new Set()
      }

      const isFirstEver = isFirstFetchRef.current && seenKeysRef.current.size === 0
      isFirstFetchRef.current = false

      if (isFirstEver || isFilterChange) {
        // Seed/merge: don't notify
        console.log('[Polling] Seeding', fetchedKeys.size, 'PRs as seen (firstEver:', isFirstEver, 'filterChange:', isFilterChange, ')')
        fetchedKeys.forEach(key => seenKeysRef.current!.add(key))
      } else {
        // Notify for genuinely new PRs
        const newPrs: string[] = []
        for (const row of fetchedRows) {
          const key = makePrKey(row.repository, row.number)
          if (!seenKeysRef.current.has(key)) {
            seenKeysRef.current.add(key)
            newPrs.push(key)
            showPrNotification(row).catch(e => console.error('[Notifications] Error:', e))
          }
        }
        if (newPrs.length > 0) {
          console.log('[Polling] New PRs detected:', newPrs)
        } else {
          console.log('[Polling] No new PRs (', fetchedKeys.size, 'fetched,', seenKeysRef.current.size, 'seen)')
        }
      }

      saveSeenPrKeys(seenKeysRef.current)
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  // Start/restart polling when filters change
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
    }

    // Fetch immediately (filter change = merge into seen, no notifications)
    const isFilterChange = !isFirstFetchRef.current
    poll(isFilterChange)

    // Set up recurring poll
    intervalRef.current = setInterval(() => poll(false), POLL_INTERVAL_MS)

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current)
      }
    }
  }, [filters, poll])

  // Poll immediately when tab becomes visible again
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        poll(false)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [poll])

  return { rows, isLoading, lastPollTime }
}
