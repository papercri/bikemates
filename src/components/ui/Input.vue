<script setup lang="ts">
import { FIELD_CLASSES } from '@/design-system'

withDefaults(
  defineProps<{
    id: string
    name?: string
    type?: 'text' | 'email' | 'password' | 'search' | 'datetime-local'
    autocomplete?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    ariaInvalid?: boolean
    ariaDescribedby?: string
    trailing?: boolean
  }>(),
  {
    name: undefined,
    type: 'text',
    autocomplete: undefined,
    placeholder: undefined,
    required: false,
    disabled: false,
    ariaInvalid: false,
    ariaDescribedby: undefined,
    trailing: false,
  },
)

const model = defineModel<string>({ required: true })
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :name="name"
    :type="type"
    :autocomplete="autocomplete"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    :aria-invalid="ariaInvalid"
    :aria-describedby="ariaDescribedby"
    :class="[FIELD_CLASSES, trailing ? 'py-2 pl-3 pr-10' : 'px-3 py-2']"
  />
</template>
