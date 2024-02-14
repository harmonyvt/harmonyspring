<template>
	<div class="flex w-full h-auto items-center mt-8 max-w-4xl mobile:flex-col">
		<router-link to="/" class="mobile:items-center flex">
			<img v-if="settingsStore.logoURL" :src="settingsStore.logoURL" alt="chibisafe logo" class="w-12 mr-2" />
			<img v-else src="/logo.svg" alt="chibisafe logo" class="w-12 mr-2" />
			<span class="font-bold text-3xl place-self-center">{{ settingsStore.serviceName }}</span>
		</router-link>
		<span class="flex-1" />

		<div
			class="flex space-x-4 items-center justify-center mobile:flex-col-reverse mobile:space-x-0 mobile:space-y-4"
		>
			<router-link v-if="!loggedIn" to="/login" class="text-light-100 hover:text-blue-500 text-lg mobile:text-2xl"
				>Login / Register</router-link
			>

			<router-link
				v-else
				to="/dashboard/uploads"
				class="text-light-100 hover:text-blue-500 text-lg mobile:text-2xl"
				>Dashboard</router-link
			>
			<a
				href="/docs"
				target="_blank"
				rel="noreferrer noopener"
				class="text-light-100 hover:text-blue-500 text-lg mobile:text-2xl"
				>Docs</a
			>
		</div>
	</div>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core';
import { ref, computed, onMounted } from 'vue';
import { useUserStore, useSettingsStore } from '~/store';

const userStore = useUserStore();
const settingsStore = useSettingsStore();
const loggedIn = computed(() => userStore.user.loggedIn);
const isMobile = ref(false);

onMounted(() => {
	isMobile.value = useWindowSize().width.value < 640;
});
</script>
