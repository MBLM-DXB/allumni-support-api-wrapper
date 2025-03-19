/**
 * Support API Module
 * Provides a unified interface for interacting with support/helpdesk systems
 */
import { SupportApiInterface } from './types';
export * from './types';
/**
 * Provider type for the support API
 */
export declare enum SupportProvider {
    DESK365 = "desk365"
}
/**
 * Configuration for creating a support API client
 */
export interface SupportApiConfig {
    provider: SupportProvider;
    baseUrl: string;
    apiKey: string;
    orgId?: string;
    verbose?: boolean;
}
/**
 * Creates a new support API client based on the provided configuration
 * @param config - The configuration for the client
 * @returns A support API client instance
 */
export declare function createSupportApi(config: SupportApiConfig): SupportApiInterface;
/**
 * Default export - the factory function for creating a support API client
 */
export default createSupportApi;
