<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    name?: string
    type?: 'text' | 'email' | 'password' | 'search'
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
    class="w-full rounded-btn border border-line bg-canvas text-ink outline-none transition-colors placeholder:text-graphite focus:border-trail focus:ring-2 focus:ring-trail/25"
    :class="trailing ? 'py-3 pl-4 pr-12' : 'px-4 py-3'"
  />
</template>
