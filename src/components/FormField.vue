<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  label: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}>();

const labelClasses = computed(() => ({
  'block text-sm font-medium text-gray-700': true,
  'opacity-60': props.disabled
}));

const inputClasses = computed(() => ({
  'mt-1 block w-full rounded-md shadow-sm focus:ring-indigo-500 sm:text-sm': true,
  'border-red-300': !!props.error,
  'border-gray-300': !props.error,
  'bg-gray-100 cursor-not-allowed': props.disabled
}));
</script>

<template>
  <div>
    <label :class="labelClasses">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="mt-1">
      <slot :inputClasses="inputClasses"></slot>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>