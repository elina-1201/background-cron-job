import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { serve } from 'inngest/express';
import { AppModule } from './app.module';
import { functions, inngest } from './inngest';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Ensure JSON body parsing supports larger payloads
  app.useBodyParser("json", { limit: "10mb" });

  // Set up the "/api/inngest" route with the serve handler
  app.use(
    "/api/inngest",
    serve({
      client: inngest,
      functions,
    })
  );

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
