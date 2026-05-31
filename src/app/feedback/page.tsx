'use client'

import { useState } from 'react'
import Navbar from '@/components/layout/Navbar'

const FORMSPREE_ID = process.env.NEXT_PUBLIC_FORMSPREE_ID ?? 'xpwreazq'

export default function FeedbackPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')
    const form = e.currentTarget
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })
      if (res.ok) {
        setStatus('success')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-4 sm:px-9 py-12 max-w-xl mx-auto">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light mb-3">
            Feedback
          </p>
          <h1 className="font-playfair text-[28px] sm:text-[34px] leading-[1.2] text-warm-700 mb-2">
            피드백 보내기
          </h1>
          <p className="text-[13px] text-warm-400 font-light leading-relaxed">
            버그 제보, 기능 제안, 개선 의견을 자유롭게 남겨주세요.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-linen-50/80 border border-linen-300/20 rounded-panel p-6 shadow-linen space-y-4"
        >
          <div>
            <label className="form-lbl">이메일 (선택)</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              className="input-linen"
            />
          </div>

          <div>
            <label className="form-lbl">제목 <span className="text-red-400">*</span></label>
            <input
              type="text"
              name="subject"
              required
              placeholder="제목을 입력해주세요"
              className="input-linen"
            />
          </div>

          <div>
            <label className="form-lbl">내용 <span className="text-red-400">*</span></label>
            <textarea
              name="message"
              required
              rows={6}
              placeholder="내용을 입력해주세요"
              className="input-linen resize-none"
            />
          </div>

          {status === 'success' && (
            <p className="text-[12px] text-sage-500 bg-sage-400/10 border border-sage-400/20
                           rounded-[8px] px-4 py-3">
              메시지가 전송되었습니다. 감사합니다!
            </p>
          )}
          {status === 'error' && (
            <p className="text-[12px] text-red-400 bg-red-50 border border-red-200
                           rounded-[8px] px-4 py-3">
              전송에 실패했습니다. 다시 시도해 주세요.
            </p>
          )}

          <button
            type="submit"
            disabled={status === 'sending' || status === 'success'}
            className="btn-primary w-full"
          >
            {status === 'sending' ? '전송 중...' : 'Send'}
          </button>
        </form>
      </main>
    </div>
  )
}
