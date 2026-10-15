
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
        // Conservamos el error original.
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
        class="inline-flex items-center gap-1.5 text-sm font-medium text-graphite transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trail"
      >
        <span aria-hidden="true">←</span>
        Volver a las rutas
      </RouterLink>

      <header class="mb-4 mt-3">
        <Typography variant="eyebrow" tone="accent">
          Comunidad BikeMates
        </Typography>
        <Typography as="h1" variant="heading-xl" class="mt-1">
          Publica una ruta
        </Typography>
        <Typography variant="body-sm" tone="muted" class="mt-1 max-w-2xl">
          Organiza tu próxima salida y encuentra ciclistas con quienes pedalear.
        </Typography>
      </header>

      <form novalidate class="space-y-3" @submit.prevent="handleSubmit">
       
          <div class="space-y-3 p-3 sm:p-4">
            <div>
              <Typography as="h2" variant="heading-sm">
                Información de la ruta
              </Typography>
            </div>

            <div>
              <FormLabel id="ride-title">Nombre de la ruta</FormLabel>
              <Input
                id="ride-title"
                v-model="form.title"
                name="title"
                placeholder="Ej. Gravel por Montserrat"
              />
            </div>

            <div>
              <FormLabel id="ride-description">Descripción</FormLabel>
              <textarea
                id="ride-description"
                v-model="form.description"
                name="description"
                rows="2"
                maxlength="3000"
                class="w-full resize-y rounded-btn border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-graphite focus:border-trail focus:ring-2 focus:ring-trail/25"
                placeholder="Recorrido, ritmo previsto y qué conviene llevar."
              />
              <Typography variant="caption" tone="muted" class="mt-1">
                {{ form.description.length }}/3000 caracteres
              </Typography>
            </div>

            <div>
              <FormLabel id="ride-start">Fecha y hora de salida</FormLabel>
              <input
                id="ride-start"
                v-model="form.startsAt"
                name="startsAt"
                type="datetime-local"
                class="w-full rounded-btn border border-line bg-canvas px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-trail focus:ring-2 focus:ring-trail/25"
              />
            </div>
          </div>
  
          <div class="p-3 sm:p-4">
            <div class="mb-3">
              <Typography as="h2" variant="heading-sm">
                Imagen de portada
              </Typography>
              <Typography variant="caption" tone="muted" class="mt-0.5">
                Opcional · JPG, PNG, WebP o AVIF · Máximo 5 MB
              </Typography>
            </div>

            
            <div class="flex items-center gap-3">
            <div
                class="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-line bg-snow sm:h-18 sm:w-28"
            >
                <img
                v-if="imagePreviewUrl"
                :src="imagePreviewUrl"
                alt="Vista previa de la imagen de portada"
                class="h-full w-full object-cover"
                />

                <div
                v-else
                class="flex h-full items-center justify-center text-graphite"
                >
                <svg
                    aria-hidden="true"
                    class="h-5 w-5"
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
            </div>

            <div class="min-w-0 flex-1">
                <Typography variant="body-sm">
                Imagen de portada
                </Typography>
                <Typography variant="caption" tone="muted" class="mt-0.5">
                Opcional · Máximo 5 MB
                </Typography>

                <div class="mt-2 flex flex-wrap items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    @click="imageInput?.click()"
                >
                    {{ selectedImage ? 'Cambiar' : 'Elegir imagen' }}
                </Button>

                <Button
                    v-if="selectedImage"
                    type="button"
                    variant="link"
                    size="sm"
                    @click="clearSelectedImage"
                >
                    Quitar
                </Button>
                </div>
            </div>
            </div>


            <input
              id="ride-image"
              ref="imageInput"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              class="sr-only"
              @change="handleImageChange"
            />

            <FormError v-if="imageError">
              {{ imageError }}
            </FormError>
          </div>
     

          <div class="space-y-3 p-3 sm:p-4">
            <div>
              <Typography as="h2" variant="heading-sm">
                Punto de encuentro
              </Typography>
              <Typography variant="caption" tone="muted" class="mt-0.5">
                Busca y selecciona un resultado para guardar las coordenadas.
              </Typography>
            </div>

            <MeetingPointPicker @select="handlePlaceSelect" />

            <div
              v-if="hasSelectedLocation"
              class="flex items-start gap-2 rounded-xl border border-trail/30 bg-snow px-3 py-2"
            >
              <svg
                aria-hidden="true"
                class="mt-0.5 h-4 w-4 shrink-0 text-trail-ink"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <div class="min-w-0">
                <Typography variant="body-sm" class="font-medium">
                  {{ form.meetingPoint }}
                </Typography>
                <Typography variant="caption" tone="muted">
                  {{ form.latitude?.toFixed(5) }},
                  {{ form.longitude?.toFixed(5) }}
                </Typography>
              </div>
            </div>
          </div>
     
          <div class="space-y-3 p-3 sm:p-4">
            <div>
              <Typography as="h2" variant="heading-sm">
                Detalles técnicos
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
                <FormLabel id="duration">Duración (minutos)</FormLabel>
                <Input
                  id="duration"
                  v-model="form.durationMinutes"
                  name="duration"
                  placeholder="Ej. 180"
                />
              </div>

              <div>
                <FormLabel id="max-participants">Máximo de participantes</FormLabel>
                <Input
                  id="max-participants"
                  v-model="form.maxParticipants"
                  name="maxParticipants"
                  placeholder="Sin límite"
                />
              </div>
            </div>
          </div>
  
          <div class="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:p-4">
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
              <FormLabel id="wikiloc-url">Enlace de Wikiloc (opcional)</FormLabel>
              <Input
                id="wikiloc-url"
                v-model="form.wikilocUrl"
                name="wikilocUrl"
                placeholder="https://www.wikiloc.com/..."
              />
            </div>
          </div>
   

        <Alert v-if="errorMessage" variant="error" role="alert">
          {{ errorMessage }}
        </Alert>

        <div class="flex flex-col-reverse gap-2 pb-2 sm:flex-row sm:justify-end">
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
