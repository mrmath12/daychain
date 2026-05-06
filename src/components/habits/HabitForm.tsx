'use client'

import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { MAX_HABIT_NAME_LENGTH } from '@/lib/utils/constants'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import type { Habit, DayOfWeek } from '@/types/domain'
import { cn } from '@/lib/utils'

const DAY_KEYS: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 7]

const daySchema = z.union([
  z.literal(1 as const),
  z.literal(2 as const),
  z.literal(3 as const),
  z.literal(4 as const),
  z.literal(5 as const),
  z.literal(6 as const),
  z.literal(7 as const),
])

// Static error codes — translated in the component
const habitSchema = z.object({
  name: z
    .string()
    .min(1, 'nameRequired')
    .max(MAX_HABIT_NAME_LENGTH, 'nameTooLong')
    .refine((s) => s.trim().length > 0, 'nameRequired'),
  emoji: z.string().min(1).max(4),
  frequency: z.array(daySchema).min(1, 'dayRequired'),
})

type FormValues = z.infer<typeof habitSchema>

interface HabitFormProps {
  initialValues?: Partial<Pick<Habit, 'name' | 'emoji' | 'frequency'>>
  onSubmit: (data: FormValues) => Promise<void>
  onCancel: () => void
}

function errorMsg(
  message: string | undefined,
  t: ReturnType<typeof useAppTranslations>['t']
): string | undefined {
  if (!message) return undefined
  if (message === 'nameRequired') return t('habits.nameRequired')
  if (message === 'nameTooLong') return t('habits.nameTooLong', { max: MAX_HABIT_NAME_LENGTH })
  if (message === 'dayRequired') return t('habits.dayRequired')
  return message
}

export function HabitForm({ initialValues, onSubmit, onCancel }: HabitFormProps) {
  const { t } = useAppTranslations()
  const { isOnline } = useOnlineStatus()

  const {
    register,
    control,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(habitSchema),
    defaultValues: {
      name: initialValues?.name ?? '',
      emoji: initialValues?.emoji ?? '✨',
      frequency: (initialValues?.frequency ?? []) as DayOfWeek[],
    },
    mode: 'onChange',
  })

  useEffect(() => {
    setFocus('name')
  }, [setFocus])

  function handleFormSubmit(data: FormValues) {
    if (!isOnline) {
      toast.warning(t('offline.cannotCreateOffline'))
      return
    }
    return onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4 pb-6">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">{t('habits.nameLabel')}</label>
        <input
          {...register('name')}
          placeholder={t('habits.namePlaceholder')}
          maxLength={MAX_HABIT_NAME_LENGTH + 1}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.name && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {errorMsg(errors.name.message, t)}
          </p>
        )}
      </div>

      {/* Emoji */}
      <div>
        <label className="block text-sm font-medium mb-1">{t('habits.emojiLabel')}</label>
        <input
          {...register('emoji')}
          type="text"
          maxLength={4}
          aria-label="Emoji"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Frequency */}
      <div>
        <label className="block text-sm font-medium mb-2">{t('habits.frequencyLabel')}</label>
        <Controller
          control={control}
          name="frequency"
          render={({ field }) => (
            <div className="flex gap-1 flex-wrap">
              {DAY_KEYS.map((day) => {
                const selected = field.value.includes(day)
                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      const next = selected
                        ? field.value.filter((d) => d !== day)
                        : ([...field.value, day].sort((a, b) => a - b) as DayOfWeek[])
                      field.onChange(next)
                    }}
                    className={cn(
                      'rounded-md px-3 py-1.5 text-xs font-medium border transition-colors',
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-input hover:bg-accent'
                    )}
                  >
                    {t(`habits.days.${day}`)}
                  </button>
                )
              })}
            </div>
          )}
        />
        {errors.frequency && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {errorMsg(errors.frequency.message, t)}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-md border border-input px-4 py-2 text-sm hover:bg-accent transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="flex-1 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50 transition-opacity"
        >
          {t('common.save')}
        </button>
      </div>
    </form>
  )
}
