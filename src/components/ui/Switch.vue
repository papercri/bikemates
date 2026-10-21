<script setup lang="ts">
import { useId } from 'vue'
import { cn } from '@/design-system'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    id?: string
    label?: string
    disabled?: boolean
    ariaDescribedby?: string
  }>(),
  {
    id: undefined,
    label: undefined,
    disabled: false,
    ariaDescribedby: undefined,
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
  <label
    :for="inputId"
    :class="cn('flex items-start gap-3', disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer')"
  >
    <input
      :id="inputId"
      type="checkbox"
      role="switch"
      :checked="modelValue"
      :disabled="disabled"
      :aria-describedby="ariaDescribedby"
      class="peer sr-only"
      @change="handleChange"
    />

    <span
      :class="
        cn(
          'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
          'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink',
          'disabled:cursor-not-allowed disabled:opacity-60',
          modelValue ? 'bg-trail' : 'bg-line-strong',
        )
      "
      aria-hidden="true"
    >
      <span
        :class="
          cn(
            'ml-0.5 block size-5 rounded-full bg-white shadow-sm transition-transform',
            modelValue ? 'translate-x-5' : 'translate-x-0',
          )
        "
      />
    </span>

    <div class="min-w-0 text-sm text-ink">
      <span>
        <slot>{{ label }}</slot>
      </span>

      <div v-if="$slots.description" class="mt-1">
        <slot name="description" />
      </div>
    </div>
  </label>
</template>
