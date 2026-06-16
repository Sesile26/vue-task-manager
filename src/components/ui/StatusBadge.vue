<script setup lang="ts">
import { computed } from 'vue'
import type { TaskStatus, ProjectStatus } from '@/types'
import { IconCheck } from '@/components/icons'
import { TASK_STATUS_LABELS, PROJECT_STATUS_LABELS } from '@/utils/status'

type AnyStatus = TaskStatus | ProjectStatus

const props = defineProps<{
  status: AnyStatus
}>()

const LABELS: Record<AnyStatus, string> = {
  ...TASK_STATUS_LABELS,
  ...PROJECT_STATUS_LABELS,
}

const label = computed(() => LABELS[props.status])
const isDone = computed(() => props.status === 'done')
</script>

<template>
  <span
    class="badge"
    :class="`badge--${status}`"
  >
    <IconCheck
      v-if="isDone"
      class="badge__check"
      width="12"
      height="12"
      stroke-width="3"
    />
    <span
      v-else
      class="badge__dot"
      aria-hidden="true"
    />
    {{ label }}
  </span>
</template>

<style scoped lang="scss">
.badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  height: 26px;
  padding: 0 11px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: currentColor;
  }

  &__check {
    flex-shrink: 0;
  }
}

.badge--todo {
  color: var(--todo);
  background: color-mix(in srgb, var(--todo) 15%, var(--surface));
}

.badge--in_progress {
  color: var(--progress);
  background: color-mix(in srgb, var(--progress) 15%, var(--surface));
}

.badge--done {
  color: var(--done);
  background: color-mix(in srgb, var(--done) 15%, var(--surface));
}

.badge--active {
  color: var(--active);
  background: color-mix(in srgb, var(--active) 15%, var(--surface));
}

.badge--archived {
  color: var(--archived);
  background: color-mix(in srgb, var(--archived) 15%, var(--surface));
}
</style>
