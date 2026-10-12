import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/services/supabase'
import { requestAccountDeletion } from '../services/authService'

type AuthSubscription = ReturnType<typeof supabase.auth.onAuthStateChange>['data']['subscription']

export const useAuthStore = defineStore('auth', () => {
  const session = ref<Session | null>(null)
  const user = ref<User | null>(null)
  const isInitialized = ref(false)
  const isRecoverySession = ref(false)

  let authSubscription: AuthSubscription | null = null
  let initializationPromise: Promise<void> | null = null

  async function initialize(): Promise<void> {
    if (isInitialized.value) return
    if (initializationPromise) return initializationPromise

    initializationPromise = initializeSession()

    try {
      await initializationPromise
    } finally {
      initializationPromise = null
    }
  }

  async function initializeSession(): Promise<void> {
    const { data, error } = await supabase.auth.getSession()

    if (error) throw error

    session.value = data.session
    user.value = data.session?.user ?? null

    const { data: authData } = supabase.auth.onAuthStateChange((event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null

      if (event === 'PASSWORD_RECOVERY') {
        isRecoverySession.value = true
      }

      if (event === 'SIGNED_OUT') {
        isRecoverySession.value = false
      }
    })

    authSubscription = authData.subscription
    isInitialized.value = true
  }

  async function logout(): Promise<void> {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    // Sincronizamos explícitamente el estado de Pinia.
    session.value = null
    user.value = null
    isRecoverySession.value = false
  }

  async function deleteAccount(): Promise<void> {
    await requestAccountDeletion()

    try {
      await supabase.auth.signOut({ scope: 'local' })
    } finally {
      session.value = null
      user.value = null
      isRecoverySession.value = false
    }
  }
  function markRecoverySession(): void {
    isRecoverySession.value = true
  }
  function clearRecoverySession(): void {
    isRecoverySession.value = false
  }
  function stopListening(): void {
    authSubscription?.unsubscribe()
    authSubscription = null
    isInitialized.value = false
  }

  return {
    session,
    user,
    isInitialized,
    isRecoverySession,
    initialize,
    logout,
    deleteAccount,
    markRecoverySession,
    stopListening,
    clearRecoverySession,
  }
})
