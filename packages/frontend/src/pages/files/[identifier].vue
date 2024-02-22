<template>
	<div v-if="loading">Loading...</div>
	<template v-else>
		<div class="flex">
			<!-- Main content area for images and videos -->
			<div class="flex-grow">
				<template v-if="fileInfo.type.startsWith('image/')">
					<img
						:src="fileInfo.url"
						class="object-cover w-full h-full"
						onerror="this.classList.add('min-h-[160px]');"
					/>
				</template>
				<template v-else-if="fileInfo.type.startsWith('video/')">
					<video class="object-cover w-full h-full" autoplay loop muted>
						<source :src="fileInfo.url" />
					</video>
				</template>
			</div>
			<!-- Side panel for information -->
			<div class="flex-grow bg-black p-4">
				<!-- Information content goes here -->
				<h1 class="text-2xl mt-8 font-semibold text-light-100">
					{{ fileInfo?.name }}
				</h1>
				<h2 v-if="fileInfo?.source" class="text-xl mt-4 text-light-100">
					{{ fileInfo?.source }}
				</h2>
				<!-- Add more information here -->
			</div>
		</div>
	</template>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useFileStore } from '@/store/files';
const props = defineProps<{
	identifier: string;
}>();

const filesStore = useFileStore();
const fileInfo = computed(() => filesStore.file);
// const enableNsfw = ref(false);
const loading = ref(true); // Initialize loading state as true

onMounted(async () => {
	await filesStore.get(props.identifier);
	loading.value = false; // Set loading to false once the data is fetched
});
</script>
