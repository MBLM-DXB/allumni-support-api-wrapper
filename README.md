# Allumni Support API Wrapper

A provider-agnostic wrapper for support/helpdesk APIs. This library currently supports Desk365 as the backend provider but can be extended to support other providers in the future.

## Installation

This package is hosted in a private GitHub repository. To use it in your projects, follow these instructions:

### 1. Authentication Setup

Ensure you have access to the private repository and set up authentication using one of these methods:

#### SSH Authentication (Recommended)
```bash
# Make sure you have an SSH key set up with GitHub
# Test your SSH connection
ssh -T git@github.com
```

#### Personal Access Token
If you prefer HTTPS, create a Personal Access Token (PAT) with `repo` scope at [GitHub Settings](https://github.com/settings/tokens).

### 2. Installing the Package

#### Option A: Add to package.json directly
```json
"dependencies": {
  "allumni-support-api-wrapper": "git+ssh://git@github.com/mblm/allumni-support-api-wrapper.git"
}
```

For HTTPS with PAT (replace `YOUR_PAT` with your token):
```json
"dependencies": {
  "allumni-support-api-wrapper": "git+https://YOUR_PAT@github.com/mblm/allumni-support-api-wrapper.git"
}
```

Then run:
```bash
npm install
```

#### Option B: Install via command line
```bash
# Using SSH
npm install git+ssh://git@github.com/mblm/allumni-support-api-wrapper.git

# Using HTTPS with token
npm install git+https://YOUR_PAT@github.com/mblm/allumni-support-api-wrapper.git
```

#### Option C: Specify a specific version or branch
```bash
# Install a specific version tag
npm install git+ssh://git@github.com/mblm/allumni-support-api-wrapper.git#v1.0.0

# Install from a specific branch
npm install git+ssh://git@github.com/mblm/allumni-support-api-wrapper.git#develop
```

## Usage

### Basic Setup

```typescript
import { Desk365Client } from 'allumni-support-api-wrapper';

// Create a client instance
const supportClient = new Desk365Client({
  baseUrl: 'https://your-subdomain.desk365.io/apis',
  apiKey: 'your-api-key'
});

// Validate the configuration (new method)
try {
  const validation = await supportClient.validateConfig();
  if (validation.success) {
    console.log(validation.message);
  } else {
    console.error(validation.message);
  }
} catch (error) {
  console.error('Configuration validation failed:', error);
}
```

### Provider-Agnostic Approach

You can also use the provider-agnostic factory function:

```typescript
import createSupportApi, { SupportProvider, TicketPriority } from 'allumni-support-api-wrapper';

const supportApi = createSupportApi({
  provider: SupportProvider.DESK365,
  baseUrl: 'https://your-subdomain.desk365.io/apis',
  apiKey: 'your-api-key',
  verbose: true // Enable for detailed logging
});
```

### End User Operations

#### Create a Support Ticket

```typescript
const ticket = await supportClient.createTicket({
  subject: 'I need help with...',
  description: 'Detailed description of the issue',
  priority: TicketPriority.MEDIUM,
  userEmail: 'user@example.com'
});
```

#### List User's Tickets

```typescript
const tickets = await supportClient.listUserTickets('user@example.com', {
  page: 1,
  limit: 30,
  includeDescription: true
});
```

#### Get Ticket Details

```typescript
const ticketDetails = await supportClient.getTicketDetails('12345');
```

#### Respond to a Ticket

```typescript
const response = await supportClient.respondToTicket({
  ticketId: '12345',
  message: 'Additional information about my issue...'
});
```

#### Respond to a Ticket with Attachments

```typescript
// In Node.js environment (using file paths)
const response = await supportClient.respondToTicketWithAttachments({
  ticketId: '12345',
  message: 'Here are the requested files',
  agentEmail: 'agent@example.com'
}, [
  '/path/to/file1.pdf',
  '/path/to/screenshot.png'
]);

// In browser environment (using File objects)
const fileInput = document.querySelector('input[type="file"]');
const files = Array.from(fileInput.files);

const response = await supportClient.respondToTicketWithAttachments({
  ticketId: '12345',
  message: 'Here are the requested files'
}, files);
```

#### Add a Private Note with Attachments

```typescript
await supportClient.addNoteWithAttachmentsToTicket(
  '12345',
  'Internal note about the customer issue',
  ['/path/to/internal-doc.pdf'],
  true, // isPrivate
  'agent@example.com' // agentEmail
);
```

#### Close a Ticket

```typescript
const closedTicket = await supportClient.closeTicket('12345');
```

#### Reopen a Ticket

```typescript
const reopenedTicket = await supportClient.reopenTicket('12345');
```

### Admin Operations

#### List Assigned Tickets

```typescript
const assignedTickets = await supportClient.listAssignedTickets('admin@example.com', {
  page: 1,
  limit: 30
});
```

#### Assign a Ticket

```typescript
const assignedTicket = await supportClient.assignTicket('12345', 'agent@example.com');
```

#### Escalate a Ticket

```typescript
const escalatedTicket = await supportClient.escalateTicket('12345', TicketPriority.HIGH);
```

#### Update a Ticket

```typescript
const updatedTicket = await supportClient.updateTicket({
  ticketId: '12345',
  status: TicketStatus.PENDING,
  priority: TicketPriority.HIGH,
  assignedTo: 'specialist@example.com'
});
```

## Local Development

### Setting Up for Development

1. Clone the repository:
```bash
git clone git@github.com:mblm/allumni-support-api-wrapper.git
cd allumni-support-api-wrapper
```

2. Install dependencies:
```bash
npm install
```

3. Build the package:
```bash
npm run build
```

### Testing

#### Unit Tests

The library includes unit tests that can be run using Jest:

```bash
npm test
```

#### Manual Testing

To test with a real Desk365 API:

1. Copy the `.env.example` file to `.env` and fill in your Desk365 API credentials:

```bash
cp .env.example .env
```

2. Update the `.env` file with your actual values:

```
DESK365_API_URL=https://your-subdomain.desk365.io/apis
DESK365_API_KEY=your-api-key-here
TEST_USER_EMAIL=test@example.com
ADMIN_EMAIL=admin@example.com
```

3. Run the manual test script:

```bash
npm run test:manual
```

This will execute a series of API calls to test all the major functionality of the client.

4. For more detailed output, run with the verbose flag:

```bash
npm run test:manual -- --verbose
```

5. To capture detailed error logs to a file while keeping console output clean:

```bash
npm run test:manual -- --log-to-file
# or combine with verbose mode
npm run test:manual -- --verbose --log-to-file
```

This will create a log file in the `logs` directory with detailed error information while keeping the console output concise.

## Troubleshooting

### Known Desk365 API Issues

#### 403 Forbidden Error

If you receive a 403 Forbidden error with a message about access being forbidden, check:

1. **API Key and Subdomain**: Desk365 API keys are tied to specific subdomains. Ensure you're using the correct subdomain in your API URL and that the API key belongs to that subdomain.

2. **API Key Validity**: Verify that your API key is still valid and has not expired. You may need to regenerate it in the Desk365 admin panel.

#### 405 Method Not Allowed Error

If you receive a 405 Method Not Allowed error when trying to update tickets:

1. **API Documentation Discrepancy**: There may be discrepancies between the Desk365 API documentation and the actual implementation. The client includes fallback mechanisms to handle these cases.

2. **Alternative Approaches**: For operations that consistently fail, consider using the Desk365 web interface.

### Debug Logging

To enable detailed debug logs, initialize the client with the verbose option:

```typescript
const supportClient = new Desk365Client({
  baseUrl: 'https://your-subdomain.desk365.io/apis',
  apiKey: 'your-api-key',
  verbose: true
});
```

## Extending for Other Providers

To add support for a different helpdesk provider:

1. Create a new class that implements the `SupportApiInterface`
2. Map the provider-specific API calls to the generic interface methods
3. Handle all provider-specific data transformations within this class

Example:

```typescript
export class NewProviderClient implements SupportApiInterface {
  // Implement all required methods from SupportApiInterface
  // with provider-specific logic
}
```

4. Update the factory function to support the new provider:

```typescript
export function createSupportApi(config: SupportApiConfig): SupportApiInterface {
  switch (config.provider) {
    case SupportProvider.DESK365:
      return new Desk365Client({ /* config */ });
    case SupportProvider.NEW_PROVIDER:
      return new NewProviderClient({ /* config */ });
    default:
      throw new Error(`Unsupported support provider: ${config.provider}`);
  }
}
```

## Desk365 API Integration

This package provides an integration with the Desk365 API to manage support tickets.

### API Limitations

During the implementation and testing of this package, we've discovered several important details about the Desk365 API:

#### Working Operations

✅ **Authentication** - Works with the `Authorization` header (not `X-Api-Key`)  
✅ **Creating Tickets** - Works via GET request with query parameters  
✅ **Listing Tickets** - Works for retrieving user tickets  
✅ **Getting Ticket Details** - Works for retrieving ticket details  
✅ **Responding to Tickets** - Works via POST request to `/v3/tickets/add_reply`  
✅ **Adding Notes** - Works via POST request to `/v3/tickets/add_note`  
✅ **Updating Ticket Status** - Works via PUT request to `/v3/tickets/update` with status in request body  
✅ **Changing Ticket Priority** - Works via PUT request to `/v3/tickets/update` with priority in request body  
✅ **Closing/Reopening Tickets** - Works via PUT request to `/v3/tickets/update` with status 'closed' or 'open'  
✅ **File Attachments** - Works for both responses and notes with the appropriate endpoints  
✅ **Assigning Tickets** - Works via PUT request with the correct field name (`assign_to`) 