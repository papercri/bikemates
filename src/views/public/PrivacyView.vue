<script setup lang="ts">
import { useHead } from '@unhead/vue'
import AppPage from '@/components/layout/AppPage.vue'
import Typography from '@/components/ui/Typography.vue'

useHead({
  title: 'Política de privacidad | BikeMates',
  meta: [
    {
      name: 'description',
      content:
        'Cómo trata BikeMates tus datos personales: responsable, datos recogidos, finalidad, conservación, destinatarios, seguridad, cookies y derechos. Proyecto personal sin fines comerciales.',
    },
  ],
})

interface PolicySection {
  id: string
  heading: string
  paragraphs: string[]
}

/**
 * Política redactada en tercera persona para un tono formal. Se describen
 * únicamente los hechos reales del proyecto: registro por correo vía Supabase
 * Auth, sin uso comercial y con cookies propias para el funcionamiento del
 * servicio y las preferencias de navegación.
 */
const sections: readonly PolicySection[] = [
  {
    id: 'responsable',
    heading: 'Responsable del tratamiento',
    paragraphs: [
      'BikeMates es un proyecto personal de carácter informativo y sin ánimo de lucro. El responsable del tratamiento de los datos personales recogidos en este sitio es la persona titular del proyecto, a la que puedes contactar en la dirección indicada al final de esta política.',
    ],
  },
  {
    id: 'datos',
    heading: 'Datos que se recogen',
    paragraphs: [
      'El único dato personal obligatorio para crear una cuenta es tu dirección de correo electrónico, que se solicita exclusivamente para permitirte acceder a la plataforma a través de Supabase Auth.',
      'De forma voluntaria, puedes publicar información en tu perfil y en las rutas que crees (nombre visible, foto, biografía o descripción de salidas). Estos datos son visibles para el resto de personas usuarias según la configuración de cada contenido.',
    ],
  },
  {
    id: 'finalidad',
    heading: 'Finalidad y base jurídica',
    paragraphs: [
      'Tu correo electrónico se utiliza únicamente para gestionar tu cuenta, autenticarte y mantenerte la sesión. La base jurídica del tratamiento es tu consentimiento, que otienes al crear la cuenta y que puedes retirar en cualquier momento eliminándola.',
    ],
  },
  {
    id: 'conservacion',
    heading: 'Conservación de los datos',
    paragraphs: [
      'Los datos se conservan mientras tu cuenta permanezca activa. Puedes solicitar su eliminación en cualquier momento, y se retirarán salvo que una obligación legal exija conservarlos durante un plazo adicional.',
    ],
  },
  {
    id: 'destinatarios',
    heading: 'Destinatarios y encargados',
    paragraphs: [
      'La infraestructura y la base de datos se alojan en Supabase, que actúa como encargado del tratamiento. No se vende, alquila ni ceden tus datos a terceros con fines publicitarios o comerciales, y no se comparten con organismos salvo obligación legal.',
    ],
  },
  {
    id: 'seguridad',
    heading: 'Seguridad',
    paragraphs: [
      'La información de acceso se almacena en la infraestructura de Supabase y se trata de forma segura, con el mínimo acceso necesario para prestar el servicio.',
    ],
  },
  {
    id: 'cookies',
    heading: 'Cookies y tecnologías similares',
    paragraphs: [
      'Este sitio utiliza cookies para el funcionamiento del servicio, mantener la sesión iniciada y recordar tus preferencias de navegación. Tu preferencia sobre el aviso de cookies se guarda en tu navegador.',
    ],
  },
]

const rights: readonly string[] = [
  'Acceder a los datos personales que te conciernen.',
  'Solicitar la rectificación de datos inexactos.',
  'Solicitar la supresión de tus datos cuando ya no sean necesarios.',
  'Oponerte al tratamiento o solicitar su limitación.',
  'Retirar tu consentimiento en cualquier momento.',
]
</script>

<template>
  <AppPage>
    <div class="mx-auto max-w-2xl">
      <Typography as="h1" variant="heading-xl">Política de privacidad</Typography>

      <Typography variant="body-sm" tone="muted" class="mt-5">
        Esta política explica de forma transparente cómo se tratan los datos personales de las
        personas que utilizan BikeMates. BikeMates es un proyecto personal y sin ánimo de lucro: el
        tratamiento se limita a lo estrictamente necesario para prestar el servicio.
      </Typography>

      <Typography variant="body-sm" tone="muted" class="mt-3">
        Última actualización: 19 de octubre de 2026.
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

        <Typography
          v-for="(paragraph, index) in section.paragraphs"
          :key="index"
          variant="body-sm"
          tone="muted"
          class="mt-3"
        >
          {{ paragraph }}
        </Typography>
      </section>

      <section aria-labelledby="derechos" class="mt-8">
        <Typography id="derechos" as="h2" variant="heading-sm">
          Derechos de las personas usuarias
        </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-3">
          De acuerdo con la normativa europea de protección de datos, puedes ejercer los siguientes
          derechos sobre tus datos personales:
        </Typography>

        <ul class="mt-3 list-disc space-y-1.5 pl-5">
          <li v-for="(right, index) in rights" :key="index">
            <Typography variant="body-sm" tone="muted">{{ right }}</Typography>
          </li>
        </ul>

        <Typography variant="body-sm" tone="muted" class="mt-3">
          Para ejercer cualquiera de estos derechos basta con escribir a la dirección de contacto
          indicada más abajo, adjuntando la información necesaria para verificar tu identidad.
        </Typography>
      </section>

      <section aria-labelledby="cambios" class="mt-8">
        <Typography id="cambios" as="h2" variant="heading-sm">
          Cambios en esta política
        </Typography>

        <Typography variant="body-sm" tone="muted" class="mt-3">
          Esta política puede actualizarse para reflejar cambios en el funcionamiento del sitio o en
          la normativa aplicable. La fecha de la última revisión figura al inicio del documento.
        </Typography>
      </section>

      <section aria-labelledby="contacto" class="mt-8">
        <Typography id="contacto" as="h2" variant="heading-sm">Contacto</Typography>

        <Typography variant="body-sm" tone="muted" class="mt-3">
          Si tienes cualquier duda sobre tu cuenta, el funcionamiento de la web o el manejo de tus
          datos, puedes ponerte en contacto a través de la siguiente dirección de correo
          electrónico:
        </Typography>

        <Typography as="p" variant="body-sm" class="mt-3">
          <a
            href="mailto:cristiana.sollini@gmail.com"
            class="font-medium text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            cristiana.sollini@gmail.com
          </a>
        </Typography>
      </section>
    </div>
  </AppPage>
</template>
