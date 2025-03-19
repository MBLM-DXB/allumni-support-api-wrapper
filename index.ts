/**
 * Support API Module
 * Provides a unified interface for interacting with support/helpdesk systems
 */

import { Desk365Client, Desk365ClientConfig } from './client';
import { SupportApiInterface } from './types';

// Re-export all types for consumers
export * from './types';

/**
 * Provider type for the support API
 */
export enum SupportProvider {
  DESK365 = 'desk365',
  // Add other providers as needed
}

/**
 * Configuration for creating a support API client
 */
export interface SupportApiConfig {
  provider: SupportProvider;
  baseUrl: string;
  apiKey: string;
  orgId?: string; // Made optional since not all providers require it
  verbose?: boolean; // Add verbose option for more detailed logging
  // Add any other configuration options that might be needed in the future
}

/**
 * Creates a new support API client based on the provided configuration
 * @param config - The configuration for the client
 * @returns A support API client instance
 */
export function createSupportApi(config: SupportApiConfig): SupportApiInterface {
  switch (config.provider) {
    case SupportProvider.DESK365:
      return new Desk365Client({
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        verbose: config.verbose
      });
    default:
      throw new Error(`Unsupported support provider: ${config.provider}`);
  }
}

/**
 * Default export - the factory function for creating a support API client
 */
export default createSupportApi;
