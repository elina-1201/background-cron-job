import { Inngest } from "inngest";
import { Report, ReportStatus } from "../reports/helpers/report.model";
import { reportsStore } from "../reports/helpers/reports.store";

export const inngest = new Inngest({ id: "report-api" });

const helloWorld = inngest.createFunction(
    { id: "say-hello", triggers: [{ event: "test/hello" }] },
    async ({ step }) => {
        await step.sleep("wait-a-moment", "5s");
        return { message: `Hello from the background!` };
    },
);

const makeReport = inngest.createFunction(
    {
        id: "make-report",
        triggers: [{ event: "report/requested" }],
        retries: 2,
    },

    async ({ event, step }) => {
        const { id, topic } = event.data as Report;

        await step.sleep("do-the-slow-work", "8s");

        if (topic === "fail") {
            const reason = "The report oven is broken!";
            await step.run("mark-failed", async () =>
                reportsStore.markReport(id, ReportStatus.FAILED, reason)
            );

            throw new Error(reason);
        }

        const report = await step.run("build-report", async () => {
            const result = `Report for ${topic} topic is ready.`;
            return reportsStore.markReport(id, ReportStatus.DONE, result);
        });

        return report;
    }
);

const hartbeat = inngest.createFunction(
    {
        id: "heartbeat",
        triggers: [{ cron: "* * * * *" }],
    },
    async () => {

        const counts: Record<ReportStatus, number> = {
            [ReportStatus.PENDING]: 0,
            [ReportStatus.FAILED]: 0,
            [ReportStatus.DONE]: 0,
        };

        for (const { status } of reportsStore.getAll()) {
            counts[status]++;
        }


        const date = new Date().toISOString();
        const pending = counts[ReportStatus.PENDING];
        const done = counts[ReportStatus.DONE];
        const failed = counts[ReportStatus.FAILED];

        console.log(
            "\x1b[36m%s\x1b[0m %s",
            `[${date}]`,
            `Heartbeat: ${pending} pending; ${done} done; ${failed} failed`,
        );
    },
);

export const functions = [
    helloWorld,
    makeReport,
    hartbeat,
];