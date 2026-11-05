'use client'
import { forwardRef, useId, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

const variants: Record<Variant, string> = {
  primary: 'bg-violet text-white hover:bg-[#4b37f0] shadow-[0_8px_24px_-10px_rgb(93_73_255/0.8)]',
  secondary: 'bg-white text-ink border border-line hover:border-ink/30',
  ghost: 'text-ink-soft hover:text-ink hover:bg-ink/5',
  danger: 'text-[#c23a52] hover:bg-[#c23a52]/8',
}

export function buttonClass(variant: Variant = 'primary', size: 'sm' | 'md' = 'md') {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-[background,border,color,transform] active:scale-[0.98] disabled:opacity-50',
    size === 'sm' ? 'h-10 px-3.5 text-sm sm:h-8' : 'h-11 px-5 text-[15px]',
    variants[variant]
  )
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: 'sm' | 'md' }) {
  return <button type="button" className={cn(buttonClass(variant, size), className)} {...rest} />
}

export function IconButton({ label, className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn('grid size-10 place-items-center rounded-full sm:size-8 text-ink-soft transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-30', className)}
      {...rest}
    />
  )
}

const fieldBase =
  'w-full rounded-xl border border-line bg-white px-3.5 text-[15px] text-ink placeholder:text-mist transition-[border,box-shadow] outline-none focus:border-violet focus:ring-4 focus:ring-violet/12 aria-[invalid=true]:border-[#c23a52]'

type FieldShell = { label: string; error?: string; hint?: ReactNode; className?: string }

function Shell({ id, label, error, hint, className, children }: FieldShell & { id: string; children: ReactNode }) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[#c23a52]" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-soft">{hint}</p>
      ) : null}
    </div>
  )
}

export const TextField = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldShell>(
  function TextField({ label, error, hint, className, ...rest }, ref) {
    const id = useId()
    return (
      <Shell id={id} label={label} error={error} hint={hint} className={className}>
        <input id={id} ref={ref} aria-invalid={!!error} className={cn(fieldBase, 'h-11')} {...rest} />
      </Shell>
    )
  }
)

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldShell>(
  function TextArea({ label, error, hint, className, ...rest }, ref) {
    const id = useId()
    return (
      <Shell id={id} label={label} error={error} hint={hint} className={className}>
        <textarea id={id} ref={ref} aria-invalid={!!error} className={cn(fieldBase, 'min-h-28 resize-y py-3 leading-relaxed')} {...rest} />
      </Shell>
    )
  }
)

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path d="M16 2.5 28.5 9.7 16 16.9 3.5 9.7Z" fill="#ffffff" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M3.5 9.7 16 16.9v12.6L3.5 22.3Z" fill="#5d49ff" />
      <path d="M28.5 9.7 16 16.9v12.6l12.5-7.2Z" fill="#2f1fb8" />
      <path d="m11.2 7.4 7.6 4.4M8.6 9.4l5.2 3" stroke="#15173a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-display text-[21px] leading-none font-extrabold tracking-[-0.035em]', className)}>
      <LogoMark className="size-7" />
      <span className={compact ? 'max-[419px]:sr-only' : undefined}>relieve</span>
    </span>
  )
}
