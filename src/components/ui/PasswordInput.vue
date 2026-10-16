<script setup lang="ts">
import { computed, ref } from 'vue'
import IconEye from '@/components/icons/IconEye.vue'
import Input from '@/components/ui/Input.vue'

const model = defineModel<string>({ required: true })

defineProps<{
  id: string
  name?: string
  autocomplete?: string
  placeholder?: string
  required?: boolean
  ariaInvalid?: boolean
  ariaDescribedby?: string
}>()

const visible = ref(false)
const inputType = computed(() => (visible.value ? 'text' : 'password'))
</script>

<template>
  <div class="relative">
    <Input
      v-model="model"
      :id="id"
      :name="name"
      :type="inputType"
      :autocomplete="autocomplete"
      :placeholder="placeholder"
      :required="required"
      :aria-invalid="ariaInvalid"
      :aria-describedby="ariaDescribedby"
      trailing
    />

    <button
      type="button"
      class="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-btn text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-trail"
      :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <IconEye :hidden="!visible" />
    </button>
  </div>
</template>
