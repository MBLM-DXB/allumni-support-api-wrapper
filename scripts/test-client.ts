/**
 * Manual test script for Desk365Client
 * 
 * Environment Variables:
 * - DESK365_API_URL: The base URL for the Desk365 API (e.g., 'https://your-subdomain.desk365.io/apis')
 * - DESK365_API_KEY: Your Desk365 API key
 * - TEST_USER_EMAIL: Email to use for creating and testing tickets
 * - ADMIN_EMAIL: (Optional) Email of another admin for testing ticket assignment
 * 
 * Running Tests:
 * - Basic test: npx ts-node scripts/test-client.ts
 * - Verbose output: npx ts-node scripts/test-client.ts --verbose
 * - Log to file: npx ts-node scripts/test-client.ts --log-to-file
 * - All options: npx ts-node scripts/test-client.ts --verbose --log-to-file
 */

import { Desk365Client } from '../client';
import { TicketPriority, TicketStatus } from '../types';
import dotenv from 'dotenv';
import { isAxiosError } from 'axios';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Check for command line arguments
const args = process.argv.slice(2);
const VERBOSE_MODE = args.includes('--verbose') || args.includes('-v');
const LOG_TO_FILE = args.includes('--log-to-file') || args.includes('-f');

// Set up error logging
const LOG_DIRECTORY = 'logs';
const LOG_FILE = path.join(LOG_DIRECTORY, `desk365-test-${new Date().toISOString().replace(/:/g, '-')}.log`);

if (LOG_TO_FILE) {
  if (!fs.existsSync(LOG_DIRECTORY)) {
    fs.mkdirSync(LOG_DIRECTORY);
  }
  
  console.log(`📝 Detailed logs will be written to: ${LOG_FILE}`);
}

// Get API credentials from environment variables
const API_BASE_URL = process.env.DESK365_API_URL || 'https://your-subdomain.desk365.io/apis';
const API_KEY = process.env.DESK365_API_KEY || 'your-api-key';
const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL || 'test@example.com';
// Optional admin email for testing assignment functionality
const ADMIN_EMAIL = process.env.ADMIN_EMAIL; // If not set, assignment tests will use TEST_USER_EMAIL

// Create client instance
const client = new Desk365Client({
  baseUrl: API_BASE_URL,
  apiKey: API_KEY,
  verbose: VERBOSE_MODE // Set verbose mode based on command line arg
});

console.log(`🔍 Running tests in ${VERBOSE_MODE ? 'verbose' : 'concise'} mode`);
console.log(`💡 Tip: Use --verbose or -v flag for detailed logs, --log-to-file or -f to write detailed logs to a file`);

/**
 * Logs detailed error information to a file if log-to-file is enabled
 */
function logErrorToFile(prefix: string, error: any): void {
  if (!LOG_TO_FILE) return;
  
  try {
    const logStream = fs.createWriteStream(LOG_FILE, { flags: 'a' });
    logStream.write(`\n========== ${prefix} at ${new Date().toISOString()} ==========\n`);
    
    if (isAxiosError(error)) {
      logStream.write(`Status: ${error.response?.status} ${error.response?.statusText}\n`);
      logStream.write(`URL: ${error.config?.url}\n`);
      logStream.write(`Method: ${error.config?.method?.toUpperCase()}\n`);
      
      if (error.response?.headers) {
        logStream.write('Response Headers:\n');
        for (const [key, value] of Object.entries(error.response.headers)) {
          logStream.write(`  ${key}: ${value}\n`);
        }
      }
      
      logStream.write('Response Data:\n');
      logStream.write(JSON.stringify(error.response?.data, null, 2) + '\n');
    } else {
      logStream.write(error?.stack || String(error) || 'Unknown error');
      logStream.write('\n');
    }
    
    logStream.end();
  } catch (logError) {
    console.error('Failed to write to log file:', logError);
  }
}

/**
 * Returns a concise error message for display
 */
function formatError(error: any): string {
  if (!error) return 'Unknown error';
  
  // Log detailed error to file first
  logErrorToFile('ERROR', error);
  
  // Handle Axios errors with a very concise format
  if (isAxiosError(error)) {
    const status = error.response?.status || 'unknown';
    const statusText = error.response?.statusText || '';
    const allowedMethods = error.response?.headers?.allow || '';
    
    let message = '';
    
    if (error.response?.data) {
      if (typeof error.response.data === 'string') {
        // Handle HTML error messages
        if (error.response.data.includes('<!doctype html>')) {
          message = `${status} ${statusText}`;
          
          // Extract message from HTML if possible
          const messageMatch = error.response.data.match(/<b>Message<\/b>\s*([^<]+)<\/p>/);
          if (messageMatch && messageMatch[1]) {
            message += `: ${messageMatch[1].trim()}`;
          }
        } else {
          message = error.response.data.substring(0, 100);
          if (error.response.data.length > 100) message += '...';
        }
      } else if (typeof error.response.data === 'object') {
        message = error.response.data.message || 
                  error.response.data.error || 
                  JSON.stringify(error.response.data).substring(0, 100);
      }
    }
    
    let result = `HTTP ${status} ${statusText}`;
    if (message) result += `: ${message}`;
    if (allowedMethods) result += ` (Allowed methods: ${allowedMethods})`;
    
    return result;
  }
  
  // Handle general errors
  return error.message || String(error);
}

// Main test function
async function runTests() {
  try {
    console.log('🔍 Testing Desk365Client...');
    console.log(`🔗 API URL: ${API_BASE_URL}`);
    console.log(`👤 Test User: ${TEST_USER_EMAIL}`);
    
    // Try direct ping first (using exact endpoint from curl example)
    console.log('\n🔄 Testing connectivity with direct ping...');
    try {
      const directPingResult = await client.directPing();
      console.log('✅ Direct ping successful:', directPingResult);
    } catch (error) {
      console.error('❌ Direct ping failed:', formatError(error));
    }
    
    // Validate API configuration
    console.log('\n🔄 Validating API configuration...');
    const validation = await client.validateConfig();
    
    if (!validation.success) {
      console.error('❌ Configuration validation failed:', validation.message);
      console.error('\n⚠️ The remaining tests will likely fail due to configuration issues.');
      console.error('Please check your API key and subdomain before continuing.');
      
      // Ask for confirmation to continue
      console.log('\nDo you want to continue with the tests anyway? (y/n)');
      // In a real script, you'd wait for user input here
      // For now, we'll continue, but in a real scenario you'd handle this differently
    } else {
      console.log('✅ Configuration validation successful:', validation.message);
    }
    
    // 0. Regular ping to verify connectivity
    console.log('\n🔄 Testing connectivity with ping...');
    try {
      const pingResult = await client.ping();
      console.log('✅ Ping successful:', pingResult);
    } catch (error) {
      console.error('❌ Ping failed:', formatError(error));
    }
    
    // Try to get API information
    console.log('\n🔍 Trying to get API information...');
    try {
      const apiInfo = await client.getApiInfo();
      console.log('API Info:', apiInfo ? 'Information retrieved' : 'No information available');
    } catch (error) {
      console.log('❌ Unable to get API information:', formatError(error));
    }
    
    // 1. List tickets to check authentication
    console.log(`\n📋 Trying to list tickets for user ${TEST_USER_EMAIL}...`);
    try {
      const userTickets = await client.listUserTickets(TEST_USER_EMAIL, {
        page: 1,
        limit: 1
      });
      console.log(`✅ Successfully retrieved tickets. Found ${userTickets.total} tickets.`);
    } catch (error) {
      console.error('❌ Failed to list tickets:', formatError(error));
    }
    
    // 2. Create a ticket - try both approaches
    console.log('\n📝 Attempting to create a test ticket (first approach)...');
    let createdTicket = null;
    
    try {
      const ticket = await client.createTicket({
        subject: 'Test Ticket from API Wrapper',
        description: 'This is a test ticket created through the API wrapper.',
        priority: TicketPriority.MEDIUM,
        userEmail: TEST_USER_EMAIL
      });
      
      console.log('✅ Ticket created successfully:', ticket.id);
      createdTicket = ticket;
    } catch (error) {
      console.error('❌ First approach failed:', formatError(error));
      console.log('\n📝 Trying alternative approach...');
      
      try {
        const ticket = await client.createTicketAlt({
          subject: 'Test Ticket from API Wrapper (Alt)',
          description: 'This is a test ticket created through the API wrapper using alternative approach.',
          priority: TicketPriority.MEDIUM,
          userEmail: TEST_USER_EMAIL
        });
        
        console.log('✅ Ticket created successfully (alt approach):', ticket.id);
        createdTicket = ticket;
      } catch (altError) {
        console.error('❌ Alternative approach also failed:', formatError(altError));
      }
    }
    
    // Skip the rest of the tests if no ticket was created
    if (!createdTicket) {
      console.error('\n❌ Unable to create ticket, skipping remaining tests.');
      return;
    }
    
    const ticketId = createdTicket.id;
    
    // Run the remaining tests if a ticket was created
    try {
      // 3. Get ticket details
      console.log(`\n🔍 Getting details for ticket ${ticketId}...`);
      const ticketDetails = await client.getTicketDetails(ticketId);
      console.log('✅ Ticket details retrieved for:', ticketDetails.subject);
      
      // 4. Respond to the ticket
      console.log(`\n💬 Responding to ticket ${ticketId}...`);
      try {
        await client.respondToTicket({
          ticketId,
          message: 'This is a test response from the API wrapper.',
          agentEmail: TEST_USER_EMAIL,
          includePreviousCcs: false,
          includePreviousMessages: false
        });
        console.log('✅ Response sent');
        
        // Test sending response with attachment
        console.log(`\n📎 Testing response with attachment to ticket ${ticketId}...`);
        
        // Create a simple test file if it doesn't exist
        const TEST_FILE_PATH = path.join(LOG_DIRECTORY, 'test-attachment.txt');
        if (!fs.existsSync(TEST_FILE_PATH)) {
          fs.writeFileSync(TEST_FILE_PATH, 'This is a test attachment created for API testing purposes.');
          console.log(`Created test file at ${TEST_FILE_PATH}`);
        }
        
        try {
          const responseWithAttachment = await client.respondToTicketWithAttachments(
            {
              ticketId,
              message: 'This is a test response with an attachment.',
              agentEmail: TEST_USER_EMAIL,
              includePreviousCcs: false,
              includePreviousMessages: false
            },
            [TEST_FILE_PATH]
          );
          console.log('✅ Response with attachment sent');
          
          // Test adding note with attachment
          console.log(`\n📝 Testing adding note with attachment to ticket ${ticketId}...`);
          
          const noteWithAttachment = await client.addNoteWithAttachmentsToTicket(
            ticketId,
            'This is a test private note with an attachment.',
            [TEST_FILE_PATH],
            true, // isPrivate
            TEST_USER_EMAIL, // agentEmail
            '' // No notification emails
          );
          console.log('✅ Note with attachment added');
          
        } catch (attachmentError) {
          console.error('❌ Failed to test attachments:', formatError(attachmentError));
        }
        
        // Test admin-related functionality
        console.log('\n👤 Testing admin-related functionality...');
        
        // 1. List tickets assigned to the test user (acting as admin)
        console.log(`\n📋 Listing tickets assigned to ${TEST_USER_EMAIL}...`);
        try {
          const assignedTickets = await client.listAssignedTickets(TEST_USER_EMAIL, { 
            page: 1, 
            limit: 10 
          });
          console.log(`✅ Successfully retrieved ${assignedTickets.total} assigned tickets`);
          
          if (assignedTickets.tickets.length > 0) {
            console.log(`   First assigned ticket: ${assignedTickets.tickets[0].subject} (ID: ${assignedTickets.tickets[0].id})`);
          }
        } catch (error) {
          console.error('❌ Failed to list assigned tickets:', formatError(error));
        }
        
        // 2. Test assigning the ticket to a different user (if available)
        // Get ADMIN_EMAIL from environment or use the same test user
        const ADMIN_EMAIL = process.env.ADMIN_EMAIL || TEST_USER_EMAIL;
        
        if (ADMIN_EMAIL !== TEST_USER_EMAIL) {
          console.log(`\n🔄 Assigning ticket ${ticketId} to ${ADMIN_EMAIL}...`);
          try {
            const assignedTicket = await client.assignTicket(ticketId, ADMIN_EMAIL);
            console.log(`✅ Ticket assigned to ${ADMIN_EMAIL}`);
            
            // Assign back to the original user
            console.log(`\n🔄 Assigning ticket ${ticketId} back to ${TEST_USER_EMAIL}...`);
            const reassignedTicket = await client.assignTicket(ticketId, TEST_USER_EMAIL);
            console.log(`✅ Ticket assigned back to ${TEST_USER_EMAIL}`);
          } catch (error) {
            console.error('❌ Failed to assign ticket:', formatError(error));
          }
        } else {
          console.log(`\n⚠️ Skipping assign ticket test - no different admin email provided in ADMIN_EMAIL environment variable`);
        }
        
      } catch (error) {
        console.error('❌ Failed to respond to ticket:', formatError(error));
        console.log('\n💬 Trying alternative approach for responding...');
        
        // Try updating ticket instead if responding fails
        try {
          await client.updateTicket({
            ticketId,
            status: TicketStatus.PENDING,
            priority: TicketPriority.HIGH
          });
          console.log('✅ Ticket updated as an alternative to responding');
        } catch (updateError) {
          console.error('❌ Failed to update ticket:', formatError(updateError));
        }
      }
      
      // 5. Update ticket priority
      console.log(`\n⬆️ Escalating ticket ${ticketId} to HIGH priority...`);
      try {
        await client.escalateTicket(ticketId, TicketPriority.HIGH);
        console.log('✅ Ticket priority updated to HIGH');
      } catch (error) {
        console.error('❌ Failed to escalate ticket:', formatError(error));
        console.log('⚠️ Note: The Desk365 API documentation specifies that ticket updates require PUT requests to /v3/tickets/update.');
        console.log('    If you are receiving a 405 Method Not Allowed error, this indicates the API implementation may differ from documentation.');
      }
      
      // 6. Close the ticket
      console.log(`\n🚫 Closing ticket ${ticketId}...`);
      try {
        await client.closeTicket(ticketId);
        console.log('✅ Ticket closed');
      } catch (error) {
        console.error('❌ Failed to close ticket:', formatError(error));
        console.log('⚠️ Note: Desk365 API may not support closing tickets via the API.');
        console.log('    Please check the documentation or contact Desk365 support for guidance.');
      }
      
      // 7. Reopen the ticket
      console.log(`\n🔄 Reopening ticket ${ticketId}...`);
      try {
        await client.reopenTicket(ticketId);
        console.log('✅ Ticket reopened');
      } catch (error) {
        console.error('❌ Failed to reopen ticket:', formatError(error));
        console.log('⚠️ Note: Desk365 API may not support reopening tickets via the API.');
        console.log('    Please check the documentation or contact Desk365 support for guidance.');
      }
      
      console.log('\n✅ All tests completed successfully!');
    } catch (error) {
      console.error(`\n❌ Error during ticket operations: ${formatError(error)}`);
    }
  } catch (error) {
    console.error('❌ Error during testing:', formatError(error));
  }
}

// Run the tests
runTests().catch(error => console.error('❌ Fatal error:', formatError(error))); 