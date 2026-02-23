import { prisma } from '../../../server';
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

const createOrderSchema = z.object({
  type: z.enum(['DOORSTEP', 'AT_PUMP']),
  quantity: z.number().positive(),
  assetId: z.string().optional(),
  pumpId: z.string().optional(),
});

export const createOrder = async (req: AuthRequest, res: Response) => {
  try {
    const data = createOrderSchema.parse(req.body);
    const userId = req.user!.id;

    const order = await prisma.$transaction(async (tx) => {
      const orderCount = await tx.order.count();
      const orderNo = `PEPFUEL-${Date.now()}-${orderCount + 1}`;

      const newOrder = await tx.order.create({
        data: {
          orderNo,
          type: data.type,
          quantity: data.quantity,
          customerId: userId,
          assetId: data.assetId,
          pumpId: data.pumpId,
          pricePerLitre: 95.5, // Example static price
          totalAmount: data.quantity * 95.5,
          status: 'PENDING',
        }
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: newOrder.id,
          status: 'PENDING',
          updatedById: userId,
          remarks: 'Order created by customer',
        }
      });

      return newOrder;
    });

    return res.status(201).json(order);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: 'Failed to create order' });
  }
};

export const getOrders = async (req: AuthRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;

  let where: any = {};
  if (role === 'MAIN_USER' || role === 'SUB_USER') {
    where.customerId = userId;
  } else if (role === 'DRIVER') {
    where.driverId = userId;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      asset: true,
      driver: { include: { user: true } },
      history: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json(orders);
};
