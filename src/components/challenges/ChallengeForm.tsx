'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { MAX_CHALLENGE_NAME_LENGTH, MAX_CHALLENGE_REASON_LENGTH } from '@/lib/utils/constants'
import { TIER_CONFIG } from '@/lib/challenges/tierConfig'
import { useAppTranslations } from '@/hooks/useAppTranslations'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { cn } from '@/lib/utils'
import type { Habit, Challenge, ChallengeTier } from '@/types/domain'

const TIER_KEYS = Object.keys(TIER_CONFIG) as ChallengeTier[]

const challengeSchema = z.object({
  name: z
    .string()
    .min(1, 'nameRequired')
    .max(MAX_CHALLENGE_NAME_LENGTH, 'nameTooLong')
    .refine((s) => s.trim().length > 0, 'nameRequired'),
  tier: z.enum([
    'bronze',
    'silver',
    'gold',
    'platinum',
    'diamond',
    'master',
    'challenger',
  ] as const),
  habitId: z.string().min(1, 'noHabitError'),
  startDate: z.string().min(1),
  reason: z.string().max(MAX_CHALLENGE_REASON_LENGTH, 'reasonTooLong').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof challengeSchema>

interface ChallengeFormProps {
  activeHabits: Habit[]
  activeChallenges: Challenge[]
  onSubmit: (data: FormValues) => Promise<void>
  onCancel: () => void
}

function fieldError(
  msg: string | undefined,
  t: ReturnType<typeof useAppTranslations>['t']
): string | undefined {
  if (!msg) return undefined
  if (msg === 'nameRequired') return t('challenges.nameLabel') + ' é obrigatório'
  if (msg === 'nameTooLong') return t('habits.nameTooLong', { max: MAX_CHALLENGE_NAME_LENGTH })
  if (msg === 'noHabitError') return t('challenges.noHabitError')
  if (msg === 'reasonTooLong') return t('habits.nameTooLong', { max: MAX_CHALLENGE_REASON_LENGTH })
  return msg
}

export function ChallengeForm({
  activeHabits,
  activeChallenges,
  onSubmit,
  onCancel,
}: ChallengeFormProps) {
  const { t, language } = useAppTranslations()
  const { isOnline } = useOnlineStatus()
  const [duplicateError, setDuplicateError] = useState<string | null>(null)
  const nameEditedRef = useRef(false)
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(challengeSchema),
    defaultValues: {
      name: '',
      tier: 'gold',
      habitId: '',
      startDate: todayStr,
      reason: '',
    },
    mode: 'onChange',
  })

  const watchedTier = watch('tier')
  const watchedHabitId = watch('habitId')
  const watchedStartDate = watch('startDate')

  // Auto-suggest name when tier + habit selected (only if user hasn't manually edited name)
  useEffect(() => {
    if (!watchedTier || !watchedHabitId) return
    if (nameEditedRef.current) return
    const habit = activeHabits.find((h) => h.id === watchedHabitId)
    if (!habit) return
    const config = TIER_CONFIG[watchedTier]
    const suggestion =
      language === 'pt-BR'
        ? `${config.durationDays} dias de ${habit.name}`
        : `${config.durationDays} days of ${habit.name}`
    setValue('name', suggestion, { shouldValidate: true })
  }, [watchedTier, watchedHabitId, activeHabits, language, setValue])

  // Computed end date display
  const endDateDisplay =
    watchedTier && watchedStartDate
      ? format(
          addDays(parseISO(watchedStartDate), TIER_CONFIG[watchedTier].durationDays - 1),
          'dd/MM/yyyy'
        )
      : null

  async function handleFormSubmit(data: FormValues) {
    if (!isOnline) {
      toast.warning(t('offline.cannotCreateOffline'))
      return
    }
    setDuplicateError(null)
    // Client-side duplicate tier check
    const duplicate = activeChallenges.find(
      (c) => c.habitId === data.habitId && c.tier === data.tier
    )
    if (duplicate) {
      const habit = activeHabits.find((h) => h.id === data.habitId)
      const tierLabel = TIER_CONFIG[data.tier].label[language] ?? data.tier
      const habitName = habit?.name ?? data.habitId
      setDuplicateError(t('challenges.duplicateTierError', { tier: tierLabel, habit: habitName }))
      return
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 p-4 pb-6">
      {/* Habit */}
      <div>
        <label className="block text-sm font-medium mb-1">{t('challenges.habitLabel')}</label>
        <Controller
          control={control}
          name="habitId"
          render={({ field }) => (
            <select
              {...field}
              onChange={(e) => {
                nameEditedRef.current = false
                field.onChange(e)
              }}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t('challenges.noHabitError')}</option>
              {activeHabits.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.emoji} {h.name}
                </option>
              ))}
            </select>
          )}
        />
        {errors.habitId && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {fieldError(errors.habitId.message, t)}
          </p>
        )}
      </div>

      {/* Tier */}
      <div>
        <label className="block text-sm font-medium mb-1">{t('challenges.tierLabel')}</label>
        <Controller
          control={control}
          name="tier"
          render={({ field }) => (
            <div className="flex flex-wrap gap-1.5">
              {TIER_KEYS.map((tier) => {
                const cfg = TIER_CONFIG[tier]
                const selected = field.value === tier
                return (
                  <button
                    key={tier}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      nameEditedRef.current = false
                      field.onChange(tier)
                    }}
                    className={cn(
                      'rounded-md px-2.5 py-1.5 text-xs font-medium border transition-colors',
                      selected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-muted-foreground border-input hover:bg-accent'
                    )}
                  >
                    {cfg.emoji} {cfg.label[language]}
                  </button>
                )
              })}
            </div>
          )}
        />
        {duplicateError && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {duplicateError}
          </p>
        )}
      </div>

      {/* End date hint */}
      {endDateDisplay && (
        <p className="text-xs text-muted-foreground -mt-2">
          {t('challenges.endDateLabel')}: {endDateDisplay}
        </p>
      )}

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">{t('challenges.nameLabel')}</label>
        <input
          {...register('name')}
          onInput={() => {
            nameEditedRef.current = true
          }}
          maxLength={MAX_CHALLENGE_NAME_LENGTH + 1}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {errors.name && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {fieldError(errors.name.message, t)}
          </p>
        )}
      </div>

      {/* Start date */}
      <div>
        <label className="block text-sm font-medium mb-1">{t('challenges.startDateLabel')}</label>
        <input
          {...register('startDate')}
          type="date"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* Reason */}
      <div>
        <label className="block text-sm font-medium mb-1">{t('challenges.reasonLabel')}</label>
        <textarea
          {...register('reason')}
          maxLength={MAX_CHALLENGE_REASON_LENGTH + 1}
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
        {errors.reason && (
          <p role="alert" className="mt-1 text-xs text-destructive">
            {fieldError(errors.reason.message, t)}
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
