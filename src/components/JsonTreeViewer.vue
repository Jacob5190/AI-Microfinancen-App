<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps<{
  data: any;
  label?: string;
  depth?: number;
}>();

const emit = defineEmits(['node-click']);

const isExpanded = ref(true);

const isObject = computed(() => {
  return props.data !== null && typeof props.data === 'object';
});

const formattedValue = computed(() => {
  if (props.data === null) return 'null';
  if (typeof props.data === 'undefined') return 'undefined';
  if (typeof props.data === 'string') return `"${props.data}"`;
  if (typeof props.data === 'number') return props.data.toString();
  if (typeof props.data === 'boolean') return props.data.toString();
  return '';
});

const indent = computed(() => {
  return (props.depth || 0) * 20;
});

const entries = computed(() => {
  if (!isObject.value) return [];
  return Object.entries(props.data);
});

const toggleExpand = (event: Event) => {
  event.stopPropagation();
  isExpanded.value = !isExpanded.value;
};

const handleNodeClick = (event: Event) => {
  event.stopPropagation();
  emit('node-click', {
    label: props.label,
    value: props.data,
    path: props.depth ? `${props.depth}.${props.label}` : props.label
  });
};

const previewValue = computed(() => {
  if (!isObject.value) return '';
  if (Array.isArray(props.data)) {
    return `Array(${props.data.length})`;
  }
  return `{${Object.keys(props.data).length} properties}`;
});

const nodeType = computed(() => {
  if (props.data === null) return 'null';
  if (Array.isArray(props.data)) return 'array';
  return typeof props.data;
});
</script>

<template>
  <div 
    class="json-tree-node" 
    :style="{ marginLeft: `${indent}px` }"
    @click="handleNodeClick"
  >
    <div class="node-header" :class="`type-${nodeType}`">
      <button 
        v-if="isObject" 
        @click="toggleExpand"
        class="expand-button"
        type="button"
      >
        <svg
          class="h-4 w-4 transform transition-transform duration-200"
          :class="{ 'rotate-90': isExpanded }"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M7.293 4.293a1 1 0 011.414 0L14.414 10l-5.707 5.707a1 1 0 01-1.414-1.414L11.586 10 7.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
      
      <span v-if="label" class="node-label">{{ label }}</span>
      
      <span v-if="isObject" class="preview-text" :class="{ 'text-gray-400': isExpanded }">
        {{ previewValue }}
      </span>
      <span v-else class="node-value" :class="`value-${nodeType}`">
        {{ formattedValue }}
      </span>
    </div>
    
    <div v-if="isObject && isExpanded" class="node-children">
      <div v-for="[key, value] in entries" :key="key" class="node-item">
        <JsonTreeViewer
          :data="value"
          :label="key"
          :depth="(depth || 0) + 1"
          class="mt-2"
          @node-click="$emit('node-click', $event)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.json-tree-node {
  padding: 2px 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  cursor: pointer;
  transition: all 0.2s ease;
}

.json-tree-node:hover > .node-header {
  background-color: rgba(99, 102, 241, 0.05);
  border-radius: 4px;
}

.node-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.expand-button {
  padding: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  color: #6366f1;
  transition: all 0.2s ease;
}

.expand-button:hover {
  background-color: rgba(99, 102, 241, 0.1);
}

.node-label {
  color: #4f46e5;
  font-weight: 600;
  position: relative;
}

.node-label::after {
  content: ':';
  color: #6b7280;
  margin-left: 2px;
}

.node-value {
  color: #1f2937;
  font-weight: 500;
}

.preview-text {
  color: #6b7280;
  font-style: italic;
  font-size: 0.9em;
}

.node-children {
  border-left: 2px solid #e5e7eb;
  margin-left: 10px;
  padding-left: 12px;
  transition: all 0.2s ease;
}

.node-item {
  position: relative;
}

.node-item::before {
  content: '';
  position: absolute;
  left: -14px;
  top: 50%;
  width: 12px;
  height: 2px;
  background-color: #e5e7eb;
  transition: background-color 0.2s ease;
}

/* Type-specific styling */
.type-string .node-value { color: #16a34a; }
.type-number .node-value { color: #2563eb; }
.type-boolean .node-value { color: #7c3aed; }
.type-null .node-value { color: #dc2626; }
.type-object .preview-text { color: #6b7280; }
.type-array .preview-text { color: #9333ea; }

/* Hover effects */
.node-item:hover::before {
  background-color: #6366f1;
}

.json-tree-node:hover > .node-children {
  border-left-color: #6366f1;
}

/* Animation for expand/collapse */
.node-children {
  transition: all 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

.node-children {
  animation: fadeIn 0.3s ease-in-out;
}
</style>