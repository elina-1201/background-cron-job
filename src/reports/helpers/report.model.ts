export interface Report {
    id: number;
    topic: string;
    status: ReportStatus;
    result?: string;
    /** Epoch ms when the report reached DONE, used by the cleanup cron. */
    completedAt?: number;
}

export enum ReportStatus {
    PENDING = 'pending',
    FAILED = 'failed',
    DONE = 'done',
}