'use client'
import { motion } from 'motion/react'
import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconButton } from '@/components/ui'

type Props = {
  title: string
  index: number
  total: number
  onMove: (from: number, to: number) => void
  onRemove: () => void
  children: ReactNode
}

export function ListItem({ title, index, total, onMove, onRemove, children }: Props) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-2xl border border-line bg-white p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <p className="truncate font-display text-base font-semibold text-ink">{title}</p>
        <div className="flex shrink-0 items-center">
          <IconButton label="Subir" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
            <ArrowUp className="size-4" />
          </IconButton>
          <IconButton label="Bajar" disabled={index === total - 1} onClick={() => onMove(index, index + 1)}>
            <ArrowDown className="size-4" />
          </IconButton>
          <IconButton label="Eliminar" onClick={onRemove} className="hover:bg-[#c23a52]/8 hover:text-[#c23a52]">
            <Trash2 className="size-4" />
          </IconButton>
        </div>
      </div>
      {children}
    </motion.li>
  )
}

export function EmptyState({ text, action }: { text: string; action: ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-2xl border border-dashed border-ink/20 p-6">
      <p className="text-sm text-ink-soft">{text}</p>
      {action}
    </div>
  )
}

export function SectionHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
        <p className="mt-1 max-w-md text-sm text-ink-soft">{description}</p>
      </div>
      {action}
    </div>
  )
}
