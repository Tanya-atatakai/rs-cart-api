import { Injectable } from '@nestjs/common';
import { Client, QueryResult } from 'pg';
import { Order } from '../models';
import { getPgClient, config } from 'src/db';

@Injectable()
export class OrderService {
  async findById(orderId: string): Promise<Order> {
    const pgClient = getPgClient();

    try {
      const pgClient = new Client(config);
      await pgClient.connect();

      const findOrderQuery = `SELECT * FROM orders WHERE id = '${orderId}'`;

      const result: QueryResult<Order> = await pgClient.query(findOrderQuery);

      return result.rows[0];
    } catch (e) {
      console.log('Error in OrderService, findById:', e);
    } finally {
      await pgClient.end();
    }
  }

  async create(data: Order): Promise<Order> {
    const pgClient = getPgClient();

    try {
      await pgClient.connect();

      const { rows } = await pgClient.query(
        'INSERT INTO orders (user_id, cart_id, payment, delivery, comments, status, total) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
        [
          data.userId,
          data.cartId,
          data.payment,
          data.delivery,
          data.comments,
          'open',
          data.total,
        ],
      );

      return rows[0];
    } catch (e) {
      console.log('Error in OrderService, create:', e);
    } finally {
      await pgClient.end();
    }
  }

  async update(orderId: string, data: Order): Promise<void> {
    const pgClient = getPgClient();

    try {
      await pgClient.connect();
      const order = await this.findById(orderId);

      if (!order) {
        throw new Error('Order does not exist.');
      }

      await pgClient.query(
        'UPDATE orders SET user_id = $1, cart_id = $2, payment = $3, delivery = $4, comments = $5, status = $6, total = $7 WHERE id = $8',
        [
          order['user_id'],
          order['cart_id'],
          data.payment,
          data.delivery,
          data.comments,
          data.status,
          data.total,
          orderId,
        ],
      );
    } catch (e) {
      console.log('Error in OrderService, update:', e);
    } finally {
      await pgClient.end();
    }
  }
}
