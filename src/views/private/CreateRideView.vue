
<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useHead } from '@unhead/vue'
import { useRouter } from 'vue-router'

import AppPage from '@/components/layout/AppPage.vue'
import MeetingPointPicker from '@/components/rides/MeetingPointPicker.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import Input from '@/components/ui/Input.vue'
import Typography from '@/components/ui/Typography.vue'
import FormLabel from '@/components/forms/FormLabel.vue'
import FormError from '@/components/forms/FormError.vue'

import { createRide } from '@/features/rides/services/rideService'
import {
  deleteRideImage,
  uploadRideImage,
  validateRideImage,
} from '@/features/rides/services/rideImageService'

import type {
  BikeType,
  CreateRideInput,
  RideAudience,
  RideLevel,
} from '@/features/rides/types'
import type { GeocodingResult } from '@/features/rides/services/geocodingService'

interface RideFormState {
  title: string
  description: string
  startsAt: string
  meetingPoint: string
  latitude: number | null
  longitude: number | null
  bikeType: BikeType
  level: RideLevel
  distanceKm: string
  elevationM: string
  durationMinutes: string
  wikilocUrl: string
  audience: RideAudience
  maxParticipants: string
}

const router = useRouter()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const imageError = ref<string | null>(null)
const selectedImage = ref<File | null>(null)
const imagePreviewUrl = ref<string | null>(null)
const imageInput = ref<HTMLInputElement | null>(null)

const form = ref<RideFormState>({
  title: '',
  description: '',
  startsAt: '',
  meetingPoint: '',
  latitude: null,
  longitude: null,
  bikeType: 'gravel',
  level: 'Intermedio',
  distanceKm: '30',
  elevationM: '300',
  durationMinutes: '120',
  wikilocUrl: '',
  audience: 'everyone',
  maxParticipants: '',
})

const hasSelectedLocation = computed(
  () =>
    form.value.meetingPoint.trim().length > 0 &&
    form.value.latitude !== null &&
    form.value.longitude !== null,
)

function handlePlaceSelect(place: GeocodingResult | null): void {
  form.value.meetingPoint = place?.label ?? ''
  form.value.latitude = place?.latitude ?? null
  form.value.longitude = place?.longitude ?? null
}

function clearSelectedImage(): void {
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
  }

  imagePreviewUrl.value = null
  selectedImage.value = null

  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

function handleImageChange(event: Event): void {
  imageError.value = null

  const input = event.target

  if (!(input instanceof HTMLInputElement)) return

  const file = input.files?.[0]

  if (!file) return

  const validationError = validateRideImage(file)

  if (validationError) {
    clearSelectedImage()
    imageError.value = validationError
    return
  }

  clearSelectedImage()
  selectedImage.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
}

function validateWikilocUrl(value: string): boolean {
  if (!value.trim()) return true

  try {
    const url = new URL(value)

    return (
      url.protocol === 'https:' &&
      (url.hostname === 'wikiloc.com' ||
        url.hostname.endsWith('.wikiloc.com'))
    )
  } catch {
    return false
  }
}

function validateForm(): string | null {
  const title = form.value.title.trim()
  const description = form.value.description.trim()

  if (title.length < 5 || title.length > 100) {
    return 'El título debe tener entre 5 y 100 caracteres.'
  }

  if (description.length < 10 || description.length > 3000) {
    return 'La descripción debe tener entre 10 y 3000 caracteres.'
  }

  if (!hasSelectedLocation.value) {
    return 'Busca y selecciona un punto de encuentro.'
  }

  const startDate = new Date(form.value.startsAt)

  if (
    !form.value.startsAt ||
    Number.isNaN(startDate.getTime()) ||
    startDate.getTime() <= Date.now()
  ) {
    return 'Selecciona una fecha y hora futuras.'
  }

  const distanceKm = Number(form.value.distanceKm)
  const elevationM = Number(form.value.elevationM)
  const durationMinutes = Number(form.value.durationMinutes)

  if (!Number.isFinite(distanceKm) || distanceKm <= 0 || distanceKm > 1000) {
    return 'La distancia debe estar entre 0 y 1000 km.'
  }

  if (!Number.isFinite(elevationM) || elevationM < 0 || elevationM > 20000) {
    return 'El desnivel debe estar entre 0 y 20000 metros.'
  }

  if (
    !Number.isInteger(durationMinutes) ||
    durationMinutes <= 0 ||
    durationMinutes > 1440
  ) {
    return 'La duración debe ser un número entero de minutos entre 1 y 1440.'
  }

  const maxParticipants = form.value.maxParticipants.trim()

  if (maxParticipants) {
    const value = Number(maxParticipants)

    if (!Number.isInteger(value) || value < 2 || value > 500) {
      return 'El máximo de participantes debe ser un entero entre 2 y 500.'
    }
  }

  if (!validateWikilocUrl(form.value.wikilocUrl)) {
    return 'Introduce una URL HTTPS válida de Wikiloc.'
  }

  if (selectedImage.value) {
    const validationError = validateRideImage(selectedImage.value)

    if (validationError) return validationError
  }

  return null
}

async function handleSubmit(): Promise<void> {
  if (isSubmitting.value) return

  errorMessage.value = validateForm()

  if (errorMessage.value) return

  const latitude = form.value.latitude
  const longitude = form.value.longitude

  if (latitude === null || longitude === null) {
    errorMessage.value = 'Selecciona un punto de encuentro válido.'
    return
  }

  const input: CreateRideInput = {
    title: form.value.title.trim(),
    description: form.value.description.trim(),
    startsAt: new Date(form.value.startsAt).toISOString(),
    meetingPoint: form.value.meetingPoint,
    latitude,
    longitude,
    bikeType: form.value.bikeType,
    level: form.value.level,
    distanceKm: Number(form.value.distanceKm),
    elevationM: Number(form.value.elevationM),
    durationMinutes: Number(form.value.durationMinutes),
    imagePath: null,
    wikilocUrl: form.value.wikilocUrl.trim() || null,
    audience: form.value.audience,
    maxParticipants: form.value.maxParticipants.trim()
      ? Number(form.value.maxParticipants)
      : null,
    status: 'published',
  }

  isSubmitting.value = true
  let uploadedImagePath: string | null = null

  try {
    if (selectedImage.value) {
      uploadedImagePath = await uploadRideImage(selectedImage.value)
      input.imagePath = uploadedImagePath
    }

    const ride = await createRide(input)

    await router.push({
      name: 'ride-detail',
      params: { id: ride.id },
    })
  } catch (error: unknown) {
    if (uploadedImagePath) {
      try {
        await deleteRideImage(uploadedImagePath)
      } catch {
        // Conservamos el error principal si falla la limpieza del archivo.
      }
    }

    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se ha podido publicar la ruta.'
  } finally {
    isSubmitting.value = false
  }
}

onUnmounted(clearSelectedImage)

useHead({
  title: 'Crear ruta | BikeMates',
  meta: [
    {
      name: 'description',
      content: 'Publica una ruta ciclista y encuentra compañeros para pedalear.',
    },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})
</script>

<template>
  <AppPage size="detail" spacing="compact">
    <div class="mx-auto max-w-3xl">
      <RouterLink
        :to="{ name: 'rides' }"
        class="inline-flex items-center gap-2 text-sm font-medium text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
      >
        <span aria-hidden="true">←</span>
        Volver a las rutas
      </RouterLink>

      <header class="mb-5 mt-4">
        <Typography variant="eyebrow" tone="accent">
          Comunidad BikeMates
        </Typography>

        <Typography as="h1" variant="display" class="mt-2">
          Publica una ruta
        </Typography>

        <Typography tone="muted" class="mt-2 max-w-2xl">
          Comparte tu próximo recorrido, define el punto de encuentro y encuentra
          ciclistas con quienes disfrutar de la ruta.
        </Typography>
      </header>

      <form novalidate class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Información general -->
        <Card as="section">
          <div class="space-y-4 p-4 sm:p-5">
            <div>
              <Typography as="h2" variant="heading-sm">
                Información de la ruta
              </Typography>
              <Typography variant="body-sm" tone="muted" class="mt-1">
                Nombre, descripción y horario de salida.
              </Typography>
            </div>

            <div>
              <FormLabel id="ride-title">Nombre de la ruta</FormLabel>
              <Input
                id="ride-title"
                v-model="form.title"
                name="title"
                placeholder="Ej. Gravel por Montserrat"
                ariaDescribedby="ride-title-help"
              />
              <Typography
                id="ride-title-help"
                as="p"
                variant="caption"
                tone="muted"
                class="mt-1"
              >
                Entre 5 y 100 caracteres.
              </Typography>
            </div>

            <div>
              <FormLabel id="ride-description">Descripción</FormLabel>
              <textarea
                id="ride-description"
                v-model="form.description"
                name="description"
                rows="3"
                maxlength="3000"
                class="w-full resize-y rounded-btn border border-line bg-canvas px-4 py-3 text-ink outline-none transition-colors placeholder:text-graphite focus:border-trail focus:ring-2 focus:ring-trail/25"
                placeholder="Describe el recorrido, el ritmo previsto y qué conviene llevar."
              />
              <Typography variant="caption" tone="muted" class="mt-1">
                {{ form.description.length }}/3000 caracteres.
              </Typography>
            </div>

            <div>
              <FormLabel id="ride-start">Fecha y hora de salida</FormLabel>
              <input
                id="ride-start"
                v-model="form.startsAt"
                name="startsAt"
                type="datetime-local"
                class="w-full rounded-btn border border-line bg-canvas px-4 py-3 text-ink outline-none transition-colors focus:border-trail focus:ring-2 focus:ring-trail/25"
              />
            </div>
          </div>
        </Card>

        <!-- Imagen de portada -->
        <Card as="section">
          <div class="space-y-3 p-4 sm:p-5">
            <div>
              <Typography as="h2" variant="heading-sm">
                Imagen de portada
              </Typography>
              <Typography variant="body-sm" tone="muted" class="mt-1">
                Una imagen horizontal para representar tu recorrido.
              </Typography>
            </div>

            <div class="overflow-hidden rounded-card border border-line bg-snow">
              <img
                v-if="imagePreviewUrl"
                :src="imagePreviewUrl"
                alt="Vista previa de la imagen de portada"
                class="aspect-[16/6] w-full object-cover"
              />

              <div
                v-else
                class="flex aspect-[16/6] flex-col items-center justify-center gap-2 px-4 text-center"
              >
                <div class="rounded-full bg-canvas p-3 text-trail-ink">
                  <svg
                    aria-hidden="true"
                    class="h-7 w-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <circle cx="8.5" cy="9" r="1.5" />
                    <path d="m21 15-5-5L5 20" />
                  </svg>
                </div>

                <Typography as="p" variant="heading-xs">
                  Tu ruta, en imágenes
                </Typography>
                <Typography variant="body-sm" tone="muted">
                  JPG, PNG, WebP o AVIF · Máximo 5 MB
                </Typography>
              </div>
            </div>

            <input
              id="ride-image"
              ref="imageInput"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              class="sr-only"
              aria-describedby="ride-image-help"
              @change="handleImageChange"
            />

            <div class="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                @click="imageInput?.click()"
              >
                {{ selectedImage ? 'Cambiar imagen' : 'Seleccionar imagen' }}
              </Button>

              <Button
                v-if="selectedImage"
                type="button"
                variant="link"
                @click="clearSelectedImage"
              >
                Quitar imagen
              </Button>
            </div>

            <Typography id="ride-image-help" variant="caption" tone="muted">
              La imagen se subirá al publicar. También puedes publicar sin
              imagen.
            </Typography>

            <FormError v-if="imageError">
              {{ imageError }}
            </FormError>
          </div>
        </Card>

        <!-- Punto de encuentro -->
        <Card as="section">
          <div class="space-y-3 p-4 sm:p-5">
            <div>
              <Typography as="h2" variant="heading-sm">
                Punto de encuentro
              </Typography>
              <Typography variant="body-sm" tone="muted" class="mt-1">
                Busca una dirección y selecciona el lugar exacto de salida.
              </Typography>
            </div>

            <MeetingPointPicker @select="handlePlaceSelect" />

            <div
              v-if="hasSelectedLocation"
              class="rounded-card border border-trail/30 bg-snow p-3"
            >
              <Typography variant="label-xs" tone="accent">
                Punto seleccionado
              </Typography>
              <Typography class="mt-1">
                {{ form.meetingPoint }}
              </Typography>
              <Typography variant="caption" tone="muted" class="mt-1">
                {{ form.latitude?.toFixed(5) }},
                {{ form.longitude?.toFixed(5) }}
              </Typography>
            </div>
          </div>
        </Card>

        <!-- Datos técnicos -->
        <Card as="section">
          <div class="space-y-4 p-4 sm:p-5">
            <div>
              <Typography as="h2" variant="heading-sm">
                Detalles técnicos
              </Typography>
              <Typography variant="body-sm" tone="muted" class="mt-1">
                Facilita que otros ciclistas valoren la dificultad y duración.
              </Typography>
            </div>

            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <FormLabel id="bike-type">Tipo de bicicleta</FormLabel>
                <FormSelect
                  id="bike-type"
                  v-model="form.bikeType"
                  name="bikeType"
                  required
                >
                  <option value="road">Carretera</option>
                  <option value="mtb">MTB</option>
                  <option value="gravel">Gravel</option>
                  <option value="urban">Urbana</option>
                  <option value="other">Otra</option>
                </FormSelect>
              </div>

              <div>
                <FormLabel id="ride-level">Nivel</FormLabel>
                <FormSelect
                  id="ride-level"
                  v-model="form.level"
                  name="level"
                  required
                >
                  <option value="Iniciación">Iniciación</option>
                  <option value="Intermedio">Intermedio</option>
                  <option value="Avanzado">Avanzado</option>
                </FormSelect>
              </div>

              <div>
                <FormLabel id="distance">Distancia (km)</FormLabel>
                <Input
                  id="distance"
                  v-model="form.distanceKm"
                  name="distance"
                  placeholder="Ej. 45"
                />
              </div>

              <div>
                <FormLabel id="elevation">Desnivel positivo (m)</FormLabel>
                <Input
                  id="elevation"
                  v-model="form.elevationM"
                  name="elevation"
                  placeholder="Ej. 650"
                />
              </div>

              <div>
                <FormLabel id="duration">Duración aproximada (minutos)</FormLabel>
                <Input
                  id="duration"
                  v-model="form.durationMinutes"
                  name="duration"
                  placeholder="Ej. 180"
                />
              </div>

              <div>
                <FormLabel id="max-participants">
                  Máximo de participantes
                </FormLabel>
                <Input
                  id="max-participants"
                  v-model="form.maxParticipants"
                  name="maxParticipants"
                  placeholder="Opcional"
                />
              </div>
            </div>
          </div>
        </Card>

        <!-- Participación y enlace -->
        <Card as="section">
          <div class="space-y-4 p-4 sm:p-5">
            <div>
              <Typography as="h2" variant="heading-sm">
                Participación y recorrido
              </Typography>
            </div>

            <div>
              <FormLabel id="audience">¿A quién va dirigida?</FormLabel>
              <FormSelect
                id="audience"
                v-model="form.audience"
                name="audience"
                required
              >
                <option value="everyone">Todo el mundo</option>
                <option value="women">Mujeres</option>
                <option value="men">Hombres</option>
                <option value="lgbt">Comunidad LGBT+</option>
              </FormSelect>
            </div>

            <div>
              <FormLabel id="wikiloc-url">
                Enlace de Wikiloc (opcional)
              </FormLabel>
              <Input
                id="wikiloc-url"
                v-model="form.wikilocUrl"
                name="wikilocUrl"
                placeholder="https://www.wikiloc.com/..."
              />
            </div>
          </div>
        </Card>

        <Alert v-if="errorMessage" variant="error" role="alert">
          {{ errorMessage }}
        </Alert>

        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            :disabled="isSubmitting"
            @click="router.push({ name: 'rides' })"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            size="lg"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? 'Publicando ruta…' : 'Publicar ruta' }}
          </Button>
        </div>
      </form>
    </div>
  </AppPage>
</template>
