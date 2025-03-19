"use strict";
/**
 * Example usage of the Support API wrapper
 *
 * This file demonstrates how to use the Support API wrapper with the Desk365 provider.
 * It covers common user and admin operations for managing support tickets.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketApiExample = ticketApiExample;
const types_1 = require("./types");
const client_1 = require("./client");
/**
 * Example showing direct usage of Desk365Client
 */
async function desk365Example() {
    // Create a Desk365 client instance
    // In a real application, you would typically load these values from environment variables
    const client = new client_1.Desk365Client({
        baseUrl: 'https://your-subdomain.desk365.io/apis',
        apiKey: process.env.DESK365_API_KEY || 'your-api-key',
        verbose: true // Optional: enable verbose logging
    });
    try {
        // Validate the configuration
        const validation = await client.validateConfig();
        if (!validation.success) {
            console.error('Configuration validation failed:', validation.message);
            return;
        }
        console.log('Configuration valid:', validation.message);
        // ==================
        // User operations
        // ==================
        // 1. Create a new ticket
        console.log('Creating a new ticket...');
        const ticket = await client.createTicket({
            subject: 'Login issue on mobile app',
            description: 'I cannot log in to the mobile app using my credentials that work on the web',
            priority: types_1.TicketPriority.MEDIUM,
            userEmail: 'user@example.com'
        });
        console.log('Ticket created:', ticket);
        // 2. List user's tickets
        console.log('\nListing user tickets...');
        const userTickets = await client.listUserTickets('user@example.com', {
            page: 1,
            limit: 10,
            sortBy: 'createdAt',
            sortOrder: 'desc'
        });
        console.log(`Found ${userTickets.total} tickets for user`);
        console.log('First 3 tickets:', userTickets.tickets.slice(0, 3));
        // 3. Get details of a specific ticket
        if (userTickets.tickets.length > 0) {
            const ticketId = userTickets.tickets[0].id;
            console.log(`\nGetting details for ticket ${ticketId}...`);
            const details = await client.getTicketDetails(ticketId);
            console.log('Ticket details:', {
                id: details.id,
                subject: details.subject,
                status: details.status,
                messages: details.conversation.length
            });
            // 4. Respond to the ticket
            console.log('\nResponding to the ticket...');
            const response = await client.respondToTicket({
                ticketId: ticketId,
                message: 'I have tried clearing browser cache and cookies, but the issue persists.',
                // Optional parameters:
                ccEmails: 'support@example.com',
                includePreviousMessages: true
            });
            console.log('Response sent:', response);
            // 5. Search for specific tickets
            console.log('\nSearching for login-related tickets...');
            const searchResults = await client.searchTickets({
                userEmail: 'user@example.com',
                status: types_1.TicketStatus.OPEN
            });
            console.log(`Found ${searchResults.total} matching tickets`);
            // 6. Respond to a ticket with attachments
            console.log('\nResponding to the ticket with attachments...');
            // Example for Node.js environment (using fs)
            if (typeof window === 'undefined') {
                // Only run this in Node.js environment
                try {
                    // Import fs only in Node.js environment
                    const fs = require('fs');
                    const path = require('path');
                    // Path to a file to upload as an attachment
                    const filePath = path.join(__dirname, 'example-attachment.png');
                    // Check if the file exists before attempting to upload
                    if (fs.existsSync(filePath)) {
                        // In Node.js, you would typically need to read the file and create a File-like object
                        // For this example, we'll pass the file path and let the client handle it
                        const responseWithAttachment = await client.respondToTicketWithAttachments({
                            ticketId: ticketId,
                            message: 'Here is a screenshot of the error I am seeing.',
                            ccEmails: 'support@example.com',
                            includePreviousMessages: true
                        }, [filePath] // Array of file paths
                        );
                        console.log('Response with attachment sent:', responseWithAttachment);
                    }
                    else {
                        console.log(`File not found at ${filePath}. Skipping attachment example.`);
                    }
                }
                catch (error) {
                    console.error('Error responding with attachment:', error);
                }
            }
            else {
                // Browser environment example
                console.log('Browser environment detected. For browser usage, you would:');
                console.log('1. Get files from an input element: document.getElementById("fileInput").files');
                console.log('2. Pass those File objects to respondToTicketWithAttachments');
                console.log('Example:');
                console.log(`
          // Get files from an input element
          const fileInput = document.getElementById('fileInput');
          const files = Array.from(fileInput.files);
          
          // Send response with attachments
          const response = await client.respondToTicketWithAttachments(
            {
              ticketId: "${ticketId}",
              message: "Here is a screenshot of the error I am seeing.",
              ccEmails: "support@example.com"
            },
            files
          );
        `);
            }
            // 7. Add a private note with attachments to a ticket
            console.log('\nAdding a private note with attachments to the ticket...');
            // Example for Node.js environment (using fs)
            if (typeof window === 'undefined') {
                try {
                    // Import fs only in Node.js environment
                    const fs = require('fs');
                    const path = require('path');
                    // Path to a file to upload as an attachment
                    const filePath = path.join(__dirname, 'example-attachment.png');
                    // Check if the file exists before attempting to upload
                    if (fs.existsSync(filePath)) {
                        const noteWithAttachment = await client.addNoteWithAttachmentsToTicket(ticketId, 'Internal note: This user has reported similar issues before. Attaching previous ticket data.', [filePath], // Array of file paths
                        true, // isPrivate (true for internal note)
                        'admin@example.com', // agentEmail
                        'team@example.com' // notifyEmails
                        );
                        console.log('Note with attachment added:', noteWithAttachment);
                    }
                    else {
                        console.log(`File not found at ${filePath}. Skipping attachment example.`);
                    }
                }
                catch (error) {
                    console.error('Error adding note with attachment:', error);
                }
            }
            else {
                // Browser environment example
                console.log('Browser environment detected. For browser usage with private notes, you would:');
                console.log('1. Get files from an input element: document.getElementById("fileInput").files');
                console.log('2. Pass those File objects to addNoteWithAttachmentsToTicket');
                console.log('Example:');
                console.log(`
          // Get files from an input element
          const fileInput = document.getElementById('fileInput');
          const files = Array.from(fileInput.files);
          
          // Add note with attachments
          const note = await client.addNoteWithAttachmentsToTicket(
            "${ticketId}",
            "Internal note: This user has reported similar issues before. Attaching previous ticket data.",
            files,
            true, // isPrivate (true for internal note)
            "admin@example.com", // agentEmail
            "team@example.com" // notifyEmails
          );
        `);
            }
        }
        // ==================
        // Admin operations
        // ==================
        // 1. List tickets assigned to an admin
        console.log('\nListing tickets assigned to admin...');
        const assignedTickets = await client.listAssignedTickets('admin@example.com', {
            status: types_1.TicketStatus.OPEN,
            sortBy: 'priority',
            sortOrder: 'desc'
        });
        console.log(`Found ${assignedTickets.total} tickets assigned to admin`);
        // 2. Assign a ticket to an admin
        if (userTickets.tickets.length > 0) {
            const ticketId = userTickets.tickets[0].id;
            console.log(`\nAssigning ticket ${ticketId} to admin...`);
            const assignedTicket = await client.assignTicket(ticketId, 'admin@example.com');
            console.log('Ticket assigned:', {
                id: assignedTicket.id,
                assignedTo: assignedTicket.assignedTo
            });
            // 3. Escalate the ticket - uses PUT as per Desk365 API
            console.log('\nEscalating the ticket...');
            const escalatedTicket = await client.escalateTicket(ticketId, types_1.TicketPriority.HIGH);
            console.log('Ticket escalated:', {
                id: escalatedTicket.id,
                priority: escalatedTicket.priority
            });
            // 4. Update multiple ticket properties at once
            console.log('\nUpdating ticket...');
            const updatedTicket = await client.updateTicket({
                ticketId: ticketId,
                status: types_1.TicketStatus.PENDING,
                priority: types_1.TicketPriority.HIGH,
                assignedTo: 'specialist@example.com'
            });
            console.log('Ticket updated:', updatedTicket);
            // 5. Close the ticket - uses PUT as per Desk365 API
            console.log('\nClosing the ticket...');
            const closedTicket = await client.closeTicket(ticketId);
            console.log('Ticket closed:', {
                id: closedTicket.id,
                status: closedTicket.status
            });
            // 6. Reopen the ticket - uses PUT as per Desk365 API
            console.log('\nReopening the ticket...');
            const reopenedTicket = await client.reopenTicket(ticketId);
            console.log('Ticket reopened:', {
                id: reopenedTicket.id,
                status: reopenedTicket.status
            });
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}
/**
 * Provider-agnostic approach using dependency injection
 * This shows how your code would be structured to easily switch providers
 */
class TicketService {
    constructor(supportApi) {
        this.supportApi = supportApi;
    }
    // User methods
    async createTicket(data) {
        return this.supportApi.createTicket(data);
    }
    async getUserTickets(userEmail) {
        return this.supportApi.listUserTickets(userEmail);
    }
    async getTicketDetails(ticketId) {
        return this.supportApi.getTicketDetails(ticketId);
    }
    async respondToTicket(data) {
        return this.supportApi.respondToTicket(data);
    }
    /**
     * Responds to a ticket with file attachments
     * @param data The ticket response request
     * @param attachments Array of file paths or File objects
     * @returns The created ticket message
     */
    async respondToTicketWithAttachments(data, attachments) {
        // If the underlying provider supports attachments directly
        if ('respondToTicketWithAttachments' in this.supportApi) {
            return this.supportApi.respondToTicketWithAttachments(data, attachments);
        }
        // Fallback if the provider doesn't support attachments directly
        // This is an example of how you could handle differences in provider capabilities
        console.warn('Current provider does not support attachments directly. ' +
            'Sending response without attachments.');
        return this.supportApi.respondToTicket(data);
    }
    /**
     * Adds a private note with attachments to a ticket
     * @param ticketId The ID of the ticket
     * @param note The content of the note
     * @param attachments Array of file paths or File objects
     * @param isPrivate Whether the note is private (defaults to true)
     * @param agentEmail The email of the agent adding the note
     * @param notifyEmails Comma-separated list of emails to notify
     * @returns The created note
     */
    async addNoteWithAttachments(ticketId, note, attachments, isPrivate = true, agentEmail, notifyEmails) {
        // If the underlying provider supports notes with attachments directly
        if ('addNoteWithAttachmentsToTicket' in this.supportApi) {
            return this.supportApi.addNoteWithAttachmentsToTicket(ticketId, note, attachments, isPrivate, agentEmail, notifyEmails);
        }
        // Fallback if the provider doesn't support notes with attachments
        console.warn('Current provider does not support notes with attachments directly. ' +
            'Adding note without attachments.');
        if ('addNoteToTicket' in this.supportApi) {
            return this.supportApi.addNoteToTicket(ticketId, note, isPrivate, agentEmail, notifyEmails);
        }
        // If the provider doesn't even support notes, fall back to a regular response
        console.warn('Current provider does not support notes. ' +
            'Sending as a regular response instead.');
        return this.supportApi.respondToTicket({
            ticketId,
            message: `Note: ${note}`,
        });
    }
    // Admin methods
    async assignTicket(ticketId, agentEmail) {
        return this.supportApi.assignTicket(ticketId, agentEmail);
    }
    async escalateTicket(ticketId, priority) {
        return this.supportApi.escalateTicket(ticketId, priority);
    }
    async updateTicket(data) {
        return this.supportApi.updateTicket(data);
    }
    async closeTicket(ticketId) {
        return this.supportApi.closeTicket(ticketId);
    }
}
/**
 * Example of how to set up and use the provider-agnostic service
 */
async function providerAgnosticExample() {
    // Create a Desk365 client
    const desk365Client = new client_1.Desk365Client({
        baseUrl: 'https://your-subdomain.desk365.io/apis',
        apiKey: process.env.DESK365_API_KEY || 'your-api-key'
    });
    // Create our service using the Desk365 client
    const ticketService = new TicketService(desk365Client);
    try {
        // Use the service for ticket operations
        const ticket = await ticketService.createTicket({
            subject: 'Test ticket',
            description: 'This is a test ticket',
            priority: types_1.TicketPriority.MEDIUM,
            userEmail: 'user@example.com'
        });
        console.log('Ticket created:', ticket);
        // Get tickets for a user
        const userTickets = await ticketService.getUserTickets('user@example.com');
        console.log(`Found ${userTickets.total} tickets for user`);
        if (userTickets.tickets.length > 0) {
            const ticketId = userTickets.tickets[0].id;
            // Get ticket details
            const details = await ticketService.getTicketDetails(ticketId);
            console.log('Ticket details retrieved');
            // Respond to the ticket
            await ticketService.respondToTicket({
                ticketId,
                message: 'This is a test response'
            });
            console.log('Response sent');
            // Example for handling attachments in Node.js environment
            if (typeof window === 'undefined') {
                try {
                    // Import fs only in Node.js environment
                    const fs = require('fs');
                    const path = require('path');
                    // Path to a file to upload as an attachment
                    const filePath = path.join(__dirname, 'example-attachment.png');
                    // Check if the file exists before attempting to upload
                    if (fs.existsSync(filePath)) {
                        // Respond with attachment
                        await ticketService.respondToTicketWithAttachments({
                            ticketId,
                            message: 'This is a response with an attachment'
                        }, [filePath]);
                        console.log('Response with attachment sent');
                        // Add a note with attachment
                        await ticketService.addNoteWithAttachments(ticketId, 'This is a private note with an attachment', [filePath], true, 'agent@example.com');
                        console.log('Note with attachment added');
                    }
                    else {
                        console.log(`File not found at ${filePath}. Skipping attachment examples.`);
                    }
                }
                catch (error) {
                    console.error('Error with attachments:', error);
                }
            }
            else {
                // Browser environment
                console.log('In a browser environment, you would get files from a file input');
                console.log('Example: const files = document.getElementById("fileInput").files');
                console.log('Then pass them to ticketService.respondToTicketWithAttachments or ticketService.addNoteWithAttachments');
            }
            // Update the ticket
            await ticketService.updateTicket({
                ticketId,
                status: types_1.TicketStatus.PENDING,
                priority: types_1.TicketPriority.HIGH
            });
            console.log('Ticket updated');
            // Close the ticket
            await ticketService.closeTicket(ticketId);
            console.log('Ticket closed');
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
}
/**
 * This example shows how easy it would be to switch providers in the future
 */
// Future code - when switching to a different provider
async function futureSwitchExample() {
    // Import the new provider
    // import { ZendeskClient } from './zendesk-client';
    // Create a comment to avoid TypeScript errors since ZendeskClient doesn't exist yet
    /*
    // Create a Zendesk client
    const zendeskClient = new ZendeskClient({
      baseUrl: 'https://your-subdomain.zendesk.com/api/v2',
      apiKey: process.env.ZENDESK_API_KEY || 'your-api-key'
    });
    
    // Use the same service with the new provider
    const ticketService = new TicketService(zendeskClient);
    
    // The rest of your code stays exactly the same!
    const ticket = await ticketService.createTicket({
      subject: 'Test ticket',
      description: 'This is a test ticket',
      priority: TicketPriority.MEDIUM,
      userEmail: 'user@example.com'
    });
    
    // Even attachments work the same way!
    if (typeof window === 'undefined') {
      const fs = require('fs');
      const path = require('path');
      const filePath = path.join(__dirname, 'example-attachment.png');
      
      if (fs.existsSync(filePath)) {
        // The exact same code for attachments - no changes needed
        await ticketService.respondToTicketWithAttachments(
          {
            ticketId: ticket.id,
            message: 'This is a response with an attachment'
          },
          [filePath]
        );
        
        // Behind the scenes, our TicketService will handle any
        // provider-specific logic for dealing with attachments
      }
    }
    */
    console.log('This example shows how you would switch providers in the future');
    console.log('The key advantage is that your application code would not change');
    console.log('Even complex operations like attachments would work the same way');
    console.log('The TicketService handles all provider-specific differences');
}
/**
 * Example of how to use the support API in a Next.js API route
 *
 * @param req - API request
 * @param res - API response
 */
async function ticketApiExample(req, res) {
    const { method } = req;
    // Create the support API client
    const supportApi = new client_1.Desk365Client({
        baseUrl: process.env.DESK365_API_URL || '',
        apiKey: process.env.DESK365_API_KEY || ''
    });
    try {
        switch (method) {
            case 'GET':
                // Get tickets for a user
                const { email, ticketId } = req.query;
                if (ticketId) {
                    // Get details for a specific ticket
                    const ticket = await supportApi.getTicketDetails(ticketId);
                    return res.status(200).json(ticket);
                }
                else if (email) {
                    // List tickets for a user
                    const tickets = await supportApi.listUserTickets(email);
                    return res.status(200).json(tickets);
                }
                else {
                    return res.status(400).json({ error: 'Email or ticketId required' });
                }
            case 'POST':
                // Create a new ticket
                const ticketData = req.body;
                const newTicket = await supportApi.createTicket(ticketData);
                return res.status(201).json(newTicket);
            case 'PUT':
                // Update or respond to a ticket
                const { action } = req.query;
                const updateData = req.body;
                if (action === 'respond') {
                    const response = await supportApi.respondToTicket(updateData);
                    return res.status(200).json(response);
                }
                else if (action === 'close') {
                    const closedTicket = await supportApi.closeTicket(updateData.ticketId);
                    return res.status(200).json(closedTicket);
                }
                else {
                    const updatedTicket = await supportApi.updateTicket(updateData);
                    return res.status(200).json(updatedTicket);
                }
            default:
                res.setHeader('Allow', ['GET', 'POST', 'PUT']);
                return res.status(405).end(`Method ${method} Not Allowed`);
        }
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
// Choose which example to run
// desk365Example().catch(console.error);
// providerAgnosticExample().catch(console.error);
// futureSwitchExample().catch(console.error);
exports.default = {
    desk365Example,
    providerAgnosticExample,
    futureSwitchExample
};
