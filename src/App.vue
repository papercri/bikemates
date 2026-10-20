<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import CookieBanner from '@/components/layout/CookieBanner.vue'
import { Analytics } from "@vercel/analytics/next"
</script>

<template>
  <MotionConfig reduced-motion="user">
    <RouterView />
    <CookieBanner />
  </MotionConfig>
</template>
