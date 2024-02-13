<template>
	<Dialog :open="Props.isDialogOpen" @update:open="onOpen">
		<DialogContent
			class="max-w-[calc(100vw-8rem)] mobile:max-w-[calc(100vw-2rem)] mobile:h-[calc(100vh-4rem)] h-[calc(100vh-8rem)] min-h-40 duration-100 !w-max"
		>
			<div class="grid grid-cols-[1fr,400px] gap-4">
				<!-- File information panel -->
				<ScrollArea
					class="max-w-[400px] h-[calc(100vh-11rem)] mobile:max-w-[calc(100vw-7rem)] mobile:h-[calc(100vh-7rem)] min-h-32"
				>
					<div class="flex flex-col mobile:max-w-[calc(100vw-7rem)]">
						<!-- User information section -->
					</div>
				</ScrollArea>
				<!-- File information panel -->
			</div>
		</DialogContent>
	</Dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

// Define props
const Props = defineProps({
	isDialogOpen: Boolean
});

// Define emits
const emit = defineEmits(['update:isDialogOpen']);

// Use the prop in the onOpen method
const onOpen = async (isOpen: boolean) => {
	if (!isOpen) return;
	emit('update:isDialogOpen', isOpen);
};
</script>
