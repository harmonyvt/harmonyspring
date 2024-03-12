<template>
	<div
		class="w-7/12 h-80 right-0 top-0 bg-[#181a1b] rounded-3xl mobile:rounded-lg border-4 shadow-lg flex items-center justify-center blueprint flex-col cursor-pointer hover:border-[#3b3e40] transform-gpu transition-all"
	>
		<div class="flex-grow pt-10">
			<Select v-model="selectedOption">
				<SelectTrigger>
					<SelectValue placeholder="Select an uploader" />
				</SelectTrigger>
				<SelectContent>
					<ScrollArea>
						<SelectGroup class="max-h-[480px]">
							<SelectItem v-for="(option, index) in selectOption" :key="index" :value="option">
								{{ option }}
							</SelectItem>
						</SelectGroup>
					</ScrollArea>
				</SelectContent>
			</Select>
		</div>
		<div id="upload" class="flex-grow">
			<template v-if="isUploadEnabled">
				<!-- The content that changes based on the selected option -->
				<div class="content">
					<div v-if="selectedOption === 'GENERAL'"><UploaderLink /></div>
					<div v-else-if="selectedOption === 'VIDEO'"><UploaderYTDLP /></div>
					<div v-else-if="selectedOption === 'FILE'">
						<div
							id="upload"
							:class="{
								'border-blue-400': isDragging,
								'border-[#303436]': !isDragging
							}"
							@click="triggerFileInput"
							@drop.prevent="event => dropHandler(event)"
							@dragenter.prevent="onDragStart"
							@dragend.prevent="onDragEnd"
							@dragexit.prevent="onDragEnd"
							@dragleave.prevent="onDragEnd"
							@dragover.prevent
						>
							<div class="flex flex-col items-center justify-center">
								<UploadCloudIcon class="h-12 w-12 pointer-events-none mobile:hidden" />
								<h3 class="font-bold text-center mt-4 pointer-events-none">
									<p class="text-blue-400 mobile:visible invisible h-0 mobile:h-12">
										TAP TO UPLOAD
										<span class="text-light-100 ml-2">({{ formatBytes(maxFileSize) }} max)</span>
									</p>
									<p class="mobile:invisible">
										DROP FILES OR <br /><span class="text-blue-400">CLICK HERE</span>
									</p>
								</h3>
								<p class="text-center mt-4 w-3/4 pointer-events-none mobile:hidden mobile:h-0">
									{{ formatBytes(maxFileSize) }} max per file.
									<span
										class="block mt-4 text-blue-400 hover:text-blue-500 pointer-events-auto"
										@click.stop.prevent="() => {}"
									>
									</span>
								</p>
							</div>
							<input
								ref="inputUpload"
								type="file"
								class="hidden"
								multiple
								@change="onFileChanged($event)"
							/>
						</div>
					</div>
					<div v-else-if="selectedOption === 'TEXT'">
						<TextEditorDialog :content="clipboard">
							<Button class="shrink-0" @click="getClipboardContent">Create new snippet</Button>
						</TextEditorDialog>
					</div>
					<div v-else></div>
				</div>
			</template>
			<template v-else>
				<h3
					class="text-center mt-4 mobile:mt-0 mobile:w-full mobile:h-full mobile:flex mobile:justify-center mobile:items-center w-3/4 pointer-events-none"
				>
					Upload is disabled without an account
				</h3>
			</template>
		</div>
	</div>
</template>

<script setup lang="ts">
import { chibiUploader, type UploaderOptions } from '@chibisafe/uploader-client';
import { useWindowSize } from '@vueuse/core';
import { UploadCloudIcon } from 'lucide-vue-next';
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { toast } from 'vue-sonner';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import UploaderLink from '~/components/upload/UploaderLink.vue';
import UploaderYTDLP from '~/components/upload/UploaderYTDLP.vue';
import { useUserStore, useUploadsStore, useSettingsStore, useAlbumsStore } from '~/store';
import { getFileExtension, formatBytes } from '~/use/file';
import { debug } from '~/use/log';
import Button from '../buttons/Button.vue';
import TextEditorDialog from '../dialogs/TextEditorDialog.vue';

const userStore = useUserStore();
const uploadsStore = useUploadsStore();
const settingsStore = useSettingsStore();
const albumsStore = useAlbumsStore();
// clipboard value
const clipboard = ref('');
const isLoggedIn = computed(() => userStore.user.loggedIn);
const token = computed(() => userStore.user.token);
const files = ref<File[] | null>();
const inputUpload = ref<HTMLInputElement>();
const isDragging = ref(false);
const selectedOption = ref('');
const selectOption = ['GENERAL', 'VIDEO', 'FILE', 'TEXT'];
const isOpen = ref(false);
const isUploadEnabled = computed(() => {
	if (settingsStore.publicMode) return true;
	return isLoggedIn.value;
});
watch(selectedOption, newValue => {
	if (newValue === 'TEXT') {
		isOpen.value = true;
		console.log(isOpen.value);
	} else {
		isOpen.value = false;
		console.log(isOpen.value);
	}
});
const maxFileSize = computed(() => settingsStore.maxSize);
const chunkSize = computed(() => settingsStore.chunkSize);
const isMobile = ref(false);

const triggerFileInput = () => {
	inputUpload.value?.click();
};

const dropHandler = (event: DragEvent) => {
	if (!isUploadEnabled.value) return;
	if (!event.dataTransfer) return;
	for (const file of Array.from(event.dataTransfer.files)) {
		const fileData = new File([file], file.name, {
			type: file.type
		});

		// eslint-disable-next-line @typescript-eslint/no-use-before-define
		void processFile(fileData);
	}

	onDragEnd();
};

const uploadFile = async ({
	file,
	endpoint,
	isNetworkStored,
	method = 'POST',
	identifier = '',
	publicUrl = ''
}: {
	file: File;
	endpoint: string;
	isNetworkStored: boolean;
	method: 'POST' | 'PUT';
	identifier?: string;
	publicUrl?: string;
}) => {
	const options: UploaderOptions = {
		// @ts-ignore
		debug: !import.meta.env.PROD,
		endpoint,
		file,
		method,
		maxFileSize: maxFileSize.value,
		// If we're storing in s3, we don't want to chunk the file
		chunkSize: isNetworkStored ? maxFileSize.value : chunkSize.value,
		autoStart: true,
		maxParallelUploads: 1
	};

	if (isNetworkStored) {
		options.headers = {
			'Content-Type': file.type
		};
	} else {
		options.postParams = {
			name: file.name,
			type: file.type,
			// @ts-ignore
			size: file.size
		};

		options.headers = {
			authorization: token.value ? `Bearer ${token.value}` : '',
			albumuuid: isLoggedIn.value
				? albumsStore.selectedAlbumForUpload
					? albumsStore.selectedAlbumForUpload
					: ''
				: ''
		};
	}

	await chibiUploader({
		...options,
		onStart: (uuid: string, totalChunks: number) => {
			debug(`Started uploading ${file.name} with uuid ${uuid} and ${totalChunks} chunks`);
			uploadsStore.addFile({
				uuid,
				name: file.name,
				type: file.type,
				processing: true,
				status: 'uploading',
				bytesSent: 0,
				bytesTotal: file.size,
				progress: 0,
				url: '',
				nsfw: false,
				source: ''
			});
		},
		onError: (uuid: string, error: any) => {
			debug(`Error uploading ${file.name} with uuid ${uuid}`, error.message);
			uploadsStore.setError(uuid, error.message);
		},
		onProgress: (uuid: string, progress: any) => {
			uploadsStore.updateProgess(uuid, progress, 0);
		},
		onRetry: (_, reason: any) => {
			console.log('onRetry', reason);
		},
		onFinish: async (uuid: string, response: any) => {
			if (isNetworkStored) {
				debug('Finished uploading file to S3 storage', {
					name: file.name,
					uuid,
					url: publicUrl
				});

				uploadsStore.setCompleted(uuid, publicUrl);

				return fetch('/api/upload/process', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						authorization: token.value ? `Bearer ${token.value}` : '',
						albumuuid: isLoggedIn.value
							? albumsStore.selectedAlbumForUpload
								? albumsStore.selectedAlbumForUpload
								: ''
							: ''
					},
					body: JSON.stringify({ identifier, name: file.name, type: file.type })
				})
					.then(async res => {
						if (!res.ok) {
							const error = await res.json();
							throw new Error(error.message);
						}

						return res.json();
					})
					.then(res => {
						uploadsStore.setCompleted(uuid, res.url);
						debug('Finished processing file', {
							name: file.name,
							uuid,
							url: res.url
						});
					})
					.catch(error => {
						uploadsStore.setError(uuid, error.message);
						toast.error(error.message);
					});
			}

			debug('Finished uploading file', {
				name: file.name,
				uuid,
				url: response.url
			});

			uploadsStore.setCompleted(uuid, response.url);
			return null;
		}
	});
};

const processFile = async (file: File) => {
	files.value?.push(file);

	const blockedExtensions = settingsStore.blockedExtensions;
	if (blockedExtensions.length) {
		const extension = getFileExtension(file);
		if (!extension) return;
		if (blockedExtensions.includes(`.${extension}`)) {
			toast.error(`File extension .${extension} is blocked`);
			return;
		}
	}

	if (!settingsStore.useNetworkStorage) {
		await uploadFile({ file, endpoint: '/api/upload', isNetworkStored: false, method: 'POST' });
		return;
	}

	const getSignedUrl = await fetch('/api/upload', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			authorization: token.value ? `Bearer ${token.value}` : ''
		},
		body: JSON.stringify({
			contentType: file.type,
			name: file.name,
			size: file.size
		})
	});

	if (!getSignedUrl.ok) {
		const error = await getSignedUrl.json();
		toast.error(error.message);
		return;
	}

	const { url, identifier, publicUrl } = await getSignedUrl.json();

	await uploadFile({ file, endpoint: url, isNetworkStored: true, method: 'PUT', identifier, publicUrl });
};

const onFileChanged = ($event: Event) => {
	const target = $event.target as HTMLInputElement;
	if (target?.files) {
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < target.files.length; i++) {
			void processFile(target.files[i] as File);
		}
	}
};

const getClipboardContent = async () => {
	try {
		const clipboardContent = await navigator.clipboard.readText();
		console.log('Clipboard content:', clipboardContent);
		clipboard.value = clipboardContent;
	} catch (error) {
		console.error('Failed to read clipboard content:', error);
	}
};

const onDragStart = () => {
	isDragging.value = true;
};

const onDragEnd = () => {
	isDragging.value = false;
};

onMounted(() => {
	// @ts-ignore
	// window.addEventListener('paste', pasteHandler);
	isMobile.value = useWindowSize().width.value < 640;
});

onUnmounted(() => {
	// @ts-ignore
	// window.removeEventListener('paste', pasteHandler);
});
</script>
