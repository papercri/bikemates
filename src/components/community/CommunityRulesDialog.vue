<script setup lang="ts">
import LegalDialog from '@/components/legal/LegalDialog.vue'
import CommunityRulesContent from '@/components/community/CommunityRulesContent.vue'

defineProps<{
  open: boolean
}>()

defineEmits<{
  close: []
}>()
</script>

<template>
  <LegalDialog :open="open" title="Normas de la comunidad" @close="$emit('close')">
    <CommunityRulesContent />
  </LegalDialog>
</template>
