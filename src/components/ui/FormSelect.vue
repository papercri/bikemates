
<script setup lang="ts" generic="T extends string">
withDefaults(
  defineProps<{
    id: string
    name?: string
    required?: boolean
    disabled?: boolean
    ariaInvalid?: boolean
    ariaDescribedby?: string
  }>(),
  {
    name: undefined,
    required: false,
    disabled: false,
    ariaInvalid: false,
    ariaDescribedby: undefined,
  },
)

const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="relative min-w-0">
    <select
      :id="id"
      v-model="model"
      :name="name"
      :required="required"
      :disabled="disabled"
      :aria-invalid="ariaInvalid"
      :aria-describedby="ariaDescribedby"
      class="h-10 w-full appearance-none rounded-lg border border-line bg-canvas pl-3 pr-9 text-sm text-ink outline-none transition-colors hover:border-graphite/50 focus:border-trail focus:ring-2 focus:ring-trail/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <slot />
    </select>

    <svg
      aria-hidden="true"
      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m7 10 5 5 5-5" />
    </svg>
  </div>
</template>
