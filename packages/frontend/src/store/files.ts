import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { File } from '@/types';
import { getFile } from '@/use/api';

export const publicOnly = ref(false);

export const useFileStore = defineStore('files', {
	state: () => ({
		file: {} as File
	}),
	actions: {
		async get(search: string) {
			const response = await getFile(search);
			if (!response) return;
			this.file = await response;
		}
	}
});
