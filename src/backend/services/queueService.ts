import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { prisma } from '../../../server';

const sanitizeRedisUrl = (url: string) => {
  if (!url) return "redis://localhost:6379";
  return url.replace(/.*(rediss?:\/\/)/, '$1').trim();
};

const connection = new Redis(sanitizeRedisUrl(process.env.REDIS_URL!), {
  maxRetriesPerRequest: null,
  tls: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
  retryStrategy(times) {
    return Math.min(times * 50, 2000);
  },
});

export const orderQueue = new Queue('order-lifecycle', { connection });

export const initWorkers = () => {
  const worker = new Worker('order-lifecycle', async (job) => {
    console.log(`Processing job ${job.id}: ${job.name}`);
    
    if (job.name === 'assign-driver') {
      const { orderId } = job.data;
      
      // Find an available driver (simplified logic)
      const availableDriver = await prisma.driver.findFirst({
        where: { isOnline: true, currentVehicleId: { not: null } },
        include: { user: true }
      });

      if (availableDriver) {
        await prisma.order.update({
          where: { id: orderId },
          data: { 
            driverId: availableDriver.id,
            status: 'ASSIGNED'
          }
        });

        await prisma.orderStatusHistory.create({
          data: {
            orderId,
            status: 'ASSIGNED',
            updatedById: 'SYSTEM',
            remarks: `Automatically assigned to driver ${availableDriver.user.name}`,
          }
        });

        console.log(`Order ${orderId} assigned to driver ${availableDriver.id}`);
      } else {
        console.log(`No available drivers for order ${orderId}, will retry later.`);
        // In a real app, you might re-queue this or notify admins
      }
    }
    
    if (job.name === 'send-notification') {
      // Logic to send push notification via Firebase/OneSignal
    }
  }, { connection });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
  });
};
