<script setup lang="ts">
import LegalDialog from '@/components/legal/LegalDialog.vue'
import PrivacyContent from '@/components/legal/PrivacyContent.vue'

defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <LegalDialog :open="open" title="Política de privacidad" @close="$emit('close')">
    <PrivacyContent />
  </LegalDialog>
</template>
