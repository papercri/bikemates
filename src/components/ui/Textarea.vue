<script setup lang="ts">
import { ref } from 'vue'
import { FIELD_BARE_CLASSES, FIELD_CLASSES } from '@/design-system'

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
    /** Sin borde ni anillo de foco: el contenedor gestiona su propio chrome. */
    bare?: boolean
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
    bare: false,
  },
)

const model = defineModel<string>({ required: true })

const el = ref<HTMLTextAreaElement | null>(null)

defineExpose({ el })
</script>

<template>
  <textarea
    ref="el"
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
    :class="[bare ? FIELD_BARE_CLASSES : FIELD_CLASSES, 'px-3 py-2']"
  />
</template>
