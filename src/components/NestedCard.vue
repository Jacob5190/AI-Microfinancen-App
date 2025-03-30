<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  title: string;
  data: any;
  depth?: number;
  path?: string[];
}>();

const emit = defineEmits(['leaf-click']);

const isExpanded = ref(true);

const currentDepth = computed(() => props.depth || 0);
const currentPath = computed(() => props.path || []);
const isObject = computed(() => props.data !== null && typeof props.data === 'object');

const formatValue = (value: any): string => {
  if (value === null) return 'Not specified';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') {
    if (value >= 0 && value <= 1) return `${(value * 100).toFixed(2)}%`;
    return value.toLocaleString();
  }
  return value.toString();
};

const entries = computed(() => {
  if (!isObject.value) return [];
  return Object.entries(props.data).map(([key, value]) => ({
    key: key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    originalKey: key,
    value
  }));
});

const cardStyle = computed(() => {
  const colors = [
    'bg-white',
    'bg-indigo-50',
    'bg-purple-50',
    'bg-blue-50'
  ];
  return colors[currentDepth.value % colors.length];
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

const handleLeafClick = (entry: { key: string; value: any; originalKey: string }) => {
  emit('leaf-click', {
    key: entry.key,
    value: entry.value,
    path: [...currentPath.value, entry.originalKey]
  });
};

// Handle click on the title when it's a leaf node
const handleTitleClick = (event: Event) => {
  if (!isObject.value) {
    event.stopPropagation();
    emit('leaf-click', {
      key: props.title,
      value: props.data,
      path: currentPath.value
    });
  }
};
</script>

<template>
  <div 
    class="rounded-lg overflow-hidden transition-all duration-300"
    :class="[cardStyle, { 'shadow-md': currentDepth > 0 }]"
  >
    <div 
      class="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-white/50 transition-all duration-200"
      @click="isObject ? toggleExpand() : handleTitleClick($event)"
    >
      <h3 
        class="text-lg font-medium text-gray-800"
      >
        {{ title }}
      </h3>
      <div class="flex items-center gap-2">
        <span v-if="!isObject" class="text-gray-900">{{ formatValue(props.data) }}</span>
        <svg
          v-if="isObject"
          class="h-5 w-5 text-gray-500 transform transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
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
      </div>
    </div>

    <div 
      v-show="isExpanded"
      class="px-4 pb-4"
    >
      <div v-if="isObject" class="space-y-4">
        <div 
          v-for="entry in entries" 
          :key="entry.key"
          class="nested-card-content"
        >
          <template v-if="typeof entry.value === 'object' && entry.value !== null">
            <NestedCard
              :title="entry.key"
              :data="entry.value"
              :depth="currentDepth + 1"
              :path="[...currentPath, entry.originalKey]"
              class="mt-2"
              @leaf-click="$emit('leaf-click', $event)"
            />
          </template>
          <template v-else>
            <div 
              class="flex justify-between items-center py-2 px-3 rounded-md hover:bg-white/50 cursor-pointer transition-all duration-200"
              @click.stop="handleLeafClick(entry)"
            >
              <span class="text-gray-700 font-medium">{{ entry.key }}</span>
              <span class="text-gray-900">{{ formatValue(entry.value) }}</span>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nested-card-content {
  @apply transition-all duration-300;
}

.nested-card-content:hover {
  @apply transform translate-x-1;
}
</style>