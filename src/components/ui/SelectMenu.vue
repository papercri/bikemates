<script setup lang="ts" generic="T extends string">
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed } from 'vue'
import DropdownMenu from '@/components/ui/DropdownMenu.vue'
import { MENU_ITEM_CLASSES } from '@/design-system'

export interface SelectMenuOption<T> {
  value: T
  label: string
}

const props = defineProps<{
  /** Nombre accesible del campo, también usado como etiqueta del menú. */
  label: string
  /** Icono decorativo que encabeza el disparador. */
  icon: IconDefinition
  options: readonly SelectMenuOption<T>[]
}>()

const model = defineModel<T>({ required: true })

const selectedLabel = computed(
  () => props.options.find((option) => option.value === model.value)?.label ?? '',
)

/**
 * La etiqueta accesible repite el valor visible; cuando el valor ya es la propia
 * etiqueta del campo no se duplica ("Ordenar por" en lugar de "Ordenar por: Ordenar por").
 */
const triggerLabel = computed(() =>
  selectedLabel.value === props.label ? props.label : `${props.label}: ${selectedLabel.value}`,
)

/** Disparador con el mismo dibujo que los botones de acción, pero con borde muy claro. */
const TRIGGER_CLASSES =
  'flex w-full items-center gap-2 rounded-field border border-line bg-white px-3 py-1.5 text-left text-sm text-ink transition-colors hover:border-line-strong hover:bg-snow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink'

function select(value: T): void {
  model.value = value
}
</script>

<template>
  <DropdownMenu
    :label="props.label"
    :trigger-label="triggerLabel"
    :trigger-class="TRIGGER_CLASSES"
    menu-align="start"
  >
    <template #trigger="{ isOpen }">
      <FontAwesomeIcon
        :icon="props.icon"
        aria-hidden="true"
        class="size-3.5 shrink-0 text-graphite"
      />

      <span class="min-w-0 flex-1 truncate">{{ selectedLabel }}</span>

      <FontAwesomeIcon
        :icon="faChevronDown"
        aria-hidden="true"
        class="size-3 shrink-0 text-graphite transition-transform"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </template>

    <template #default>
      <button
        v-for="option in props.options"
        :key="option.value"
        type="button"
        role="menuitemradio"
        :aria-checked="option.value === model"
        :class="[MENU_ITEM_CLASSES, option.value === model ? 'bg-surface font-semibold' : '']"
        @click="select(option.value)"
      >
        <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>

        <FontAwesomeIcon
          v-if="option.value === model"
          :icon="faCheck"
          aria-hidden="true"
          class="size-3.5 shrink-0 text-trail-ink"
        />
      </button>
    </template>
  </DropdownMenu>
</template>
