import { pipeline } from '@xenova/transformers';

export const classifyImage = async (imagePath: string) => {
	const classifier = await pipeline('image-classification');
	const output = await classifier(imagePath, { topk: 0 });
	return output.slice(0, 5);
};
