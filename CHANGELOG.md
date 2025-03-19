# Changelog

All notable changes to the Allumni Support API Wrapper will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-03-19

### Added
- Initial release of the Allumni Support API Wrapper with Desk365 provider
- Provider-agnostic interface via `SupportApiInterface` 
- Factory function for creating clients
- Desk365Client implementation with:
  - Authentication and validation
  - Ticket creation
  - Ticket listing (user tickets, assigned tickets)
  - Ticket details retrieval
  - Ticket responses and notes
  - File attachment support (for both responses and notes)
  - Ticket status management (close, reopen)
  - Ticket priority management (escalation)
  - Ticket assignment
- Comprehensive error handling and debugging options
- Manual testing scripts and utilities
- Documentation for installation and usage 