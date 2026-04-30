import { z } from 'zod'

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_ANON_KEY must not be empty'),
  NEXT_PUBLIC_HARDCODED_USER_ID: z
    .string()
    .uuid('NEXT_PUBLIC_HARDCODED_USER_ID must be a valid UUID'),
})

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  NEXT_PUBLIC_HARDCODED_USER_ID: process.env.NEXT_PUBLIC_HARDCODED_USER_ID,
})

if (!parsed.success) {
  const errors = parsed.error.flatten().fieldErrors
  const messages = Object.entries(errors)
    .map(([key, msgs]) => `  ${key}: ${msgs?.join(', ')}`)
    .join('\n')
  throw new Error(`❌ Invalid environment variables:\n${messages}`)
}

export const env = parsed.data
