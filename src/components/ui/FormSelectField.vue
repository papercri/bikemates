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
  }>(),
  {
    name: undefined,
    disabled: false,
  },
)

const model = defineModel<T>({ required: true })
</script>

<template>
  <div class="min-w-0">
    <FormLabel :id="id" :margin="false" class="mb-1.5 text-xs font-semibold text-graphite">
      {{ label }}
    </FormLabel>

    <!-- Receta compacta heredada de FormSelect, sin duplicar la receta de campos. -->
    <FormSelect
      :id="id"
      v-model="model"
      :name="name"
      :disabled="disabled"
      class="[&_select]:py-2.5 [&_select]:pl-3 [&_select]:pr-9 [&_select]:text-sm"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </FormSelect>
  </div>
</template>
