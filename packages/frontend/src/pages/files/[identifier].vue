<template>
	<div v-if="loading">Loading...</div>
	<template v-else>
		<div class="flex flex-col lg:flex-row h-screen bg-gray-100 dark:bg-gray-900 relative">
			<div
				:class="isSidePanelVisible ? 'lg:w-3/4 w-full h-1/2 lg:h-full' : 'w-full h-full'"
				class="bg-gray-200 rounded-lg overflow-hidden dark:bg-gray-800"
			>
				<Button
					v-if="!isSidePanelVisible"
					class="absolute top-0 right-0 m-4"
					@click="isSidePanelVisible = true"
				>
					Show
				</Button>
				<template v-if="fileInfo.type.startsWith('image')">
					<img :src="fileInfo.url" :alt="fileInfo.name" class="w-full h-full object-contain object-center" />
				</template>
				<template v-else-if="fileInfo.type.startsWith('video')">
					<video :src="fileInfo.url" :alt="fileInfo.name" class="w-full h-full" controls></video>
				</template>
				<template v-else-if="fileInfo.type.startsWith('audio')">
					<audio :src="fileInfo.url" :alt="fileInfo.name" class="w-full h-full" controls></audio>
				</template>
			</div>
			<div v-if="isSidePanelVisible" class="flex flex-col w-full lg:w-1/4 h-1/2 lg:h-full">
				<header class="flex items-center justify-between px-4 py-2 border-b dark:border-gray-800">
					<h1 class="text-lg font-semibold">Media Viewer</h1>
					<Button
						class="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10"
						@click="isSidePanelVisible = false"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
							class="h-5 w-5"
						>
							<path d="M18 6 6 18"></path>
							<path d="m6 6 12 12"></path>
						</svg>
					</Button>
				</header>
				<main class="flex-1 overflow-auto p-4">
					<div class="mt-4 space-y-2">
						<h2 class="text-lg font-semibold">File Information</h2>
						<div class="grid gap-1">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">File name:</span
								><span class="text-sm text-gray-500 dark:text-gray-400">{{ fileInfo.name }}</span>
							</div>
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">File source:</span
								><span class="text-sm text-gray-500 dark:text-gray-400">{{ fileInfo.source }}</span>
							</div>
							<div class="flex items-center justify-between"></div>
						</div>
					</div>
				</main>
			</div>
		</div>
	</template>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { Button } from '@/components/ui/button';
import { useFileStore } from '@/store/files';
const props = defineProps<{
	identifier: string;
}>();

const filesStore = useFileStore();
const fileInfo = computed(() => filesStore.file);
const isSidePanelVisible = ref(true);
const loading = ref(true); // Initialize loading state as true

onMounted(async () => {
	await filesStore.get(props.identifier);
	loading.value = false; // Set loading to false once the data is fetched
});
</script>
