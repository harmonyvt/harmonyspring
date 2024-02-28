<template>
	<nav>
		<!-- Mobile hamburger menu icon -->
		<div
			class="hidden mobile:flex fixed top-0 right-0 w-12 h-12 items-center justify-center cursor-pointer z-10 mobile:z-50"
			:class="[isOpen ? 'bg-transparent' : 'bg-dark-110']"
			@click="isOpen = !isOpen"
		>
			<XIcon v-if="isOpen" class="h-6 w-6" />
			<MenuIcon v-else class="h-6 w-6" />
		</div>
		<!-- Sidebar navigation -->
		<div
			class="bg-dark-110 w-48 min-w-[12rem] mobile:inset-0 mobile:z-40 mobile:flex mobile:w-full"
			:class="[isOpen ? 'mobile:fixed' : 'mobile:hidden']"
		>
			<ScrollArea>
				<div class="space-y-4 py-4 flex flex-col h-screen">
					<div class="flex flex-shrink-0 items-center px-4 justify-center">
						<router-link to="/">
							<img
								v-if="settingsStore.logoURL"
								:src="settingsStore.logoURL"
								alt="chibisafe logo"
								class="w-24"
							/>
							<img v-else src="/logo.svg" alt="chibisafe logo" class="w-24" />
						</router-link>
					</div>
					<div v-for="(_, name, index) in navigationForUser" :key="index" class="px-3 py-2">
						<h2 class="mb-2 px-4 text-lg font-semibold tracking-tight">{{ name }}</h2>
						<div class="space-y-1">
							<Button
								v-for="item in navigation[name]"
								:key="item.name"
								as="router-link"
								:variant="currentPath === item.href ? 'secondary' : 'ghost'"
								:to="item.href"
								class="w-full justify-start duration-0 h-9"
								@click="isOpen = false"
							>
								<component
									:is="item.icon"
									class="mr-2 h-4 w-4"
									:class="[
										currentPath === item.href
											? 'text-gray-300'
											: 'text-gray-400 group-hover:text-gray-300'
									]"
									aria-hidden="true"
								/>
								{{ item.name }}
							</Button>
						</div>
					</div>

					<div class="flex flex-1"></div>
					<div class="px-3 py-2">
						<div class="space-y-1">
							<Button
								v-for="item in links"
								:key="item.name"
								as="a"
								variant="link"
								:href="item.href"
								target="_blank"
								rel="noopener noreferrer"
								class="w-full text-light-100 hover:text-blue-400 h-8"
								@click="item.onClick"
							>
								{{ item.name }}
							</Button>
							<span class="text-light-100 justify-center flex !mt-4 text-sm pointer-events-none"
								>harmonyspring</span
							>
						</div>
					</div>
				</div>
			</ScrollArea>
		</div>
	</nav>
</template>

<script setup lang="ts">
import {
	HomeIcon,
	FileUpIcon,
	LibraryIcon,
	MenuIcon,
	XIcon,
	UserPlusIcon,
	FilesIcon,
	UsersIcon,
	Settings2Icon,
	BarChart3Icon,
	CodeIcon,
	KeyRoundIcon,
	NetworkIcon,
	TagsIcon,
	AudioWaveformIcon
} from 'lucide-vue-next';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUserStore, useSettingsStore, useUpdateStore } from '~/store';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const settingsStore = useSettingsStore();
const updateStore = useUpdateStore();

const isOpen = ref(false);

const isAdmin = computed(() => userStore.user.roles?.find(role => role.name === 'admin'));
const currentPath = computed(() => route.path);
const navigationForUser = computed(() => {
	if (isAdmin.value) return navigation;
	return {
		Main: navigation.Main,
		Account: navigation.Account
	};
});

// @ts-ignore
if (!import.meta.env.DEV) {
	onMounted(() => {
		if (isAdmin.value) void updateStore.get();
	});

	watch(isAdmin, async () => {
		if (isAdmin.value) void updateStore.get();
	});
}

const navigation = {
	Main: [
		{ name: 'Home', href: '/', icon: HomeIcon },
		{ name: 'Uploads', href: '/dashboard/uploads', icon: FileUpIcon },
		{ name: 'Albums', href: '/dashboard/albums', icon: LibraryIcon },
		{ name: 'Tags', href: '/dashboard/tags', icon: TagsIcon },
		{ name: 'Snippets', href: '/dashboard/snippets', icon: CodeIcon },
		{ name: 'Tracks', href: '/dashboard/tracks', icon: AudioWaveformIcon }
	],
	Account: [{ name: 'Credentials', href: '/dashboard/account', icon: KeyRoundIcon }],
	Admin: [
		{ name: 'Settings', href: '/dashboard/admin/settings', icon: Settings2Icon },
		{ name: 'Users', href: '/dashboard/admin/users', icon: UsersIcon },
		{ name: 'Files', href: '/dashboard/admin/files', icon: FilesIcon },
		{ name: 'Quarantined files', href: '/dashboard/admin/files/quarantine', icon: FilesIcon },
		{ name: 'Banned IPs', href: '/dashboard/admin/ip', icon: NetworkIcon },
		{ name: 'Invites', href: '/dashboard/admin/invites', icon: UserPlusIcon },
		{ name: 'Statistics', href: '/dashboard/admin/statistics', icon: BarChart3Icon }
	]
};

const links = [{ name: 'Log out', href: '#', onClick: (event: MouseEvent) => void logout(event) }];

const logout = async (event: MouseEvent) => {
	event.preventDefault();
	await router.push('/');
	userStore.logout();
};
</script>
