import { createBrowserClient } from '@supabase/ssr'
import type { CV } from '@/lib/schema/cv'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && key)

export function getSupabase() {
  if (!url || !key) return null
  return createBrowserClient(url, key)
}

export async function uploadAvatar(file: File) {
  const sb = getSupabase()
  if (!sb) return null
  const { data: auth } = await sb.auth.getUser()
  if (!auth.user) return null
  const path = `${auth.user.id}/${Date.now()}-${file.name}`
  const { error } = await sb.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw error
  return sb.storage.from('avatars').getPublicUrl(path).data.publicUrl
}

export async function saveResume(cv: CV, resumeId?: string) {
  const sb = getSupabase()
  if (!sb) return null
  const { data: auth } = await sb.auth.getUser()
  if (!auth.user) return null
  const { data, error } = await sb
    .from('resumes')
    .upsert({ id: resumeId, user_id: auth.user.id, data: cv, updated_at: new Date().toISOString() })
    .select('id')
    .single()
  if (error) throw error
  return data.id as string
}
