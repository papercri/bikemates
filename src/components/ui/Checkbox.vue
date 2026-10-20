<script setup lang="ts">
import { useId } from 'vue'
import { cn } from '@/design-system'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id?: string
    label?: string
    /** Tamaño del texto de la etiqueta: `xs` para avisos legales compactos. */
    size?: 'sm' | 'xs'
    disabled?: boolean
    ariaDescribedby?: string
    ariaInvalid?: boolean
  }>(),
  {
    id: undefined,
    label: undefined,
    size: 'sm',
    disabled: false,
    ariaDescribedby: undefined,
    ariaInvalid: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const generatedId = useId()
const inputId = props.id ?? generatedId

function handleChange(event: Event): void {
  const target = event.target
  if (target instanceof HTMLInputElement) {
    emit('update:modelValue', target.checked)
  }
}
</script>

<template>
  <div class="flex items-start gap-3">
    <input
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      :aria-describedby="ariaDescribedby"
      :aria-invalid="ariaInvalid || undefined"
      :class="
        cn(
          'mt-0.5 size-4 shrink-0 cursor-pointer rounded-[4px] border border-line-strong accent-trail',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
          'disabled:cursor-not-allowed disabled:opacity-60',
        )
      "
      @change="handleChange"
    />

    <div class="min-w-0">
      <label
        :for="inputId"
        :class="cn('cursor-pointer text-ink', props.size === 'xs' ? 'text-xs' : 'text-sm')"
      >
        <slot>{{ label }}</slot>
      </label>

      <div v-if="$slots.description" class="mt-1">
        <slot name="description" />
      </div>
    </div>
  </div>
</template>
