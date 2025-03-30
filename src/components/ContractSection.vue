<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  title: string;
  defaultOpen?: boolean;
}>();

const isOpen = ref(props.defaultOpen ?? true);

const toggle = () => {
  isOpen.value = !isOpen.value;
};
</script>

<template>
  <div class="border rounded-lg overflow-hidden mb-4">
    <button
      @click="toggle"
      class="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between text-left"
    >
      <h3 class="text-lg font-medium text-gray-900">{{ title }}</h3>
      <svg
        class="h-5 w-5 text-gray-500 transform transition-transform"
        :class="{ 'rotate-180': isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
    <div v-show="isOpen" class="px-4 py-3 bg-white">
      <slot></slot>
    </div>
  </div>
</template>