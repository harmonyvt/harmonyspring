<template>
	<div class="h-screen w-full overflow-auto">
		<div class="flex flex-col items-center w-full self-center text-light-100">
			<Header />
		</div>
		<div class="flex flex-col items-center h-auto min-h-[700px] w-full text-light-100 justify-center self-center">
			<Uploader />
			<UploaderWebsocket />
		</div>
	</div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { ref, onMounted } from 'vue';
import Header from '~/components/header/Header.vue';
import Uploader from '~/components/upload/Uploader.vue';
import UploaderWebsocket from '~/components/upload/UploaderWebsocket.vue';

const isMobile = ref(false);

onMounted(() => {
	isMobile.value = useWindowSize().width.value < 640;
});
</script>
