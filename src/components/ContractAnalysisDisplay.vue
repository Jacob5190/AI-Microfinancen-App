<script setup lang="ts">
import { computed } from 'vue';
import NestedCard from './NestedCard.vue';

const props = defineProps<{
  analysis: any;
}>();

const emit = defineEmits(['leaf-click']);

const formatTitle = (key: string): string => {
  return key.split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const sections = computed(() => {
  return Object.entries(props.analysis).map(([key, value]) => ({
    title: formatTitle(key),
    key,
    value
  }));
});

const handleLeafClick = (data: { key: string; value: any; path: string[] }) => {
  emit('leaf-click', data);
};
</script>

<template>
  <div class="space-y-6">
    <div v-for="section in sections" :key="section.key">
      <NestedCard 
        :title="section.title"
        :data="section.value"
        :path="[section.key]"
        class="shadow-lg"
        @leaf-click="handleLeafClick"
      />
    </div>
  </div>
</template>