export interface Report {
    id: number;
    topic: string;
    status: ReportStatus;
    result?: string;
}

export enum ReportStatus {
    PENDING = 'pending',
    IN_PROGRESS = 'in_progress',
    DONE = 'done',
}