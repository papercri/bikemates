<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppPage from '@/components/layout/AppPage.vue'
import Typography from '@/components/ui/Typography.vue'

useHead({
  title: 'Normas de la comunidad | BikeMates',
  meta: [
    {
      name: 'description',
      content:
        'Reglas de BikeMates para que las salidas sean seguras y divertidas: funcionamiento y responsabilidad, equipamiento obligatorio y comportamiento en la carretera.',
    },
  ],
})

interface CommunityRule {
  lead: string
  text: string
}

interface RuleSection {
  id: string
  heading: string
  rules: readonly CommunityRule[]
}

/**
 * Normas de la comunidad y de las salidas. Se describen en tono directo y se
 * aceptan al apuntarse a una ruta; no sustituyen a las condiciones de uso.
 */
const sections: readonly RuleSection[] = [
  {
    id: 'funcionamiento',
    heading: 'Funcionamiento y responsabilidad',
    rules: [
      {
        lead: 'Una web de amigos:',
        text: 'Esta es una plataforma donde la gente organiza y propone salidas de forma totalmente amateur. No somos un club oficial, una empresa, ni tenemos ningún tipo de seguro contratado.',
      },
      {
        lead: 'Responsabilidad individual:',
        text: 'Al apuntarte a una salida, aceptas que ruedas bajo tu propio riesgo. Cada ciclista es responsable de sus actos, de sus caídas y de los daños que pueda causar a terceros.',
      },
      {
        lead: 'Tu nivel, tu responsabilidad:',
        text: 'Cada cual es responsable de valorar su condición física respecto al nivel, ritmo y exigencia de la salida propuesta en la web. Elige bien la ruta para asegurar tu diversión y la del grupo.',
      },
      {
        lead: 'Compañerismo:',
        text: 'No somos una carrera. Nos cuidamos entre todos avisando de los peligros en la carretera (baches, coches) y paramos juntos si alguien tiene un pinchazo o avería.',
      },
    ],
  },
  {
    id: 'equipamiento',
    heading: 'Equipamiento obligatorio (antes de salir)',
    rules: [
      {
        lead: 'Casco siempre:',
        text: 'Es el único requisito innegociable. Sin casco no se rueda en el grupo.',
      },
      {
        lead: 'Autonomía mecánica:',
        text: 'Trae la bici revisada de casa (frenos y presión). Es obligatorio llevar tu propio kit básico: cámara de repuesto de tu medida, desmontables y bomba.',
      },
      {
        lead: 'Agua y energía:',
        text: 'Lleva siempre el bidón lleno y suficiente comida (barritas, fruta o geles) para la distancia propuesta.',
      },
    ],
  },
  {
    id: 'carretera',
    heading: 'En la carretera / camino',
    rules: [
      {
        lead: 'Se respeta el grupo:',
        text: 'Nos adaptamos al ritmo de la marcha propuesto por el creador de la salida.',
      },
      {
        lead: 'Puntos de reagrupamiento:',
        text: 'Nadie se queda atrás. En los cruces conflictivos y en la cima de los puertos o subidas, se para siempre a esperar al grupo antes de continuar.',
      },
    ],
  },
]
</script>

<template>
  <AppPage>
    <div class="mx-auto max-w-2xl">
      <Typography as="h1" variant="heading-xl">Normas de la comunidad</Typography>

      <Typography variant="body-sm" tone="muted" class="mt-5">
        Bienvenido a nuestro espacio de quedadas. Para que las salidas sean seguras, divertidas y
        mantengamos el buen ambiente, compartimos estas reglas básicas que todos aceptamos al
        apuntarnos a una ruta.
      </Typography>

      <section
        v-for="section in sections"
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
  </AppPage>
</template>
