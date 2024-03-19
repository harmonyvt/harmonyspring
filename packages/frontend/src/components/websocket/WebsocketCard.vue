<template>
	<div class="dark">
		<!-- Active Job Card -->
		<div
			class="rounded-lg bg-card text-card-foreground shadow-sm border-4 border-[#008000] dark:border-[#008000]"
			data-v0-t="card"
		>
			<div class="space-y-1.5 p-6 flex flex-row items-center">
				<ArrowRightCircle class="w-6 h-6 text-[#008000] dark:text-[#008000]" />
				<div class="grid gap-1.5 ml-4">
					<h3 class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">Job Title</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Active</p>
				</div>
			</div>
			<div class="p-6 grid gap-2">
				<div class="flex items-center gap-2">
					<Clock class="w-5 h-5 text-gray-500 dark:text-gray-400" />
					<span class="text-sm text-gray-500 dark:text-gray-400">Last updated: 2 hours ago</span>
				</div>
				<div class="flex items-center gap-2">
					<User class="w-5 h-5 text-gray-500 dark:text-gray-400" />
					<span class="text-sm text-gray-500 dark:text-gray-400">Owner: John Doe</span>
				</div>
			</div>
		</div>

		<!-- Completed Job Card -->
		<div
			class="rounded-lg bg-card text-card-foreground shadow-sm border-4 border-[#008000] dark:border-[#008000]"
			data-v0-t="card"
		>
			<div class="space-y-1.5 p-6 flex flex-row items-center">
				<ArrowRightCircle class="w-6 h-6 text-[#008000] dark:text-[#008000]" />
				<div class="grid gap-1.5 ml-4">
					<h3 class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">Job Title</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Completed</p>
				</div>
			</div>
			<div class="p-6 grid gap-2">
				<div class="flex items-center gap-2">
					<Clock class="w-5 h-5 text-gray-500 dark:text-gray-400" />
					<span class="text-sm text-gray-500 dark:text-gray-400">Last updated: 2 hours ago</span>
				</div>
				<div class="flex items-center gap-2">
					<User class="w-5 h-5 text-gray-500 dark:text-gray-400" />
					<span class="text-sm text-gray-500 dark:text-gray-400">Owner: John Doe</span>
				</div>
			</div>
		</div>

		<!-- Failed Job Card -->
		<div
			class="rounded-lg bg-card text-card-foreground shadow-sm border-4 border-[#FF0000] dark:border-[#FF0000]"
			data-v0-t="card"
		>
			<div class="space-y-1.5 p-6 flex flex-row items-center">
				<ArrowRightCircle class="w-6 h-6 text-[#FF0000] dark:text-[#FF0000]" />
				<div class="grid gap-1.5 ml-4">
					<h3 class="text-2xl font-semibold whitespace-nowrap leading-none tracking-tight">Job Title</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400">Failed</p>
				</div>
			</div>
			<div class="p-6 grid gap-2">
				<div class="flex items-center gap-2">
					<Clock class="w-5 h-5 text-gray-500 dark:text-gray-400" />
					<span class="text-sm text-gray-500 dark:text-gray-400">Last updated: 2 hours ago</span>
				</div>
				<div class="flex items-center gap-2">
					<User class="w-5 h-5 text-gray-500 dark:text-gray-400" />
					<span class="text-sm text-gray-500 dark:text-gray-400">Owner: John Doe</span>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ArrowRightCircle, Clock, User } from 'lucide-vue-next';
</script>
