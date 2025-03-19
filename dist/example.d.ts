/**
 * Example usage of the Support API wrapper
 *
 * This file demonstrates how to use the Support API wrapper with the Desk365 provider.
 * It covers common user and admin operations for managing support tickets.
 */
/**
 * Example showing direct usage of Desk365Client
 */
declare function desk365Example(): Promise<void>;
/**
 * Example of how to set up and use the provider-agnostic service
 */
declare function providerAgnosticExample(): Promise<void>;
/**
 * This example shows how easy it would be to switch providers in the future
 */
declare function futureSwitchExample(): Promise<void>;
/**
 * Example of how to use the support API in a Next.js API route
 *
 * @param req - API request
 * @param res - API response
 */
export declare function ticketApiExample(req: any, res: any): Promise<any>;
declare const _default: {
    desk365Example: typeof desk365Example;
    providerAgnosticExample: typeof providerAgnosticExample;
    futureSwitchExample: typeof futureSwitchExample;
};
export default _default;
