import { Request } from 'express';
import { AppRequest } from '../models';

/**
 * @param {AppRequest} request
 * @returns {string}
 */
export function getUserIdFromRequest(request: Request): string {
  return request.query.user as string;
}
