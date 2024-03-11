<!--
  // v0 by Vercel.
  // https://v0.dev/t/ur4JGd1pxHo
-->
<template class="flex flex-col h-screen bg-gray-900 text-white p-4">
	<template v-if="serverItems.length > 0">
		<div class="flex flex-col w-full">
			<div class="flex w-full mb-4">
				<div class="flex-1">
					<h2 class="text-lg font-bold">Server Items</h2>
				</div>
			</div>
			<ul>
				<li v-for="item in serverItems" :key="item.key">
					<div class="flex w-full">
						<div class="flex-1">
							<p>{{ item.key }}</p>
						</div>
						<div class="flex-1">
							<p>{{ item.value }}</p>
						</div>
					</div>
				</li>
			</ul>
		</div>
	</template>
	<template v-if="logs.length > 0">
		<ul>
			<li v-for="log in logs" :key="log.formattedMessage">
				<template v-if="log.event === 'INFO'">
					<div class="text-blue-400">
						<p>{{ log.event }}: {{ log.formattedMessage }}</p>
					</div>
				</template>
				<template v-else-if="log.event === 'ACTIVE'">
					<div class="text-green-400">
						<p>{{ log.event }}: {{ log.formattedMessage }}</p>
					</div>
				</template>
				<template v-else-if="log.event === 'ERROR'">
					<div class="text-red-400">
						<p>{{ log.event }}: {{ log.formattedMessage }}</p>
					</div>
				</template>
			</li>
		</ul>
	</template>
</template>

<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { computed, onUnmounted, ref, watchEffect } from 'vue';
import { useUserStore } from '@/store';
export interface ItemData {
	fileID: string;
	jobID: string;
	outcome: number;
	status: string; // Use 'number' type for integers in TypeScript
}
const userStore = useUserStore();
const ownUser = computed(() => userStore.user);
const logs = ref<
	{
		event: string;
		formattedMessage: string;
	}[]
>([]);
const serverItems = ref<
	{
		key: string;
		value: string;
	}[]
>([]);
const {
	data: logsData,
	open: logsOpen,
	close: logsClose
} = useWebSocket(`ws://localhost:8000/logs/${ownUser.value.uuid}`, {
	autoReconnect: false
});
const {
	data: queueData,
	open: queueOpen,
	close: queueClose
} = useWebSocket(`ws://localhost:8000/queue/${ownUser.value.uuid}`, {
	autoReconnect: false
});

onUnmounted(() => {
	logsClose();
	queueClose();
});

watchEffect(() => {
	if (logsData.value) {
		try {
			const message = JSON.parse(logsData.value);
			console.log(message);
			logs.value.push({
				event: message.event,
				formattedMessage: `[${new Date().toISOString()}] ${message.event}: ${message.message}`
			});
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
