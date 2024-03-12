<template>
	<div class="flex w-full mt-16 flex-col rounded-md items-center justify-center p-4 py-8 max-w-4xl">
		<div class="container px-1 md:px-6 max-w-3xl">
			<div class="grid gap-4">
				<template v-if="items.length > 0">
					<div
						v-for="item in items"
						:key="item.jobID"
						class="border border-gray-600 rounded-lg p-4 dark:bg-gray-800"
					>
						<div class="flex justify-between">
							<a
								:href="item.fileURL"
								class="link cursor-pointer"
								rel="noopener noreferrer"
								target="_blank"
							>
								<div class="flex gap-4">
									<template v-if="item.event === 'InProgress'">
										<ActivityIcon class="w-6 h-6 text-yellow-500" />
									</template>
									<template v-else-if="item.event === 'Error'">
										<BugIcon class="w-6 h-6 text-red-500" />
									</template>
									<template v-else-if="item.event === 'Finish'">
										<GoalIcon class="w-6 h-6 text-green-500" />
									</template>
									<div class="grid gap-1">
										<h3 class="text-lg font-semibold text-white">
											{{ item.message }}
										</h3>
										<p class="text-sm text-gray-400">
											Job ID: {{ item.jobID }} | Event: {{ item.event }} | File:
											{{ item.fileID ?? 'N/A' }}
										</p>
									</div>
								</div>
							</a>
							<Button
								className="text-white border-gray-600 hover:border-red-500 hover:text-red-500"
								variant="outline"
								@click="removeJob(item.jobID)"
							>
								Remove
							</Button>
						</div>
					</div>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useWebSocket } from '@vueuse/core';
import { ActivityIcon, GoalIcon, BugIcon } from 'lucide-vue-next';
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
	data: jobData,
	send: jobSend,
	close: jobClose
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
	date: Date;
	fileID: string;
	fileURL: string;
}

onUnmounted(() => {
	jobClose();
});

watchEffect(() => {
	if (jobData.value) {
		try {
			const message = JSON.parse(jobData.value) as Message;
			console.log(message);
			items.value = message.items;
			console.log(items);
		} catch (error) {
			console.error(error);
		}
	}
});

const removeJob = async (itemID: string) => {
	console.log('Removing job:', itemID);
	jobSend(JSON.stringify({ action: 'remove', itemID }));
};
</script>
