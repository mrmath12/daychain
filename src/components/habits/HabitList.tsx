'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import type { Habit } from '@/types/domain'
import { countHabitLogs } from '@/lib/habits/queries'
import { getChallenges, abandonActiveChallengesByHabit } from '@/lib/challenges/queries'
import { HabitForm } from './HabitForm'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Sheet } from '@/components/ui/sheet'
import { useAppTranslations } from '@/hooks/useAppTranslations'

// ----- types -----

type CreateInput = Pick<Habit, 'name' | 'emoji' | 'frequency'>
type UpdateInput = Partial<Pick<Habit, 'name' | 'emoji' | 'frequency'>>
type ReorderUpdate = Array<{ id: string; sortOrder: number }>

type FormState = { open: false } | { open: true; habit?: Habit }
type ArchiveState = { habit: Habit; challengeCount: number } | null
type DeleteState = { habit: Habit; step: 1 | 2 } | null

// ----- sortable drag item (active habits) -----

function SortableItem({
  habit,
  onEdit,
  onArchive,
}: {
  habit: Habit
  onEdit: () => void
  onArchive: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: habit.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border bg-card px-3 py-3"
    >
      <button
        {...attributes}
        {...listeners}
        aria-label="Reordenar"
        className="cursor-grab active:cursor-grabbing text-muted-foreground p-1 touch-none shrink-0"
      >
        <GripVertical size={16} />
      </button>
      <button
        onClick={onEdit}
        className="flex-1 flex items-center gap-2 text-left min-w-0"
        aria-label={`Editar ${habit.name}`}
      >
        <span className="text-lg shrink-0">{habit.emoji}</span>
        <span className="text-sm font-medium truncate">{habit.name}</span>
      </button>
      <button
        onClick={onArchive}
        className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent transition-colors shrink-0"
      >
        Arquivar
      </button>
    </div>
  )
}

// ----- archived item (read-only + optional delete) -----

function ArchivedItem({
  habit,
  canDelete,
  onDelete,
}: {
  habit: Habit
  canDelete: boolean
  onDelete: () => void
}) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-dashed bg-muted/30 px-3 py-3 opacity-70">
      <span className="text-lg shrink-0">{habit.emoji}</span>
      <span className="text-sm font-medium truncate flex-1">{habit.name}</span>
      <span className="text-xs text-muted-foreground shrink-0">🗄️</span>
      {canDelete && (
        <button
          onClick={onDelete}
          className="rounded px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors shrink-0"
        >
          Excluir
        </button>
      )}
    </div>
  )
}

// ----- main list -----

export interface HabitListProps {
  habits: Habit[]
  isLoading: boolean
  onCreate: (input: CreateInput) => Promise<Habit>
  onUpdate: (habitId: string, updates: UpdateInput) => Promise<Habit>
  onArchive: (habitId: string) => Promise<void>
  onDelete: (habitId: string) => Promise<void>
  onReorder: (updates: ReorderUpdate) => Promise<void>
}

export function HabitList({
  habits,
  isLoading,
  onCreate,
  onUpdate,
  onArchive,
  onDelete,
  onReorder,
}: HabitListProps) {
  const { t } = useAppTranslations()

  const activeHabits = habits.filter((h) => !h.archivedAt)
  const archivedHabits = habits.filter((h) => !!h.archivedAt)

  const [localIds, setLocalIds] = useState<string[]>(() => activeHabits.map((h) => h.id))
  const [logCounts, setLogCounts] = useState<Record<string, number>>({})
  const [formState, setFormState] = useState<FormState>({ open: false })
  const [archiveState, setArchiveState] = useState<ArchiveState>(null)
  const [deleteState, setDeleteState] = useState<DeleteState>(null)

  // Sync drag order with fresh data from server
  useEffect(() => {
    setLocalIds(habits.filter((h) => !h.archivedAt).map((h) => h.id))
  }, [habits])

  // Fetch log counts for archived habits (determines delete button visibility)
  useEffect(() => {
    const archived = habits.filter((h) => !!h.archivedAt)
    if (archived.length === 0) return
    let cancelled = false
    Promise.all(archived.map(async (h) => [h.id, await countHabitLogs(h.id)] as const)).then(
      (entries) => {
        if (!cancelled) setLogCounts(Object.fromEntries(entries))
      }
    )
    return () => {
      cancelled = true
    }
  }, [habits])

  const sortedActive = localIds
    .map((id) => activeHabits.find((h) => h.id === id))
    .filter((h): h is Habit => !!h)

  // ----- DnD -----

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = localIds.indexOf(String(active.id))
    const newIndex = localIds.indexOf(String(over.id))
    const newOrder = arrayMove(localIds, oldIndex, newIndex)
    setLocalIds(newOrder)

    const prevIds = localIds
    onReorder(newOrder.map((id, idx) => ({ id, sortOrder: idx + 1 }))).catch(() => {
      setLocalIds(prevIds)
      toast.error(t('common.error'))
    })
  }

  // ----- archive with cascade -----

  const handleArchiveRequest = useCallback(async (habit: Habit) => {
    try {
      const active = await getChallenges(habit.userId, 'active')
      const count = active.filter((c) => c.habitId === habit.id).length
      setArchiveState({ habit, challengeCount: count })
    } catch {
      setArchiveState({ habit, challengeCount: 0 })
    }
  }, [])

  const handleArchiveConfirm = useCallback(async () => {
    if (!archiveState) return
    const { habit, challengeCount } = archiveState
    setArchiveState(null)
    try {
      if (challengeCount > 0) {
        await abandonActiveChallengesByHabit(habit.id)
      }
      await onArchive(habit.id)
      const base = t('habits.archivedToast', { emoji: habit.emoji, name: habit.name })
      const extra =
        challengeCount > 0 ? t('habits.archivedWithChallenges', { count: challengeCount }) : ''
      toast(base + extra)
    } catch {
      toast.error(t('common.error'))
    }
  }, [archiveState, onArchive, t])

  // ----- two-step delete -----

  const handleDeleteRequest = useCallback((habit: Habit) => {
    setDeleteState({ habit, step: 1 })
  }, [])

  const handleDeleteStep2 = useCallback(() => {
    setDeleteState((s) => (s ? { habit: s.habit, step: 2 } : null))
  }, [])

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteState) return
    const { habit } = deleteState
    setDeleteState(null)
    try {
      await onDelete(habit.id)
      toast(`${habit.emoji} ${habit.name} excluído.`)
    } catch {
      toast.error(t('common.error'))
    }
  }, [deleteState, onDelete, t])

  // ----- form submit -----

  const handleFormSubmit = useCallback(
    async (data: CreateInput) => {
      const editing = formState.open ? formState.habit : undefined
      try {
        if (editing) {
          await onUpdate(editing.id, data)
        } else {
          await onCreate(data)
        }
        setFormState({ open: false })
      } catch {
        toast.error(t('common.error'))
      }
    },
    [formState, onCreate, onUpdate, t]
  )

  const formTitle =
    formState.open && formState.habit
      ? `${t('common.edit')} ${formState.habit.name}`
      : t('habits.new')

  const archiveDescription = archiveState
    ? t('habits.archiveConfirmBody') +
      (archiveState.challengeCount > 0
        ? t('habits.archiveWithChallenges', { count: archiveState.challengeCount })
        : '')
    : ''

  return (
    <>
      <div className="space-y-4 p-4">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{activeHabits.length} ativo(s)</span>
          <button
            onClick={() => setFormState({ open: true })}
            className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            {t('habits.new')}
          </button>
        </div>

        {isLoading && (
          <p className="text-sm text-muted-foreground text-center py-6">{t('common.loading')}</p>
        )}

        {/* Active habits list with DnD */}
        {!isLoading && sortedActive.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={localIds} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {sortedActive.map((habit) => (
                  <SortableItem
                    key={habit.id}
                    habit={habit}
                    onEdit={() => setFormState({ open: true, habit })}
                    onArchive={() => handleArchiveRequest(habit)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {!isLoading && activeHabits.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            Nenhum hábito ativo. Crie o primeiro!
          </p>
        )}

        {/* Archived section */}
        {archivedHabits.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Arquivados
            </p>
            {archivedHabits.map((habit) => (
              <ArchivedItem
                key={habit.id}
                habit={habit}
                canDelete={(logCounts[habit.id] ?? 1) === 0}
                onDelete={() => handleDeleteRequest(habit)}
              />
            ))}
          </div>
        )}
      </div>

      {/* HabitForm Sheet */}
      <Sheet
        open={formState.open}
        onOpenChange={(open) => !open && setFormState({ open: false })}
        title={formTitle}
      >
        {formState.open && (
          <HabitForm
            initialValues={formState.habit}
            onSubmit={handleFormSubmit}
            onCancel={() => setFormState({ open: false })}
          />
        )}
      </Sheet>

      {/* Archive confirm */}
      <ConfirmDialog
        open={archiveState !== null}
        title={
          archiveState ? t('habits.archiveConfirmTitle', { name: archiveState.habit.name }) : ''
        }
        description={archiveDescription}
        confirmLabel={t('common.archive')}
        onConfirm={handleArchiveConfirm}
        onCancel={() => setArchiveState(null)}
      />

      {/* Delete step 1 */}
      <ConfirmDialog
        open={deleteState?.step === 1}
        title={t('habits.deleteConfirm1')}
        description={t('habits.deleteConfirm2')}
        confirmLabel={t('common.delete')}
        onConfirm={handleDeleteStep2}
        onCancel={() => setDeleteState(null)}
        isDestructive
      />

      {/* Delete step 2 */}
      <ConfirmDialog
        open={deleteState?.step === 2}
        title={t('habits.deleteConfirm2')}
        description="Esta ação é permanente e não pode ser desfeita."
        confirmLabel={t('common.delete')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteState(null)}
        isDestructive
      />
    </>
  )
}
