<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import type { RideFormSubmission, RideFormValues } from '@/features/rides/types'
import type { GeocodingResult } from '@/features/rides/services/geocodingService'

import { validateRideForm } from '@/features/rides/validators/rideFormValidator'
import { useRideImagePicker } from '@/features/rides/composables/useRideImagePicker'

import MeetingPointPicker from '@/features/rides/components/MeetingPointPicker.vue'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import FormHelp from '@/components/ui/FormHelp.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import Input from '@/components/ui/Input.vue'
import Textarea from '@/components/ui/Textarea.vue'
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

const form = reactive<RideFormValues>({
  ...props.initialValues,
})

const validationError = ref<string | null>(null)

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
    validationError.value = null
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

  validationError.value = null

  if (imageError.value) {
    validationError.value = imageError.value
    return
  }

  validationError.value = validateRideForm(form, selectedImage.value)

  if (validationError.value) return

  emit('submit', {
    values: { ...form },
    image: selectedImage.value,
    removeCurrentImage: removeCurrentImage.value,
  })
}
</script>

<template>
  <form novalidate class="space-y-6" @submit.prevent="handleSubmit">
    <Alert v-if="validationError" boxed>
      {{ validationError }}
    </Alert>

    <Alert v-if="errorMessage" boxed>
      {{ errorMessage }}
    </Alert>

    <div>
      <FormLabel id="title">Nombre de la ruta</FormLabel>
      <Input
        id="title"
        v-model="form.title"
        name="title"
        placeholder="Ej. Vuelta por Collserola"
        required
        maxlength="100"
        aria-describedby="title-help"
      />
      <FormHelp id="title-help">Entre 5 y 100 caracteres.</FormHelp>
    </div>

    <div>
      <FormLabel id="description">Descripción</FormLabel>
      <Textarea
        id="description"
        v-model="form.description"
        name="description"
        :rows="4"
        :minlength="10"
        :maxlength="3000"
        required
        placeholder="Describe el recorrido, el terreno y qué deben llevar los participantes..."
      />
      <p class="mt-1 text-right text-xs text-graphite">{{ form.description.length }}/3000</p>
    </div>

    <div>
      <FormLabel id="startsAt">Fecha y hora de salida</FormLabel>
      <Input id="startsAt" v-model="form.startsAt" name="startsAt" type="datetime-local" required />
    </div>

    <div>
      <FormLabel id="ride-image">Imagen de portada</FormLabel>

      <input
        id="ride-image"
        ref="imageInput"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        aria-describedby="image-help"
        :aria-invalid="Boolean(imageError)"
        class="block w-full text-sm text-graphite file:mr-3 file:rounded-btn file:border-0 file:bg-surface file:px-4 file:py-2 file:font-medium file:text-ink"
        @change="handleImageChange"
      />

      <div v-if="imagePreviewUrl || currentImageVisible" class="mt-3 flex items-center gap-3">
        <img
          :src="imagePreviewUrl || props.initialImageUrl || ''"
          alt="Vista previa de la imagen de portada"
          class="h-20 w-28 rounded-btn object-cover"
        />

        <Button type="button" variant="outline" size="sm" @click="clearSelectedImage">
          Quitar imagen
        </Button>
      </div>

      <Alert v-if="imageError" class="mt-2">
        {{ imageError }}
      </Alert>

      <FormHelp id="image-help">JPEG, PNG, WebP o AVIF. Máximo 5 MB.</FormHelp>
    </div>

    <div>
      <MeetingPointPicker :initial-value="form.meetingPoint" @select="handlePlaceSelect" />

      <FormHelp v-if="form.meetingPoint"> Punto seleccionado: {{ form.meetingPoint }} </FormHelp>
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
        <FormLabel id="distanceKm">Distancia (km)</FormLabel>
        <Input
          id="distanceKm"
          v-model="form.distanceKm"
          name="distanceKm"
          inputmode="decimal"
          placeholder="30"
          required
        />
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
        />
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
        />
      </div>

      <div>
        <FormLabel id="maxParticipants">Máximo de participantes</FormLabel>
        <Input
          id="maxParticipants"
          v-model="form.maxParticipants"
          name="maxParticipants"
          inputmode="numeric"
          placeholder="Sin límite"
        />
      </div>
    </div>

    <div>
      <FormLabel id="audience">¿Para quién es esta ruta?</FormLabel>
      <FormSelect id="audience" v-model="form.audience" name="audience" required>
        <option v-for="audience in RIDE_AUDIENCES" :key="audience" :value="audience">
          {{ RIDE_AUDIENCE_LABELS[audience] }}
        </option>
      </FormSelect>
    </div>

    <div>
      <FormLabel id="wikilocUrl">Enlace de Wikiloc (opcional)</FormLabel>
      <Input
        id="wikilocUrl"
        v-model="form.wikilocUrl"
        name="wikilocUrl"
        placeholder="https://www.wikiloc.com/..."
      />
    </div>

    <Button type="submit" :loading="isSubmitting" :disabled="isSubmitting" block>
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
  </form>
</template>
