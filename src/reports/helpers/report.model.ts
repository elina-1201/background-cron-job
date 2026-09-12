export interface Report {
    id: number;
    topic: string;
    status: ReportStatus;
    result?: string;
}

export enum ReportStatus {
    PENDING = 'pending',
    FAILED = 'failed',
    DONE = 'done',
}