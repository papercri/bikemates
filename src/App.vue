<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import CookieBanner from '@/components/layout/CookieBanner.vue'
import { Analytics } from '@vercel/analytics/vue'
</script>

<template>
  <MotionConfig reduced-motion="user">
    <RouterView />
    <CookieBanner />
  </MotionConfig>
   <Analytics />
</template>
