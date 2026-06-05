'use client'

import { useForm, ValidationError } from '@formspree/react'
import Navbar from '@/components/layout/Navbar'
import { useLang } from '@/lib/i18n/context'

export default function FeedbackPage() {
  const [state, handleSubmit] = useForm('mjgzdern')
  const { t } = useLang()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="px-4 sm:px-9 py-12 max-w-xl mx-auto">
        <div className="mb-8">
          <p className="text-[10px] uppercase tracking-[0.18em] text-sage-400 font-light mb-3">
            Feedback
          </p>
          <h1 className="font-playfair text-[28px] sm:text-[34px] leading-[1.2] text-warm-700 mb-2">
            {t.feedback.title}
          </h1>
          <p className="text-[13px] text-warm-400 font-light leading-relaxed">
            {t.feedback.subtitle}
          </p>
        </div>

        {state.succeeded ? (
          <div className="bg-linen-50/80 border border-linen-300/20 rounded-panel p-6 shadow-linen">
            <p className="text-[12px] text-sage-500 bg-sage-400/10 border border-sage-400/20 rounded-[8px] px-4 py-3">
              {t.feedback.successMessage}
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-linen-50/80 border border-linen-300/20 rounded-panel p-6 shadow-linen space-y-4"
          >
            <div>
              <label className="form-lbl">{t.feedback.emailLabel}</label>
              <input
                type="email"
                name="email"
                placeholder={t.feedback.emailPlaceholder}
                className="input-linen"
              />
              <ValidationError field="email" prefix="Email" errors={state.errors}
                className="mt-1 text-[11px] text-red-400" />
            </div>

            <div>
              <label className="form-lbl">{t.feedback.subjectLabel} <span className="text-red-400">*</span></label>
              <input
                type="text"
                name="subject"
                required
                placeholder={t.feedback.subjectPlaceholder}
                className="input-linen"
              />
            </div>

            <div>
              <label className="form-lbl">{t.feedback.messageLabel} <span className="text-red-400">*</span></label>
              <textarea
                name="message"
                required
                rows={6}
                placeholder={t.feedback.messagePlaceholder}
                className="input-linen resize-none"
              />
              <ValidationError field="message" prefix="Message" errors={state.errors}
                className="mt-1 text-[11px] text-red-400" />
            </div>

            <button
              type="submit"
              disabled={state.submitting}
              className="btn-primary w-full"
            >
              {state.submitting ? t.feedback.submittingText : t.feedback.submitText}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
