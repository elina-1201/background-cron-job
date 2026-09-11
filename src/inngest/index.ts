import { Inngest } from "inngest";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "report-api" });

const helloWorld = inngest.createFunction(
    { id: "say-hello", triggers: [{ event: "test/hello" }] },
    async ({ event, step }) => {
        await step.sleep("wait-a-moment", "5s");
        return { message: `Hello from the background!` };
    },
);

export const functions = [
    helloWorld
];