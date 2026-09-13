import { ReportStatus, type Report } from './report.model';

// Shared in-memory store for reports.
class ReportsStore {
    private readonly reports = new Map<number, Report>();
    private nextId = 1;

    add(topic: string): Report {
        const report: Report = {
            id: this.nextId++,
            topic,
            status: ReportStatus.PENDING,
        };
        this.reports.set(report.id, report);

        return report;
    }

    get(id: number): Report | undefined {
        return this.reports.get(id);
    }

    getAll(): Report[] {
        return [...this.reports.values()];
    }

    markReport(id: number, status: ReportStatus, result?: string): Report | undefined {
        const report = this.reports.get(id);
        if (!report) {
            return undefined;
        }

        report.status = status;
        report.result = result;
        if (status === ReportStatus.DONE) {
            report.completedAt = Date.now();
        } else {
            delete report.completedAt;
        }

        return report;
    }

    /** Deletes every DONE report completed at least `maxAgeMs` ago; returns the deleted reports. */
    deleteDoneOlderThan(maxAgeMs: number): Report[] {
        const cutoff = Date.now() - maxAgeMs;
        const stale = this.getAll().filter(
            (report) =>
                report.status === ReportStatus.DONE &&
                report.completedAt !== undefined &&
                report.completedAt <= cutoff,
        );

        for (const report of stale) {
            this.reports.delete(report.id);
        }

        return stale;
    }
}

export const reportsStore = new ReportsStore();
