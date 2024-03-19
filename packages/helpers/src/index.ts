// Define the JobStatus enumerator
export enum JobStatus {
	Active = 'active',
	Completed = 'completed',
	Failed = 'failed',
	Waiting = 'waiting'
}

export enum JobType {
	FetchFile = 'FetchFile',
	FetchVideoYTDLP = 'FetchVideoYTDLP',
	GenerateGIF = 'GenerateGIF',
	GenerateTags = 'GenerateTags',
	ProcessThumbnail = 'ProcessThumbnail'
}
// Define the Job interface
export interface JobStructure {
	jobType: JobType;
	lastUpdate: Date;
	owner: string;
	progress?: number;
	status: JobStatus;
	title: string; // Optional, only applicable for 'active' status
}

export class JobItem implements JobStructure {
	public jobType: JobType;
	public lastUpdate: Date;
	public owner: string;
	public progress?: number;
	public status: JobStatus;
	// job name/file name
	public title: string;

	public constructor(job: JobStructure) {
		this.jobType = job.jobType;
		this.lastUpdate = job.lastUpdate;
		this.owner = job.owner;
		this.progress = job.progress;
		this.status = job.status;
		this.title = job.title;
	}
}
