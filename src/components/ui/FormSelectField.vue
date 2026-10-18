<script setup lang="ts" generic="T extends string">
import FormLabel from '@/components/ui/FormLabel.vue'
import FormSelect from '@/components/ui/FormSelect.vue'

withDefaults(
  defineProps<{
    id: string
    label: string
    options: readonly { value: T; label: string }[]
    name?: string
    disabled?: boolean
    /** Oculta la etiqueta visible y la conserva solo para lectores de pantalla. */
    labelHidden?: boolean
  }>(),
  {
    name: undefined,
    disabled: false,
    labelHidden: false,
  },
)

const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="min-w-0">
    <FormLabel
      :id="id"
      :margin="false"
      :class="labelHidden ? 'sr-only' : 'mb-1.5 text-xs font-semibold text-graphite'"
    >
      {{ label }}
    </FormLabel>

    <!-- Receta compacta heredada de FormSelect, sin duplicar la receta de campos. -->
    <FormSelect :id="id" v-model="model" :name="name" :disabled="disabled">
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </FormSelect>
  </div>
</template>
