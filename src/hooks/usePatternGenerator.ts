'use client'

import { useState, useCallback, useRef } from 'react'
import { generatePattern, calcThreadUsage } from '@/lib/pattern/generator'
import { useLang } from '@/lib/i18n/context'
import type { PatternResult, PatternSettings, ThreadUsage } from '@/types'

export interface GeneratorState {
  status:   'idle' | 'generating' | 'done' | 'error'
  progress: number
  label:    string
  sub:      string
  pattern:  PatternResult | null
  threads:  ThreadUsage[]
  error:    string | null
}

export function usePatternGenerator() {
  const { t } = useLang()
  const [state, setState] = useState<GeneratorState>({
    status:   'idle',
    progress: 0,
    label:    '',
    sub:      '',
    pattern:  null,
    threads:  [],
    error:    null,
  })

  const genIdRef = useRef(0)

  const generate = useCallback(
    async (image: HTMLImageElement, settings: PatternSettings) => {
      const myId = ++genIdRef.current
      setState(s => ({ ...s, status: 'generating', error: null, progress: 0 }))

      try {
        const pattern = await generatePattern(
          image,
          settings.width,
          settings.height,
          settings.colorCount,
          settings.sepLevel,
          settings.qualityMode,
          settings.aspectMode,
          settings.ditheringMode,
          (pct, label, sub = '') => {
            if (genIdRef.current !== myId) return
            setState(s => ({ ...s, progress: pct, label, sub }))
          },
          settings.brightness,
          settings.contrast,
          t.progress,
          settings.saturation,
          settings.temperature,
          settings.tint,
        )

        if (genIdRef.current !== myId) return

        const threads = calcThreadUsage(pattern.grid, pattern.dmcMap)

        setState(s => ({
          ...s,
          status:  'done',
          pattern,
          threads,
          progress: 100,
          label:   t.settings.progressDone,
          sub:     '',
        }))
      } catch (err) {
        if (genIdRef.current !== myId) return
        setState(s => ({
          ...s,
          status: 'error',
          error:  err instanceof Error ? err.message : t.settings.progressError,
        }))
      }
    },
    [],
  )

  const reset = useCallback(() => {
    genIdRef.current++
    setState({
      status:   'idle',
      progress: 0,
      label:    '',
      sub:      '',
      pattern:  null,
      threads:  [],
      error:    null,
    })
  }, [])

  return { state, generate, reset }
}
