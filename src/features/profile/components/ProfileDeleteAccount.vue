<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import Alert from '@/components/ui/Alert.vue'
import Button from '@/components/ui/Button.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import Typography from '@/components/ui/Typography.vue'
import { useAuthStore } from '@/features/auth/stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const isDeletingAccount = ref(false)
const isDeleteDialogOpen = ref(false)
const deleteAccountError = ref('')

function requestAccountDeletion(): void {
  if (isDeletingAccount.value) return
  deleteAccountError.value = ''
  isDeleteDialogOpen.value = true
}

function cancelAccountDeletion(): void {
  if (isDeletingAccount.value) return
  isDeleteDialogOpen.value = false
}

async function confirmAccountDeletion(): Promise<void> {
  isDeletingAccount.value = true
  deleteAccountError.value = ''

  try {
    await authStore.deleteAccount()
    isDeleteDialogOpen.value = false
    await router.replace({ name: 'home' })
  } catch {
    deleteAccountError.value = 'No se ha podido eliminar la cuenta. Inténtalo de nuevo más tarde.'
    isDeleteDialogOpen.value = false
  } finally {
    isDeletingAccount.value = false
  }
}
</script>

<template>
  <div class="mt-10 border-t border-line pt-5">
    <Typography variant="body-sm" tone="muted" class="max-w-2xl leading-6">
      Eliminar tu cuenta borra de forma permanente tu perfil y tus datos asociados. Esta acción es
      irreversible.
    </Typography>

    <div class="mt-3 flex flex-wrap items-center gap-4">
      <Button
        variant="destructive"
        size="sm"
        :loading="isDeletingAccount"
        :disabled="isDeletingAccount"
        @click="requestAccountDeletion"
      >
        {{ isDeletingAccount ? 'Eliminando cuenta…' : 'Eliminar mi cuenta' }}
      </Button>

      <Alert v-if="deleteAccountError">
        {{ deleteAccountError }}
      </Alert>
    </div>

    <ConfirmDialog
      :open="isDeleteDialogOpen"
      tone="danger"
      title="¿Eliminar tu cuenta?"
      description="Tu cuenta y tus datos asociados se eliminarán de forma permanente. Esta acción es irreversible."
      confirm-label="Eliminar mi cuenta"
      cancel-label="Cancelar"
      :is-busy="isDeletingAccount"
      @confirm="confirmAccountDeletion"
      @cancel="cancelAccountDeletion"
    />
  </div>
</template>
