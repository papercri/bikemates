<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Alert from '@/components/ui/Alert.vue'
import BikeLoader from '@/components/ui/BikeLoader.vue'
import Button from '@/components/ui/Button.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'
import ProfileAvatarField from '@/features/profile/components/ProfileAvatarField.vue'
import ProfileDeleteAccount from '@/features/profile/components/ProfileDeleteAccount.vue'
import ProfileNameForm from '@/features/profile/components/ProfileNameForm.vue'
import ProfilePasswordForm from '@/features/profile/components/ProfilePasswordForm.vue'
import { useProfile } from '@/features/profile/composables/useProfile'
import type { Profile } from '@/features/profile/types'

const { profile, isLoading, errorMessage, loadProfile } = useProfile()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

function applyUpdate(updated: Profile): void {
  profile.value = updated
}

/** Filete que encabeza cada bloque, en la voz editorial del resto de la app. */
const sectionTitleClasses =
  'w-full border-b border-line pb-2 font-mono text-xs font-semibold tracking-[0.18em] text-graphite uppercase'
</script>

<template>
  <div>
    <Typography as="h2" variant="heading-sm">Mis datos</Typography>

    <BikeLoader v-if="isLoading" class="mt-4" label="Cargando tu perfil…" />

    <div v-else-if="errorMessage" class="mt-4">
      <Alert boxed>
        {{ errorMessage }}
      </Alert>

      <Button class="mt-3" variant="outline" @click="loadProfile">Reintentar</Button>
    </div>

    <template v-else-if="profile">
      <!-- En desktop la sección se abre en dos columnas: identidad (foto + correo) a la
           izquierda, formularios editables (nombre + contraseña) a la derecha. -->
      <div class="mt-6 grid gap-x-12 gap-y-8 md:grid-cols-2 md:items-start">
        <section class="md:col-start-1 md:row-start-1" aria-labelledby="profile-photo-title">
          <h3 id="profile-photo-title" :class="sectionTitleClasses">Foto de perfil</h3>

          <ProfileAvatarField
            class="mt-3.5"
            :avatar-url="profile.avatarUrl"
            :display-name="profile.displayName"
            @updated="applyUpdate"
          />
        </section>

        <section class="md:col-start-2 md:row-start-1" aria-labelledby="profile-name-title">
          <h3 id="profile-name-title" :class="sectionTitleClasses">Nombre</h3>

          <ProfileNameForm :display-name="profile.displayName" @updated="applyUpdate" />
        </section>

        <section class="md:col-start-1 md:row-start-2" aria-labelledby="profile-email-title">
          <h3 id="profile-email-title" :class="sectionTitleClasses">Correo electrónico</h3>

          <p class="mt-3.5 max-w-md text-sm text-ink">
            {{ user?.email }}
          </p>

          <p class="mt-1 text-xs text-graphite">
            El correo de la cuenta no se puede cambiar desde aquí.
          </p>
        </section>

        <section class="md:col-start-2 md:row-start-2" aria-labelledby="profile-password-title">
          <h3 id="profile-password-title" :class="sectionTitleClasses">Contraseña</h3>

          <ProfilePasswordForm />
        </section>
      </div>

      <ProfileDeleteAccount />
    </template>
  </div>
</template>
