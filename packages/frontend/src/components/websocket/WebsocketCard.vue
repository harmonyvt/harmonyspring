<template>
	<div class="dark">
		<!-- Active Job Card -->
		<template v-if="input.Item.status === JobStatus.Active">
			<div
				class="rounded-lg bg-card text-card-foreground shadow-sm border-4 border-[#008000] dark:border-[#008000]"
				data-v0-t="card"
			>
				<div class="space-y-1.5 p-6 flex flex-row items-center">
					<ArrowRightCircle class="w-6 h-6 text-[#008000] dark:text-[#008000]" />
					<div class="grid gap-1.5 ml-4">
						<h3 class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">
							{{ input.Item.title }}
						</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">Active</p>
					</div>
				</div>
				<div class="p-6 grid gap-2">
					<div class="flex items-center gap-2">
						<Clock class="w-5 h-5 text-gray-500 dark:text-gray-400" />
						<span class="text-sm text-gray-500 dark:text-gray-400">{{ input.Item.lastUpdate }}</span>
					</div>
					<div class="flex items-center gap-2">
						<User class="w-5 h-5 text-gray-500 dark:text-gray-400" />
						<span class="text-sm text-gray-500 dark:text-gray-400">Owner: {{ input.Item.owner }}</span>
					</div>
				</div>
			</div>
		</template>

		<!-- Completed Job Card -->
		<template v-if="input.Item.status === JobStatus.Completed">
			<div
				class="rounded-lg bg-card text-card-foreground shadow-sm border-4 border-[#008000] dark:border-[#008000]"
				data-v0-t="card"
			>
				<div class="space-y-1.5 p-6 flex flex-row items-center">
					<ArrowRightCircle class="w-6 h-6 text-[#008000] dark:text-[#008000]" />
					<div class="grid gap-1.5 ml-4">
						<h3 class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">
							{{ input.Item.title }}
						</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">Completed</p>
					</div>
				</div>
				<div class="p-6 grid gap-2">
					<div class="flex items-center gap-2">
						<Clock class="w-5 h-5 text-gray-500 dark:text-gray-400" />
						<span class="text-sm text-gray-500 dark:text-gray-400">{{ input.Item.lastUpdate }}</span>
					</div>
					<div class="flex items-center gap-2">
						<User class="w-5 h-5 text-gray-500 dark:text-gray-400" />
						<span class="text-sm text-gray-500 dark:text-gray-400">Owner: {{ input.Item.owner }}</span>
					</div>
				</div>
			</div>
		</template>

		<!-- Failed Job Card -->
		<template v-if="input.Item.status === JobStatus.Failed">
			<div
				class="rounded-lg bg-card text-card-foreground shadow-sm border-4 border-[#FF0000] dark:border-[#FF0000]"
				data-v0-t="card"
			>
				<div class="space-y-1.5 p-6 flex flex-row items-center">
					<ArrowRightCircle class="w-6 h-6 text-[#FF0000] dark:text-[#FF0000]" />
					<div class="grid gap-1.5 ml-4">
						<h3 class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">
							{{ input.Item.title }}
						</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">Failed</p>
					</div>
				</div>
				<div class="p-6 grid gap-2">
					<div class="flex items-center gap-2">
						<Clock class="w-5 h-5 text-gray-500 dark:text-gray-400" />
						<span class="text-sm text-gray-500 dark:text-gray-400">{{ input.Item.lastUpdate }}</span>
					</div>
					<div class="flex items-center gap-2">
						<User class="w-5 h-5 text-gray-500 dark:text-gray-400" />
						<span class="text-sm text-gray-500 dark:text-gray-400">Owner: {{ input.Item.owner }}</span>
					</div>
				</div>
			</div>
		</template>

		<!-- Progress Job Card -->
		<template v-if="input.Item.status === JobStatus.Progress">
			<div
				class="rounded-lg bg-card text-card-foreground shadow-sm border-4 border-[#00e1ff] dark:border-[#00e1ff]"
				data-v0-t="card"
			>
				<div class="space-y-1.5 p-6 flex flex-row items-center">
					<ArrowRightCircle class="w-6 h-6 text-[#00e1ff] dark:text-[#00e1ff]" />
					<div class="grid gap-1.5 ml-4">
						<h3 class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">
							{{ input.Item.title }}
						</h3>
						<p class="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
					</div>
				</div>
				<div class="p-6 grid gap-2">
					<div class="flex items-center gap-2">
						<Clock class="w-5 h-5 text-gray-500 dark:text-gray-400" />
						<span class="text-sm text-gray-500 dark:text-gray-400">{{ input.Item.lastUpdate }}</span>
					</div>
					<div class="flex items-center gap-2">
						<User class="w-5 h-5 text-gray-500 dark:text-gray-400" />
						<span class="text-sm text-gray-500 dark:text-gray-400">Owner: {{ input.Item.owner }}</span>
					</div>
				</div>
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
import { JobItem, JobStatus } from '@harmonyspring/helpers';
import { ArrowRightCircle, Clock, User } from 'lucide-vue-next';
import { defineProps, onMounted } from 'vue';
// Define the props
const input = defineProps<{
	Item: JobItem;
}>();

onMounted(() => {
	console.log(input.Item);
});
</script>
