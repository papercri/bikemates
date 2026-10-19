<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import type { RideFormSubmission, RideFormValues } from '@/features/rides/types'
import type { GeocodingResult } from '@/features/rides/services/geocodingService'

import {
  emptyRideFormErrors,
  firstRideFormError,
  validateRideFormFields,
  type RideFormErrors,
} from '@/features/rides/validators/rideFormValidator'
import { useRideImagePicker } from '@/features/rides/composables/useRideImagePicker'

import MeetingPointPicker from '@/features/rides/components/MeetingPointPicker.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import FormError from '@/components/ui/FormError.vue'
import FormHelp from '@/components/ui/FormHelp.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import Input from '@/components/ui/Input.vue'
import RichTextarea from '@/components/ui/RichTextarea.vue'
import {
  RIDE_AUDIENCES,
  RIDE_AUDIENCE_LABELS,
  RIDE_BIKE_TYPES,
  RIDE_BIKE_TYPE_LABELS,
} from '@/features/rides/constants/rideOptions'
import { RIDE_LEVELS } from '@/features/rides/constants/rideLevels'

const props = defineProps<{
  initialValues: RideFormValues
  isSubmitting: boolean
  errorMessage: string | null
  mode?: 'create' | 'edit'
  initialImageUrl?: string | null
}>()

const emit = defineEmits<{
  submit: [payload: RideFormSubmission]
}>()

const isEditMode = computed(() => props.mode === 'edit')

// Filete que encabeza cada bloque del formulario: etiqueta mono en versalitas
// con regla hairline, en línea con la voz editorial del resto de la app.
const legendClasses =
  'w-full border-b border-line pb-2 font-mono text-xs font-semibold tracking-[0.18em] text-graphite uppercase'

const form = reactive<RideFormValues>({
  ...props.initialValues,
})

const fieldErrors = ref<RideFormErrors>(emptyRideFormErrors())

/** Primer error del formulario, en orden de visualización: resumen junto al botón. */
const summaryError = computed(() => firstRideFormError(fieldErrors.value))

const {
  selectedImage,
  imagePreviewUrl,
  imageError,
  removeCurrentImage,
  imageInput,
  currentImageVisible,
  clearSelectedImage,
  handleImageChange,
} = useRideImagePicker(() => props.initialImageUrl)

watch(
  () => props.initialValues,
  (values) => {
    Object.assign(form, values)
  },
  { deep: true },
)

watch(
  form,
  () => {
    fieldErrors.value = emptyRideFormErrors()
  },
  { deep: true },
)

function handlePlaceSelect(place: GeocodingResult | null): void {
  form.meetingPoint = place?.label ?? ''
  form.latitude = place?.latitude ?? null
  form.longitude = place?.longitude ?? null
}

function handleSubmit(): void {
  if (props.isSubmitting) return

  const errors = validateRideFormFields(form, selectedImage.value)

  // El error de la imagen en vivo (tamaño/tipo) tiene prioridad sobre el del validador.
  fieldErrors.value = imageError.value ? { ...errors, image: imageError.value } : errors

  if (summaryError.value !== null) return

  emit('submit', {
    values: { ...form },
    image: selectedImage.value,
    removeCurrentImage: removeCurrentImage.value,
  })
}
</script>

<template>
  <form novalidate class="space-y-6" @submit.prevent="handleSubmit">
    <Alert v-if="errorMessage" boxed>
      {{ errorMessage }}
    </Alert>

    <fieldset class="min-w-0 border-0 p-0">
      <legend :class="legendClasses">Datos básicos</legend>

      <div class="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div>
          <FormLabel id="title">Nombre de la ruta</FormLabel>
          <Input
            id="title"
            v-model="form.title"
            name="title"
            placeholder="Ej. Vuelta por Collserola"
            required
            maxlength="100"
            :aria-invalid="Boolean(fieldErrors.title)"
            :aria-describedby="fieldErrors.title ? 'title-error' : 'title-help'"
          />
          <FormError v-if="fieldErrors.title" id="title-error">
            {{ fieldErrors.title }}
          </FormError>
          <FormHelp v-else id="title-help">Entre 5 y 100 caracteres.</FormHelp>
        </div>

        <div>
          <FormLabel id="startsAt">Fecha y hora de salida</FormLabel>
          <Input
            id="startsAt"
            v-model="form.startsAt"
            name="startsAt"
            type="datetime-local"
            required
            :aria-invalid="Boolean(fieldErrors.startsAt)"
            aria-describedby="startsAt-error"
          />
          <FormError v-if="fieldErrors.startsAt" id="startsAt-error">
            {{ fieldErrors.startsAt }}
          </FormError>
        </div>

        <div class="sm:col-span-2">
          <FormLabel id="description">Descripción</FormLabel>
          <RichTextarea
            id="description"
            v-model="form.description"
            name="description"
            :rows="6"
            :minlength="10"
            :maxlength="3000"
            required
            placeholder="Describe el recorrido, el terreno y qué deben llevar los participantes..."
            :aria-invalid="Boolean(fieldErrors.description)"
            :aria-describedby="fieldErrors.description ? 'description-error' : undefined"
          />
          <FormError v-if="fieldErrors.description" id="description-error">
            {{ fieldErrors.description }}
          </FormError>
          <p class="mt-1 text-right text-xs text-graphite tabular-nums">
            {{ form.description.length }}/3000
          </p>
        </div>
      </div>
    </fieldset>

    <fieldset class="min-w-0 border-0 p-0">
      <legend :class="legendClasses">Recorrido</legend>

      <div class="mt-3.5 space-y-3 sm:space-y-4">
        <div>
          <MeetingPointPicker :initial-value="form.meetingPoint" @select="handlePlaceSelect" />

          <FormError v-if="fieldErrors.meetingPoint" id="meetingPoint-error">
            {{ fieldErrors.meetingPoint }}
          </FormError>
          <FormHelp v-else-if="form.meetingPoint">
            Punto seleccionado: {{ form.meetingPoint }}
          </FormHelp>
        </div>

        <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          <div>
            <FormLabel id="distanceKm">Distancia (km)</FormLabel>
            <Input
              id="distanceKm"
              v-model="form.distanceKm"
              name="distanceKm"
              inputmode="decimal"
              placeholder="30"
              required
              :aria-invalid="Boolean(fieldErrors.distanceKm)"
              aria-describedby="distanceKm-error"
            />
            <FormError v-if="fieldErrors.distanceKm" id="distanceKm-error">
              {{ fieldErrors.distanceKm }}
            </FormError>
          </div>

          <div>
            <FormLabel id="elevationM">Desnivel positivo (m)</FormLabel>
            <Input
              id="elevationM"
              v-model="form.elevationM"
              name="elevationM"
              inputmode="numeric"
              placeholder="300"
              required
              :aria-invalid="Boolean(fieldErrors.elevationM)"
              aria-describedby="elevationM-error"
            />
            <FormError v-if="fieldErrors.elevationM" id="elevationM-error">
              {{ fieldErrors.elevationM }}
            </FormError>
          </div>

          <div>
            <FormLabel id="durationMinutes">Duración estimada (min)</FormLabel>
            <Input
              id="durationMinutes"
              v-model="form.durationMinutes"
              name="durationMinutes"
              inputmode="numeric"
              placeholder="120"
              required
              :aria-invalid="Boolean(fieldErrors.durationMinutes)"
              aria-describedby="durationMinutes-error"
            />
            <FormError v-if="fieldErrors.durationMinutes" id="durationMinutes-error">
              {{ fieldErrors.durationMinutes }}
            </FormError>
          </div>
        </div>

        <div>
          <FormLabel id="wikilocUrl">Enlace de Wikiloc (opcional)</FormLabel>
          <Input
            id="wikilocUrl"
            v-model="form.wikilocUrl"
            name="wikilocUrl"
            placeholder="https://www.wikiloc.com/..."
            :aria-invalid="Boolean(fieldErrors.wikilocUrl)"
            aria-describedby="wikilocUrl-error"
          />
          <FormError v-if="fieldErrors.wikilocUrl" id="wikilocUrl-error">
            {{ fieldErrors.wikilocUrl }}
          </FormError>
        </div>
      </div>
    </fieldset>

    <fieldset class="min-w-0 border-0 p-0">
      <legend :class="legendClasses">Detalles de la salida</legend>

      <div class="mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
        <div>
          <FormLabel id="bikeType">Tipo de bicicleta</FormLabel>
          <FormSelect id="bikeType" v-model="form.bikeType" name="bikeType" required>
            <option v-for="bikeType in RIDE_BIKE_TYPES" :key="bikeType" :value="bikeType">
              {{ RIDE_BIKE_TYPE_LABELS[bikeType] }}
            </option>
          </FormSelect>
        </div>

        <div>
          <FormLabel id="level">Nivel</FormLabel>
          <FormSelect id="level" v-model="form.level" name="level" required>
            <option v-for="level in RIDE_LEVELS" :key="level" :value="level">
              {{ level }}
            </option>
          </FormSelect>
        </div>

        <div>
          <FormLabel id="maxParticipants">Máximo de participantes</FormLabel>
          <Input
            id="maxParticipants"
            v-model="form.maxParticipants"
            name="maxParticipants"
            inputmode="numeric"
            placeholder="Sin límite"
            :aria-invalid="Boolean(fieldErrors.maxParticipants)"
            aria-describedby="maxParticipants-error"
          />
          <FormError v-if="fieldErrors.maxParticipants" id="maxParticipants-error">
            {{ fieldErrors.maxParticipants }}
          </FormError>
        </div>

        <div>
          <FormLabel id="audience">¿Para quién es esta ruta?</FormLabel>
          <FormSelect id="audience" v-model="form.audience" name="audience" required>
            <option v-for="audience in RIDE_AUDIENCES" :key="audience" :value="audience">
              {{ RIDE_AUDIENCE_LABELS[audience] }}
            </option>
          </FormSelect>
        </div>
      </div>
    </fieldset>

    <fieldset class="min-w-0 border-0 p-0">
      <legend :class="legendClasses">Imagen de portada</legend>

      <div class="mt-3.5">
        <FormLabel id="ride-image" :margin="false" class="sr-only">Imagen de portada</FormLabel>

        <!-- Zona de selección: el label estilizado abre el diálogo de archivos. -->
        <label
          for="ride-image"
          class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-field border border-dashed border-line-strong bg-surface/40 px-4 py-8 text-center transition-colors hover:border-graphite hover:bg-surface focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink"
        >
          <FontAwesomeIcon :icon="faImage" aria-hidden="true" class="size-5 text-graphite" />
          <span class="text-sm font-medium text-ink">Pulsa para elegir la imagen de portada</span>
          <span class="text-xs text-graphite">JPEG, PNG, WebP o AVIF. Máximo 5 MB.</span>
        </label>

        <input
          id="ride-image"
          ref="imageInput"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          aria-describedby="image-help"
          :aria-invalid="Boolean(imageError)"
          class="sr-only"
          @change="handleImageChange"
        />

        <div v-if="imagePreviewUrl || currentImageVisible" class="mt-3 flex items-center gap-3">
          <img
            :src="imagePreviewUrl || props.initialImageUrl || ''"
            alt="Vista previa de la imagen de portada"
            class="h-20 w-28 rounded-photo object-cover"
          />

          <Button type="button" variant="outline" size="sm" @click="clearSelectedImage">
            Quitar imagen
          </Button>
        </div>

        <Alert v-if="imageError" class="mt-2">
          {{ imageError }}
        </Alert>

        <FormHelp id="image-help" class="sr-only"> JPEG, PNG, WebP o AVIF. Máximo 5 MB. </FormHelp>
      </div>
    </fieldset>

    <div class="space-y-3 border-t border-line pt-5">
      <Alert v-if="summaryError" boxed role="alert">
        {{ summaryError }}
      </Alert>

      <div class="flex justify-end">
        <Button
          type="submit"
          :loading="isSubmitting"
          :disabled="isSubmitting"
          block
          class="sm:w-auto"
        >
          {{
            isSubmitting
              ? isEditMode
                ? 'Guardando…'
                : 'Publicando…'
              : isEditMode
                ? 'Guardar cambios'
                : 'Publicar ruta'
          }}
        </Button>
      </div>
    </div>
  </form>
</template>
