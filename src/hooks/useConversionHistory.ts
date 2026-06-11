'use client'

import { useCallback, useRef, useState } from 'react'
import { HISTORY_MAX, type HistorySnapshot } from '@/lib/history/snapshot'

type NewSnapshot = Omit<HistorySnapshot, 'id' | 'label' | 'timestamp'>

/**
 * In-memory conversion history (no localStorage). Keeps up to HISTORY_MAX
 * snapshots; evicting the oldest explicitly releases its thumbnail dataURL.
 */
export function useConversionHistory() {
  const [items, setItems] = useState<HistorySnapshot[]>([])
  const seqRef = useRef(0)

  const add = useCallback((data: NewSnapshot): number => {
    const snap: HistorySnapshot = {
      id:        Date.now(),
      label:     `#${++seqRef.current}`,
      timestamp: new Date().toLocaleTimeString(),
      ...data,
    }
    setItems(prev => {
      const next = [...prev, snap]
      while (next.length > HISTORY_MAX) {
        const dropped = next.shift()
        if (dropped) dropped.thumbnail = null // explicit free to avoid leaks
      }
      return next
    })
    return snap.id
  }, [])

  return { items, add }
}
