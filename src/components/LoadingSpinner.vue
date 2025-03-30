<script setup lang="ts">
const props = defineProps<{
  size?: 'sm' | 'md' | 'lg';
}>();

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12'
};

const spinnerSize = sizeClasses[props.size || 'md'];
</script>

<template>
  <div class="flex justify-center items-center">
    <div :class="['animate-spin rounded-full border-b-2 border-indigo-600', spinnerSize]"></div>
  </div>
</template>