import { Injectable, NotFoundException } from '@nestjs/common';
import type { Report } from './report.model';
import { reportsStore } from './reports.store';

@Injectable()
export class ReportsService {

    addReport(topic: string): Report {
        return reportsStore.add(topic);
    }

    getReports(): Report[] {
        return reportsStore.getAll();
    }

    getReport(id: number): Report {
        const report = reportsStore.get(id);
        if (!report) {
            throw new NotFoundException(`Report with id ${id} not found`);
        }
        return report;
    }
}
