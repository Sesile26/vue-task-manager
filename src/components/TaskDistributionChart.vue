<script setup lang="ts">
import { computed } from 'vue'
import { TaskStatus, type StatusDistribution } from '@/types'
import { TASK_STATUS_LABELS } from '@/utils/status'

// Presentational only: takes a precomputed distribution (counting lives in the
// store getter), so it works for one project or all projects unchanged.
const props = defineProps<{
  distribution: StatusDistribution
}>()

const R = 74
const C = 2 * Math.PI * R

interface Segment {
  key: TaskStatus
  label: string
  cls: string
  count: number
  pct: number
  dash: string
  offset: number
}

const total = computed(() => props.distribution.total)

const segments = computed<Segment[]>(() => {
  const t = total.value
  const counts: Record<TaskStatus, number> = {
    [TaskStatus.Todo]: props.distribution.todo,
    [TaskStatus.InProgress]: props.distribution.in_progress,
    [TaskStatus.Done]: props.distribution.done,
  }

  const len = (n: number): number => (t === 0 ? 0 : (n / t) * C)
  const pct = (n: number): number => (t === 0 ? 0 : Math.round((n / t) * 100))
  const dash = (segLen: number): string => `${segLen.toFixed(2)} ${(C - segLen).toFixed(2)}`

  const todoLen = len(counts[TaskStatus.Todo])
  const progLen = len(counts[TaskStatus.InProgress])
  const doneLen = len(counts[TaskStatus.Done])

  // Each segment is offset by the sum of the previous arc lengths (negative).
  return [
    {
      key: TaskStatus.Todo,
      label: TASK_STATUS_LABELS[TaskStatus.Todo],
      cls: 'todo',
      count: counts[TaskStatus.Todo],
      pct: pct(counts[TaskStatus.Todo]),
      dash: dash(todoLen),
      offset: 0,
    },
    {
      key: TaskStatus.InProgress,
      label: TASK_STATUS_LABELS[TaskStatus.InProgress],
      cls: 'progress',
      count: counts[TaskStatus.InProgress],
      pct: pct(counts[TaskStatus.InProgress]),
      dash: dash(progLen),
      offset: -todoLen,
    },
    {
      key: TaskStatus.Done,
      label: TASK_STATUS_LABELS[TaskStatus.Done],
      cls: 'done',
      count: counts[TaskStatus.Done],
      pct: pct(counts[TaskStatus.Done]),
      dash: dash(doneLen),
      offset: -(todoLen + progLen),
    },
  ]
})
</script>

<template>
  <section
    class="chart"
    aria-label="Розподіл завдань за статусами"
  >
    <div class="chart__head">
      <h2 class="chart__title">
        Розподіл завдань
      </h2>
    </div>

    <div class="chart__body">
      <div
        class="chart__donut"
        role="img"
        :aria-label="`Усього ${total} завдань`"
      >
        <svg
          class="chart__svg"
          width="188"
          height="188"
          viewBox="0 0 200 200"
        >
          <circle
            class="chart__track"
            cx="100"
            cy="100"
            :r="R"
          />
          <circle
            v-for="segment in segments"
            :key="segment.key"
            class="chart__arc"
            :class="`chart__arc--${segment.cls}`"
            cx="100"
            cy="100"
            :r="R"
            :stroke-dasharray="segment.dash"
            :stroke-dashoffset="segment.offset"
          />
        </svg>
        <div class="chart__center">
          <span class="chart__total">{{ total }}</span>
          <span class="chart__total-label">завдань</span>
        </div>
      </div>

      <ul class="chart__legend">
        <li
          v-for="segment in segments"
          :key="segment.key"
          class="chart__row"
        >
          <span
            class="chart__swatch"
            :class="`chart__swatch--${segment.cls}`"
          />
          <span class="chart__label">{{ segment.label }}</span>
          <span class="chart__count">{{ segment.count }}</span>
          <span class="chart__pct">{{ segment.pct }}%</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped lang="scss">
.chart {
  margin-bottom: 24px;
  padding: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: var(--shadow);

  &__head {
    margin-bottom: 8px;
  }

  &__title {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  &__body {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 28px;
  }

  &__donut {
    position: relative;
    width: 188px;
    height: 188px;
    flex-shrink: 0;
  }

  &__svg {
    transform: rotate(-90deg);
  }

  &__track {
    fill: none;
    stroke: var(--surface-2);
    stroke-width: 24;
  }

  &__arc {
    fill: none;
    stroke-width: 24;
    transition: stroke-dasharray 0.4s ease, stroke-dashoffset 0.4s ease;

    &--todo {
      stroke: var(--todo);
    }

    &--progress {
      stroke: var(--progress);
    }

    &--done {
      stroke: var(--done);
    }
  }

  &__center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1px;
  }

  &__total {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1;
    color: var(--text);
  }

  &__total-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
  }

  &__legend {
    flex: 1;
    min-width: 220px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 4px;

    & + & {
      border-top: 1px solid var(--border);
    }
  }

  &__swatch {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;

    &--todo {
      background: var(--todo);
    }

    &--progress {
      background: var(--progress);
    }

    &--done {
      background: var(--done);
    }
  }

  &__label {
    flex: 1;
    font-size: 13.5px;
    font-weight: 500;
    color: var(--text);
  }

  &__count {
    font-size: 13.5px;
    font-weight: 600;
    color: var(--text);
  }

  &__pct {
    width: 44px;
    text-align: right;
    font-size: 12.5px;
    color: var(--text-tertiary);
    font-variant-numeric: tabular-nums;
  }
}
</style>
