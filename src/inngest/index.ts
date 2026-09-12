import { Inngest } from "inngest";
import type { Report } from "../reports/report.model";
import { reportsStore } from "../reports/reports.store";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "report-api" });

const helloWorld = inngest.createFunction(
    { id: "say-hello", triggers: [{ event: "test/hello" }] },
    async ({ step }) => {
        await step.sleep("wait-a-moment", "5s");
        return { message: `Hello from the background!` };
    },
);

const makeReport = inngest.createFunction(
    { id: "make-report", triggers: [{ event: "report/requested" }] },
    async ({ event, step }) => {
        await step.sleep("do-the-slow-work", "8s");

        const report = await step.run("build-report", async () => {
            const { id, topic } = event.data as Report;

            const result = `Report for ${topic} topic is ready.`;

            return reportsStore.markDone(id, result);
        });

        return report;
    }
);

export const functions = [
    helloWorld,
    makeReport
];