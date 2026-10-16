<script setup lang="ts">
import { FIELD_CLASSES } from '@/design-system'

withDefaults(
  defineProps<{
    id: string
    name?: string
    rows?: number
    minlength?: number
    maxlength?: number
    placeholder?: string
    required?: boolean
    disabled?: boolean
    ariaInvalid?: boolean
    ariaDescribedby?: string
  }>(),
  {
    name: undefined,
    rows: undefined,
    minlength: undefined,
    maxlength: undefined,
    placeholder: undefined,
    required: false,
    disabled: false,
    ariaInvalid: false,
    ariaDescribedby: undefined,
  },
)

const model = defineModel<string>({ required: true })
</script>

<template>
  <textarea
    :id="id"
    v-model="model"
    :name="name"
    :rows="rows"
    :minlength="minlength"
    :maxlength="maxlength"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :aria-invalid="ariaInvalid"
    :aria-describedby="ariaDescribedby"
    :class="[FIELD_CLASSES, 'px-4 py-3']"
  />
</template>
