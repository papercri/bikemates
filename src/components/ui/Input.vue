<script setup lang="ts">
import { FIELD_CLASSES, FIELD_SUBTLE_CLASSES } from '@/design-system'

const props = withDefaults(
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
    /** Filete muy claro, para agrupar visualmente con los desplegables. */
    subtle?: boolean
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
    subtle: false,
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
    :class="[
      props.subtle ? FIELD_SUBTLE_CLASSES : FIELD_CLASSES,
      trailing ? 'py-1.5 pl-3 pr-10' : 'px-3 py-1.5',
    ]"
  />
</template>
