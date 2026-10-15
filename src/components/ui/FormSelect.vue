
<script setup lang="ts">
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

const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="relative w-full">
    <select
      :id="id"
      v-model="model"
      :name="name"
      :required="required"
      :disabled="disabled"
      :aria-invalid="ariaInvalid"
      :aria-describedby="ariaDescribedby"
      class="w-full appearance-none rounded-btn border border-line bg-canvas py-3 pl-4 pr-10 text-ink outline-none transition-colors focus:border-trail focus:ring-2 focus:ring-trail/25 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <slot />
    </select>

    <svg
      aria-hidden="true"
      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-graphite"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </div>
</template>
