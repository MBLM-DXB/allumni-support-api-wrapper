"use strict";
/**
 * Support API Module
 * Provides a unified interface for interacting with support/helpdesk systems
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportProvider = void 0;
exports.createSupportApi = createSupportApi;
const client_1 = require("./client");
// Re-export all types for consumers
__exportStar(require("./types"), exports);
/**
 * Provider type for the support API
 */
var SupportProvider;
(function (SupportProvider) {
    SupportProvider["DESK365"] = "desk365";
    // Add other providers as needed
})(SupportProvider || (exports.SupportProvider = SupportProvider = {}));
/**
 * Creates a new support API client based on the provided configuration
 * @param config - The configuration for the client
 * @returns A support API client instance
 */
function createSupportApi(config) {
    switch (config.provider) {
        case SupportProvider.DESK365:
            return new client_1.Desk365Client({
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
exports.default = createSupportApi;
