import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  tls: {}, // 🔥 IMPORTANT for Upstash
});

export const orderQueue = new Queue('order-lifecycle', { connection });

export const initWorkers = () => {
  const worker = new Worker('order-lifecycle', async (job) => {
    console.log(`Processing job ${job.id}: ${job.name}`);
    
    if (job.name === 'assign-driver') {
      // Logic to find nearest available driver and assign
    }
    
    if (job.name === 'send-notification') {
      // Logic to send push notification
    }
  }, { connection });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
  });
};
