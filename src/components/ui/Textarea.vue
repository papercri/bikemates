<script setup lang="ts">
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
    class="w-full rounded-btn border border-line bg-canvas text-ink outline-none transition-colors placeholder:text-graphite focus:border-trail focus:ring-2 focus:ring-trail/25 px-4 py-3"
  />
</template>
