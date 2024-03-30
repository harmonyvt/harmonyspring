<template>
	<ContextMenuRoot>
		<ContextMenuTrigger>
			<!-- slots -->
			<Slots />
		</ContextMenuTrigger>
	</ContextMenuRoot>
	<ContextMenuPortal>
		
	</ContextMenuPortal>
</template>

<script setup lang="ts">
import {
	ContextMenuCheckboxItem,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuItemIndicator,
	ContextMenuLabel,
	ContextMenuPortal,
	ContextMenuRadioGroup,
	ContextMenuRadioItem,
	ContextMenuRoot,
	ContextMenuSeparator,
	ContextMenuSub,
	ContextMenuSubContent,
	ContextMenuSubTrigger,
	ContextMenuTrigger
} from 'radix-vue';
import { Slots } from 'vue';
</script>
