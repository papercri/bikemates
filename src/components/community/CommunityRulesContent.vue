<script setup lang="ts">
import Typography from '@/components/ui/Typography.vue'
import { COMMUNITY_RULES } from '@/features/community/communityRules'
</script>

<template>
  <div>
    <Typography variant="body-sm" tone="muted">
      Bienvenido a nuestro espacio de quedadas. Para que las salidas sean seguras, divertidas y
      mantengamos el buen ambiente, compartimos estas reglas básicas que todos aceptamos al
      apuntarnos a una ruta.
    </Typography>

    <section
      v-for="section in COMMUNITY_RULES"
      :key="section.id"
      :aria-labelledby="section.id"
      class="mt-8"
    >
      <Typography :id="section.id" as="h2" variant="heading-sm">
        {{ section.heading }}
      </Typography>

      <ul class="mt-3 list-disc space-y-2.5 pl-5">
        <li v-for="rule in section.rules" :key="rule.lead">
          <Typography variant="body-sm" tone="muted">
            <span class="font-semibold text-ink">{{ rule.lead }}</span>
            {{ ' ' }}
            {{ rule.text }}
          </Typography>
        </li>
      </ul>
    </section>
  </div>
</template>
