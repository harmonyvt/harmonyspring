<template>
	<div class="border">
		<h1 class="text-2xl font-bold tracking-tight text-white">Uploader UploaderExperiment</h1>
		<div>
			<Select v-model="selectedOption">
				<SelectTrigger>
					<SelectValue placeholder="Select an album" />
				</SelectTrigger>
				<SelectContent>
					<ScrollArea>
						<SelectGroup class="max-h-[480px]">
							<SelectItem v-for="(option, index) in options" :key="index" :value="option">
								{{ option }}
							</SelectItem>
						</SelectGroup>
					</ScrollArea>
				</SelectContent>
			</Select>
		</div>
		<!-- The content that changes based on the selected option -->
		<div class="content">
			<div v-if="selectedOption === 'GENERAL'"><UploaderLink /></div>
			<div v-else-if="selectedOption === 'VIDEO'"><UploaderYTDLP /></div>
			<div v-else-if="selectedOption === 'FILE'"><Uploader /></div>
			<div v-else-if="selectedOption === 'TEXT'">Content for Option 3</div>
			<div v-else>Default Content</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Uploader from '~/components/upload/Uploader.vue';
import UploaderLink from '~/components/upload/UploaderLink.vue';
import UploaderYTDLP from '~/components/upload/UploaderYTDLP.vue';
const selectedOption = ref(''); // This will hold the current selection
const options = ['GENERAL', 'VIDEO', 'FILE', 'TEXT'];
</script>
