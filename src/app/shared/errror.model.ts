// This file is deprecated. Use ErrorResponse from '../shared/dto' instead.
// Keeping for backward compatibility during migration.
export interface ErrorResponse {
  message: string;
  statusCode: number;
  timeStamp: number;
}
