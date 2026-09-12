import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post } from '@nestjs/common';
import { inngest } from 'src/inngest';
import { CreateReportDto } from './dto/create-report.dto';
import type { Report } from './helpers/report.model';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
    constructor(
        private readonly reportsService: ReportsService
    ) { }

    @HttpCode(HttpStatus.ACCEPTED)
    @Post()
    async addReport(@Body() body: CreateReportDto): Promise<Report> {
        const addedReport: Report = this.reportsService.addReport(body.topic);

        await inngest.send({
            name: "report/requested",
            data: addedReport,
        });

        return addedReport;
    }

    @Get(':id')
    getReport(@Param('id', ParseIntPipe) id: number): Report {
        return this.reportsService.getReport(id);
    }

    @Get()
    getReports(): Report[] {
        return this.reportsService.getReports();
    }
}
