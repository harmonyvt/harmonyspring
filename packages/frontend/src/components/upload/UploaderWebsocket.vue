<template>
	<div
		class="flex w-full mt-16 flex-col rounded-md bg-[#181a1b] border-4 shadow-lg border-[#303436] items-center justify-center p-4 py-8 max-w-4xl"
	>
		<div class="container px-1 md:px-6 max-w-3xl">
			<div class="grid gap-4">
				<template v-if="items.length > 0">
					<h1 class="text-2xl font-bold tracking-tight text-white">Job List</h1>
					<div
						v-for="item in items"
						:key="item.jobID"
						class="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-800"
					>
						<div class="grid gap-2 p-4 dark:bg-gray-800">
							<div class="flex items-center gap-4">
								<template v-if="item.event === 'InProgress'">
									<ActivityIcon class="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
								</template>
								<template v-else-if="item.event === 'Error'">
									<BugIcon class="w-6 h-6 text-red-500 dark:text-red-400" />
								</template>
								<template v-else-if="item.event === 'Finish'">
									<GoalIcon class="w-6 h-6 text-green-500 dark:text-green-400" />
								</template>
								<div class="grid gap-1">
									<h3 class="font-semibold text-lg text-white">
										{{ item.message }}
									</h3>
									<p class="text-sm text-gray-500 dark:text-gray-400">
										{{ item.jobID }} - {{ item.date }} - {{ item.event }}
									</p>
								</div>
							</div>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { ActivityIcon, GoalIcon, BugIcon} from 'lucide-vue-next';
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

const {
	data: jobsData,
	close: jobsClose
} = useWebSocket(`ws://localhost:8000/queue/${ownUser.value.uuid}`, {
	autoReconnect: false
});

const items = ref<Item[]>([]);

export interface Message {
	items: Item[];
}

export interface Item {
	jobID: string;
	event: string;
	message: string;
	date: string;
}

onUnmounted(() => {
	// logsClose();
	jobsClose();
});

watchEffect(() => {
	if (jobsData.value) {
		try {
			const message = JSON.parse(jobsData.value) as Message;
			console.log(message);
			items.value = message.items;
			console.log(items);
		} catch (error) {
			console.error(error);
		}
	}
});
</script>
