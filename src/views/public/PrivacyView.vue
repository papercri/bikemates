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
        'Cómo gestiona BikeMates tus datos: registro mínimo, sin fines comerciales, sin cookies de rastreo y alojamiento seguro en Supabase.',
    },
  ],
})
</script>

<template>
  <AppPage>
    <Typography as="h1" variant="heading-xl">Compromiso de privacidad</Typography>

    <Typography variant="body-sm" tone="muted" class="mt-5">
      Este sitio web es un proyecto personal y de carácter informativo. Tu privacidad es importante.
      Por eso, te explico cómo manejo tus datos de forma transparente:
    </Typography>

    <ul class="mt-6 max-w-3xl space-y-4">
      <li>
        <Typography variant="body-sm" tone="muted">
          <Typography as="span" class="font-semibold text-ink">Registro mínimo:</Typography>
          Solo solicito tu correo electrónico cuando creas una cuenta o inicias sesión mediante
          Supabase Auth. Este dato se usa únicamente para permitir tu acceso a la plataforma.
        </Typography>
      </li>

      <li>
        <Typography variant="body-sm" tone="muted">
          <Typography as="span" class="font-semibold text-ink">Sin fines comerciales:</Typography>
          No vendo, alquilo ni comparto tu correo electrónico ni ningún otro dato con empresas,
          marcas ni terceros con fines publicitarios o comerciales.
        </Typography>
      </li>

      <li>
        <Typography variant="body-sm" tone="muted">
          <Typography as="span" class="font-semibold text-ink">Sin cookies de rastreo:</Typography>
          No utilizo herramientas de seguimiento externo, publicidad intrusiva ni analíticas que
          rastreen tu comportamiento por la web.
        </Typography>
      </li>

      <li>
        <Typography variant="body-sm" tone="muted">
          <Typography as="span" class="font-semibold text-ink">Seguridad de los datos:</Typography>
          Tu información de acceso se almacena de forma segura en la infraestructura de Supabase y
          solo se emplea para mantener tu sesión activa.
        </Typography>
      </li>
    </ul>

    <Typography as="h2" variant="heading-sm" class="mt-10">Contacto</Typography>

    <Typography variant="body-sm" tone="muted" class="mt-3 max-w-3xl">
      Si tienes cualquier duda sobre tu cuenta, el funcionamiento de la web o el manejo de tus
      datos, puedes ponerte en contacto conmigo a través de la siguiente dirección de correo
      electrónico:
    </Typography>

    <Typography as="p" variant="body-sm" class="mt-3">
      <a
        href="mailto:cristiana.sollini@gmail.com"
        class="font-medium text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trail"
      >
        cristiana.sollini@gmail.com
      </a>
    </Typography>
  </AppPage>
</template>
