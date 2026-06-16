<script setup lang="ts">
import { ProjectStatus } from '@/types'
import { FilterDropdown, BaseButton, type DropdownOption } from '@/components/ui'
import { IconSearch, IconFilter, IconPlus } from '@/components/icons'
import { useNullableSelect } from '@/composables'

const search = defineModel<string>('search', { required: true })
const status = defineModel<ProjectStatus | null>('status', { required: true })

defineEmits<{
  (e: 'add'): void
}>()

type StatusFilter = ProjectStatus | 'all'

const statusOptions: DropdownOption<StatusFilter>[] = [
  { value: 'all', label: 'Усі' },
  { value: ProjectStatus.Active, label: 'Активні' },
  { value: ProjectStatus.Archived, label: 'Архівні' },
]

const statusProxy = useNullableSelect(status)
</script>

<template>
  <div class="toolbar">
    <div class="toolbar__search">
      <IconSearch
        class="toolbar__search-icon"
        width="16"
        height="16"
      />
      <input
        v-model="search"
        type="search"
        class="toolbar__input"
        placeholder="Пошук за назвою"
        aria-label="Пошук за назвою"
      >
    </div>

    <FilterDropdown
      v-model="statusProxy"
      :options="statusOptions"
      aria-label="Статус проекту"
    >
      <template #icon>
        <IconFilter
          width="15"
          height="15"
        />
      </template>
    </FilterDropdown>

    <div class="toolbar__spacer" />

    <BaseButton
      variant="primary"
      @click="$emit('add')"
    >
      <template #icon>
        <IconPlus
          width="16"
          height="16"
        />
      </template>
      Додати проект
    </BaseButton>
  </div>
</template>

<style scoped lang="scss">
.toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 18px;

  &__search {
    position: relative;
    display: flex;
    align-items: center;
    flex: 1;
    min-width: 200px;
    max-width: 340px;
  }

  &__search-icon {
    position: absolute;
    left: 12px;
    color: var(--text-tertiary);
    pointer-events: none;
  }

  &__input {
    width: 100%;
    height: 40px;
    padding: 0 12px 0 36px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font: inherit;
    font-size: 14px;
    outline: none;
    transition: border-color 0.15s, box-shadow 0.15s;

    &::placeholder {
      color: var(--text-tertiary);
    }

    &:focus-visible {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px var(--ring);
    }
  }

  &__spacer {
    flex: 1;
  }
}
</style>
