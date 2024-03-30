<template>
	<ContextMenuRoot>
		<ContextMenuTrigger v-if="hasDefaultSlot">
			<slot />
		</ContextMenuTrigger>
		<ContextMenuPortal>
			<ContextMenuContent
				class="min-w-[220px] z-30 bg-gray-800 text-white rounded-md p-4 shadow-lg"
				:side-offset="5"
				><ContextMenuLabel class="text-l">{{ input.file.name }}</ContextMenuLabel>
				<ContextMenuItem class="py-2 px-4 hover:bg-gray-600 rounded-sm bg-gray-700" @click="handleClick">
					<ContextMenuLabel>:3</ContextMenuLabel>
				</ContextMenuItem>
				<ContextMenuCheckboxItem class="py-2 px-4 hover:bg-gray-700">
					<ContextMenuLabel>Checkbox Item</ContextMenuLabel>
					<ContextMenuItemIndicator />
				</ContextMenuCheckboxItem>
			</ContextMenuContent>
		</ContextMenuPortal>
	</ContextMenuRoot>
</template>

<script setup lang="ts">
import {
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuItemIndicator,
	ContextMenuLabel,
	ContextMenuPortal,
	ContextMenuRoot,
	ContextMenuTrigger
} from 'radix-vue';
import { computed, useSlots, defineProps } from 'vue';
import { FileWithAdditionalData } from '@/types';
const input = defineProps<{
	file: FileWithAdditionalData;
}>();
const slots = useSlots();
const hasDefaultSlot = computed(() => Boolean(slots.default));
const handleClick = () => {
	console.log('Item 1 clicked');
};
</script>
