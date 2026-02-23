import { prisma } from '../../../server';
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const [totalRevenue, activeOrders, totalCustomers, totalDrivers] = await Promise.all([
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true }
      }),
      prisma.order.count({
        where: { status: { notIn: ['COMPLETED', 'CANCELLED', 'REJECTED'] } }
      }),
      prisma.user.count({
        where: { role: 'MAIN_USER' }
      }),
      prisma.driver.count({
        where: { isOnline: true }
      })
    ]);

    return res.json({
      revenue: totalRevenue._sum.totalAmount || 0,
      activeOrders,
      customers: totalCustomers,
      drivers: totalDrivers
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
