<script setup lang="ts">
import AppHeader from '@/components/AppHeader.vue'
import ToastContainer from '@/components/ToastContainer.vue'
import { useTheme } from '@/composables'

useTheme()
</script>

<template>
  <AppHeader />
  <RouterView />
  <ToastContainer />
</template>
