<script setup lang="ts">
import { MotionConfig } from 'motion-v'
import CookieBanner from '@/components/layout/CookieBanner.vue'
import { inject } from '@vercel/analytics';
</script>

<template>
  <MotionConfig reduced-motion="user">
    <RouterView />
    <CookieBanner />
  </MotionConfig>
  
</template>
