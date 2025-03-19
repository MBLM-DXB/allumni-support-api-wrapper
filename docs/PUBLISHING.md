# Publishing Guide

This document outlines the process for maintaining, versioning, and publishing updates to the Allumni Support API Wrapper package via a private GitHub repository.

## Setting Up the Private Repository

1. Create a private repository on GitHub:
   - Go to GitHub.com
   - Click "New" to create a new repository
   - Name it `allumni-support-api-wrapper`
   - Select "Private"
   - Initialize with a README
   - Create the repository

2. Connect your local repository:
   ```bash
   # If starting from scratch with a new local repo
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:mblm/allumni-support-api-wrapper.git
   git push -u origin main
   
   # If you already have a local repo
   git remote add origin git@github.com:mblm/allumni-support-api-wrapper.git
   git push -u origin main
   ```

## Versioning and Releasing

This package follows [Semantic Versioning](https://semver.org/) (SemVer):
- MAJOR version for incompatible API changes
- MINOR version for added functionality in a backward compatible manner
- PATCH version for backward compatible bug fixes

### Creating a New Release

1. Make your code changes and commit them:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

2. Update the version:
   ```bash
   # For a patch update (bug fixes)
   npm version patch
   
   # For a minor update (new features, backward compatible)
   npm version minor
   
   # For a major update (breaking changes)
   npm version major
   ```

   This will:
   - Update the version in package.json
   - Create a git tag for the version
   - Commit the change
   - Push the commit and tag to GitHub (due to the postversion script)

3. The package is now available for installation via the GitHub repository URL with the specific version tag:
   ```bash
   npm install git+ssh://git@github.com:mblm/allumni-support-api-wrapper.git#v1.2.3
   ```

## Development Workflow

### Working with Branches

For larger features or changes, use feature branches:

```bash
# Create a new branch
git checkout -b feature/new-provider

# Make changes...

# Commit changes
git add .
git commit -m "Add new provider support"

# Push to GitHub
git push -u origin feature/new-provider
```

Then create a pull request on GitHub to merge into the main branch.

### Updating Existing Projects

When you release a new version, projects using this package will need to update:

1. If they've specified a version tag:
   ```bash
   # Update package.json to point to the new version
   "dependencies": {
     "allumni-support-api-wrapper": "git+ssh://git@github.com/mblm/allumni-support-api-wrapper.git#v1.2.3"
   }
   ```

2. If they're using the latest from the main branch:
   ```bash
   # They can simply run
   npm update allumni-support-api-wrapper
   ```

## Managing Access

1. Go to your repository on GitHub
2. Navigate to Settings > Access > Collaborators
3. Click "Add people" and enter the username, full name, or email of the team member

## Best Practices

1. **Documentation**: Keep the README.md and example files up to date
2. **Testing**: Add tests for any new functionality
3. **Changelog**: Maintain a CHANGELOG.md file to document changes between versions
4. **Breaking Changes**: Clearly document any breaking changes in the release notes
5. **Dependencies**: Regularly update dependencies to ensure security and compatibility 