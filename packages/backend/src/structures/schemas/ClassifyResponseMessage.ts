import { z } from 'zod';

// Define the structure of each item in the results array
const ImageClassificationResult = z.object({
	label: z.string(),
	score: z.number()
});

// Define the schema for the entire response, which is an array of the above structure
export const imageClassificationResultsSchema = z
	.array(ImageClassificationResult)
	.describe('Array of image classification results.');
