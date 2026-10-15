
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import type {
  RideFormSubmission,
  RideFormValues,
} from '@/features/rides/types'
import type { GeocodingResult } from '@/features/rides/services/geocodingService'

import { validateRideForm } from '@/features/rides/validators/rideFormValidator'
import { useRideImagePicker } from '@/features/rides/composables/useRideImagePicker'

import MeetingPointPicker from '@/features/rides/components/MeetingPointPicker.vue'
import FormLabel from '@/components/ui/FormLabel.vue'
import Button from '@/components/ui/Button.vue'
import FormSelect from '@/components/ui/FormSelect.vue'
import Input from '@/components/ui/Input.vue'

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
      <p id="title-help" class="mt-1 text-xs text-[#6C757D]">
        Entre 5 y 100 caracteres.
      </p>
    </div>

    <div>
      <FormLabel id="description">Descripción</FormLabel>
      <textarea
        id="description"
        v-model="form.description"
        name="description"
        rows="4"
        minlength="10"
        maxlength="3000"
        required
        class="w-full rounded-2xl border border-[#DEE2E6] bg-white px-4 py-3 text-sm text-[#1A1D20] placeholder:text-[#6C757D] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
        placeholder="Describe el recorrido, el terreno y qué deben llevar los participantes..."
      />
      <p class="mt-1 text-right text-xs text-[#6C757D]">
        {{ form.description.length }}/3000
      </p>
    </div>

    <div>
      <FormLabel id="startsAt">Fecha y hora de salida</FormLabel>
      <input
        id="startsAt"
        v-model="form.startsAt"
        name="startsAt"
        type="datetime-local"
        required
        class="w-full rounded-2xl border border-[#DEE2E6] bg-white px-4 py-3 text-sm text-[#1A1D20] focus:outline-none focus:ring-2 focus:ring-[#22C55E]"
      />
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
        class="block w-full text-sm text-[#6C757D] file:mr-3 file:rounded-xl file:border-0 file:bg-[#F1F3F5] file:px-4 file:py-2 file:font-medium file:text-[#1A1D20]"
        @change="handleImageChange"
      />

      <div
        v-if="imagePreviewUrl || currentImageVisible"
        class="mt-3 flex items-center gap-3"
      >
        <img
          :src="imagePreviewUrl || props.initialImageUrl || ''"
          alt="Vista previa de la imagen de portada"
          class="h-20 w-28 rounded-2xl object-cover"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          @click="clearSelectedImage"
        >
          Quitar imagen
        </Button>
      </div>

      <p v-if="imageError" role="alert" class="mt-2 text-sm text-red-600">
        {{ imageError }}
      </p>

      <p id="image-help" class="mt-2 text-xs text-[#6C757D]">
        JPEG, PNG, WebP o AVIF. Máximo 5 MB.
      </p>
    </div>

    <div>
      <FormLabel id="meeting-point">Punto de encuentro</FormLabel>
      <MeetingPointPicker
        :initial-value="form.meetingPoint"
        @select="handlePlaceSelect"
      />

      <p v-if="form.meetingPoint" class="mt-2 text-sm text-[#6C757D]">
        Punto seleccionado: {{ form.meetingPoint }}
      </p>
    </div>

    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <div>
        <FormLabel id="bikeType">Tipo de bicicleta</FormLabel>
        <FormSelect
          id="bikeType"
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
        <FormLabel id="level">Nivel</FormLabel>
        <FormSelect id="level" v-model="form.level" name="level" required>
          <option value="Iniciación">Iniciación</option>
          <option value="Intermedio">Intermedio</option>
          <option value="Avanzado">Avanzado</option>
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
        <FormLabel id="durationMinutes">Duración estimada (min)"
        </FormLabel>
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
      <FormLabel id="wikilocUrl">Enlace de Wikiloc (opcional)</FormLabel>
      <Input
        id="wikilocUrl"
        v-model="form.wikilocUrl"
        name="wikilocUrl"
        placeholder="https://www.wikiloc.com/..."
      />
    </div>

    <p
      v-if="validationError"
      role="alert"
      class="rounded-xl bg-red-50 p-3 text-sm text-red-700"
    >
      {{ validationError }}
    </p>

    <p
      v-if="errorMessage"
      role="alert"
      class="rounded-xl bg-red-50 p-3 text-sm text-red-700"
    >
      {{ errorMessage }}
    </p>

    <Button
      type="submit"
      :loading="isSubmitting"
      :disabled="isSubmitting"
      block
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
  </form>
</template>
