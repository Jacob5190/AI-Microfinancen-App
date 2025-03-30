<script setup lang="ts">
const props = defineProps<{
  type: 'success' | 'error';
  message: string;
  dismissible?: boolean;
}>();

const emit = defineEmits(['dismiss']);

const alertClasses = {
  success: 'bg-green-50 text-green-800 border-green-400',
  error: 'bg-red-50 text-red-800 border-red-400'
};

const iconClasses = {
  success: 'text-green-400',
  error: 'text-red-400'
};

const successIcon = 'M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z';
const errorIcon = 'M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z';
const closeIcon = 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z';
</script>

<template>
  <div v-if="message" :class="['border px-4 py-3 rounded relative', alertClasses[type]]">
    <div class="flex">
      <div class="flex-shrink-0">
        <svg
          class="h-5 w-5"
          :class="iconClasses[type]"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            :d="type === 'success' ? successIcon : errorIcon"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <div class="ml-3">
        <p class="text-sm">{{ message }}</p>
      </div>
      <button
        v-if="dismissible"
        @click="emit('dismiss')"
        class="ml-auto -mx-1.5 -my-1.5 rounded-lg focus:ring-2 focus:ring-indigo-500 p-1.5 inline-flex h-8 w-8"
        :class="iconClasses[type]"
      >
        <span class="sr-only">Dismiss</span>
        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            :d="closeIcon"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
</template>