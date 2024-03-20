<template>
	<div>
		<Tabs v-model="activeTab" class="w-full">
			<TabsList class="grid w-full grid-cols-5 border border-accent">
				<TabsTrigger v-for="channel in channels" :key="channel" :value="channel">
					{{ channel }}
				</TabsTrigger>
			</TabsList>
			<TabsContent v-for="channel in channels" :key="channel" :value="channel">
				<div>
					<!-- WebSocket event handling logic goes here -->
					<p>Connected to {{ activeTab }} channel.</p>
				</div>
				<template v-for="(item, index) in items" :key="index">
					<WebsocketCard :Item="item" />
				</template>
			</TabsContent>
		</Tabs>
	</div>
</template>

<script setup lang="ts">
import { JobItem } from '@harmonyspring/helpers';
import { useWebSocket } from '@vueuse/core';
import { computed, ref, watch } from 'vue';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserStore } from '@/store/user';
import WebsocketCard from './WebsocketCard.vue';
const userStore = useUserStore();
const ownUser = computed(() => userStore.user);
// Dynamically determine the WebSocket host based on the environment
const wsHost = computed(() => {
	if (import.meta.env.NODE_ENV === 'production') {
		// eslint-disable-next-line n/prefer-global/url
		const reference = new URL(import.meta.url);
		if (reference.protocol === 'https:') {
			// eslint-disable-next-line n/prefer-global/url
			return new URL(import.meta.url).hostname;
		} else {
			// eslint-disable-next-line n/prefer-global/url
			return `${new URL(import.meta.url).hostname}:${new URL(import.meta.url).port}`;
		}
	} else {
		return 'localhost:8000';
	}
});
const secure = computed(() => {
	// if import.meta.url.protocol is 'https:', then return secure websocket else return insecure
	// eslint-disable-next-line n/prefer-global/url
	const reference = new URL(import.meta.url);
	if (reference.protocol === 'https:') {
		return 'wss';
	} else {
		return 'ws';
	}
});
const channels = ['file', 'video'];
const activeTab = ref(''); // Default active tab
const items = ref<JobItem[]>([]);
let websocket = useWebSocket(`${secure.value}://${wsHost.value}/event/${activeTab.value}/${ownUser.value.uuid}`, {
	autoReconnect: false
});

// Handle WebSocket connection
const handleWebSocketConnection = (channel: string) => {
	websocket.close();
	websocket = useWebSocket(`${secure.value}://${wsHost.value}/event/${channel}/${ownUser.value.uuid}`, {
		autoReconnect: false,
		onMessage: (ws: WebSocket, event: MessageEvent) => {
			if (event.data !== null) {
				items.value = JSON.parse(event.data).items as JobItem[];
			}
		}
	});
};

// Watch for changes in the active tab and handle WebSocket connection
watch(activeTab, (newChannel: string) => {
	// reset items
	items.value = [];
	handleWebSocketConnection(newChannel);
});
</script>
