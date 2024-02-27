<template>
	<Table>
		<TableHeader>
			<TableRow>
				<TableHead class="text-center">Tracklist Name</TableHead>
				<TableHead class="text-center">Number of Tracks</TableHead>
				<TableHead class="text-center">Created/Edited</TableHead>
			</TableRow>
		</TableHeader>
		<TableBody>
			<TableRow v-for="tracklist in tracklists" :key="tracklist.id">
				<TableCell>
					{{ tracklist.name }}
				</TableCell>
				<TableCell>
					{{ tracklists?.length || 'Error' }}
				</TableCell>
				<TableCell>
					{{ tracklist.createdAt.toLocaleString + '(' + tracklist.editedAt + ')' }}
				</TableCell>
			</TableRow>
		</TableBody>
	</Table>
</template>

<script setup lang="ts">
import { useQueryClient, useMutation } from '@tanstack/vue-query';
import { onMounted, ref } from 'vue';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Tracklist } from '@/types';
import { getTracklists } from '~/use/api';

onMounted(() => {
	doFetchTracklists();
});

const queryClient = useQueryClient();
const tracklists = ref<Tracklist[]>();

const { mutate: mutateTracklists } = useMutation({
	mutationFn: () => getTracklists(),
	onSuccess: (data: { message: string; tracklists: Tracklist[] }) => {
		tracklists.value = data.tracklists;
		console.log(tracklists);
		queryClient.invalidateQueries({ queryKey: ['tracklists'] });
	}
});

const doFetchTracklists = async () => {
	mutateTracklists();
};
</script>
