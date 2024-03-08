<!--
  // v0 by Vercel.
  // https://v0.dev/t/ur4JGd1pxHo
-->
<template class="flex flex-col h-screen bg-gray-900 text-white p-4">
	<header class="flex items-center justify-between mb-4">
		<button
			type="button"
			class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 text-white border-white"
		>
			Clear Logs
		</button>
	</header>
	<section class="flex-1 overflow-auto">
		<div class="text-green-400"><p>[2024-03-04 14:30:00] INFO: Server started successfully.</p></div>
		<div class="text-blue-400"><p>[2024-03-04 14:32:15] WARNING: High memory usage detected.</p></div>
		<div class="text-red-400"><p>[2024-03-04 14:35:30] ERROR: Connection to database lost.</p></div>
	</section>
</template>

<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { computed, onMounted, onUnmounted, watchEffect } from 'vue';
import { useUserStore } from '@/store';
const userStore = useUserStore();
const ownUser = computed(() => userStore.user);
const {
	data: logsData,
	open: logsOpen,
	close: logsClose
} = useWebSocket(`ws://localhost:8000/logs/${ownUser.value.uuid}`);
const {
	data: queueData,
	open: queueOpen,
	close: queueClose
} = useWebSocket(`ws://localhost:8000/queue/${ownUser.value.uuid}`);
onMounted(() => {
	logsOpen();
	queueOpen();
});

onUnmounted(() => {
	logsClose();
	queueClose();
});

watchEffect(() => {
	if (logsData.value) {
		try {
			const message = JSON.parse(logsData.value);
			// example response: { event: 'INFO', message: 'Server started successfully.'}
			// on INFO -> <div class="text-blue-400"><p>[2024-03-04 14:32:15] INFO: MESSAGE</p></div>
			// on ACTIVE -> <div class="text-green-400"><p>[2024-03-04 14:30:00] INFO: MESSAGE</p></div>
			// on ERROR -> <div class="text-red-400"><p>[2024-03-04 14:35:30] ERROR: MESSAGE</p></div>
			console.log(message);
		} catch (error) {
			console.error(error);
		}
	}

	if (queueData.value) {
		try {
			const message = JSON.parse(queueData.value);
			console.log(message);
		} catch (error) {
			console.error(error);
		}
	}
});
</script>
