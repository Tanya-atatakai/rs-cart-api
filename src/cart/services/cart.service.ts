import { Injectable } from '@nestjs/common';

import { Cart } from '../models';
import { config, getPgClient } from 'src/db';
import { Client } from 'pg';

@Injectable()
export class CartService {
  async findByUserId(userId: string): Promise<Cart> {
    const pgClient = getPgClient();

    try {
      const pgClient = new Client(config);
      await pgClient.connect();

      const query = `
      SELECT 
        carts.id AS cart_id,
        carts.user_id,
        carts.created_at,
        carts.updated_at,
        carts.status,
        cart_items.product_id,
        cart_items.count
      FROM 
        carts
      LEFT JOIN 
        cart_items ON carts.id = cart_items.cart_id
      WHERE 
        carts.user_id = '${userId}';
    `;

      const { rows } = await pgClient.query(query);

      if (rows.length === 0) {
        return null; // No cart found for the given user ID
      }

      const cart: Cart = {
        id: rows[0].cart_id,
        items: rows.map((row) => ({
          product: {
            id: row.product_id,
            title: row.title,
            description: row.description,
            price: row.price,
          },
          count: row.count,
        })),
      };

      return cart;
    } catch (e) {
      console.log('Error in CartService, findByUserId:', e);
    } finally {
      await pgClient.end();
    }
  }

  async createByUserId(userId: string): Promise<Cart | null> {
    const pgClient = getPgClient();

    try {
      await pgClient.connect();

      const insertCartQuery = `
        INSERT INTO carts (user_id, created_at, updated_at, status)
        VALUES
            ('${userId}', NOW(), NOW(), 'open')
        RETURNING id
      `;

      const cartResult = await pgClient.query(insertCartQuery);
      const newCart = cartResult.rows[0];

      const createdCart: Cart = {
        id: newCart.id,
        items: [],
      };

      return createdCart;
    } catch (e) {
      console.log('Error in CartService, createByUserId:', e);
      return null;
    } finally {
      await pgClient.end();
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart | null> {
    const pgClient = getPgClient();

    try {
      await pgClient.connect();
      // Find or create cart
      const existingOrNewCart = await this.findOrCreateByUserId(userId);

      // Delete old cart items
      const deleteItemsQuery = `
        DELETE FROM cart_items
        WHERE cart_id = '${existingOrNewCart.id}';
      `;
      await pgClient.query(deleteItemsQuery);

      // Insert new cart items
      const insertItemsQuery = items
        .map(
          (item) => `
            INSERT INTO cart_items (cart_id, product_id, count)
            VALUES ('${existingOrNewCart.id}', '${item.product.id}', ${item.count});
          `,
        )
        .join('');

      await pgClient.query(insertItemsQuery);

      // Update cart date
      const updateCartQuery = `
        UPDATE carts
        SET updated_at = NOW()
        WHERE id = '${existingOrNewCart.id}'
        AND status = 'open';
      `;

      await pgClient.query(updateCartQuery);

      const updatedCart: Cart = {
        ...existingOrNewCart,
        items: [...items],
      };

      return updatedCart;
    } catch (e) {
      console.log('Error in CartService, updateByUserId:', e);
      return null;
    } finally {
      await pgClient.end();
    }
  }

  async removeByUserId(userId: string): Promise<void> {
    const pgClient = getPgClient();

    try {
      await pgClient.connect();

      const existingCart = await this.findByUserId(userId);

      if (existingCart) {
        // Update cart date
        const updateCartQuery = `
        UPDATE carts
        SET status = 'ordered',
        updated_at = NOW()
        WHERE id = '${existingCart.id}'
      `;

        await pgClient.query(updateCartQuery);
      } else {
        throw new Error('Cart not found');
      }
    } catch (e) {
      console.log('Error in CartService, removeByUserId:', e);
    } finally {
      await pgClient.end();
    }
  }
}
