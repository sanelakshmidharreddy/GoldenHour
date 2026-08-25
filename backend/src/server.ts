import { createApp } from './app';
import { config } from './config';
import { loadKnowledgeBase } from './kb';

function startServer(): void {
  // Pre-flight check / load knowledge base metadata on startup
  const kbResult = loadKnowledgeBase(config.knowledgeBaseDir);
  if (kbResult.warnings.length > 0) {
    kbResult.warnings.forEach((w) => console.warn(`[KB Warning] ${w}`));
  }

  const app = createApp(config);

  const server = app.listen(config.port, () => {
    console.log('====================================================');
    console.log(`  GoldenHour Backend running`);
    console.log(`  Port:        ${config.port}`);
    console.log(`  Environment: ${config.nodeEnv}`);
    console.log(`  CORS Origin: ${config.publicBackendOrigin}`);
    console.log(`  KB Status:   ${kbResult.loadedFiles.length} file(s) loaded`);
    console.log(`  Healthcheck: http://localhost:${config.port}/health`);
    console.log(`  API Base:    http://localhost:${config.port}/api/v1`);
    console.log('====================================================');
  });

  // Graceful shutdown
  const gracefulShutdown = (signal: string) => {
    console.log(`\nReceived ${signal}. Shutting down gracefully...`);
    server.close(() => {
      console.log('HTTP server closed. Process terminating.');
      process.exit(0);
    });

    // Force close if shutdown takes longer than 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown due to timeout.');
      process.exit(1);
    }, 10000).unref();
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

if (require.main === module) {
  startServer();
}

export { startServer };
