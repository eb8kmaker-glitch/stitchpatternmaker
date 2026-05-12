'use client'

import { useState, useCallback } from 'react'
import { generatePattern, calcThreadUsage } from '@/lib/pattern/generator'
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
  const [state, setState] = useState<GeneratorState>({
    status:   'idle',
    progress: 0,
    label:    '',
    sub:      '',
    pattern:  null,
    threads:  [],
    error:    null,
  })

  const generate = useCallback(
    async (image: HTMLImageElement, settings: PatternSettings) => {
      setState(s => ({ ...s, status: 'generating', error: null, progress: 0 }))

      try {
        const pattern = await generatePattern(
          image,
          settings.width,
          settings.height,
          settings.colorCount,
          settings.sepLevel,
          (pct, label, sub = '') => {
            setState(s => ({ ...s, progress: pct, label, sub }))
          },
        )

        const threads = calcThreadUsage(pattern.grid, pattern.dmcMap)

        setState(s => ({
          ...s,
          status:  'done',
          pattern,
          threads,
          progress: 100,
          label:   '완성되었습니다',
          sub:     '',
        }))
      } catch (err) {
        setState(s => ({
          ...s,
          status: 'error',
          error:  err instanceof Error ? err.message : '알 수 없는 오류',
        }))
      }
    },
    [],
  )

  const reset = useCallback(() => {
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
