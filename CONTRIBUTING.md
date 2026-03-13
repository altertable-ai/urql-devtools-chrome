# Contributing

Thank you for your interest in contributing to URQL DevTools Chrome Extension!

## Project Scope

This is a **focused, minimal tool** designed to provide basic cache visualization for URQL. It is intentionally kept simple and is not intended to grow into a feature-rich devtools suite.

### What We Accept

- **Bug fixes**: Issues that prevent the extension from working correctly
- **Small improvements**: Minor UX enhancements, performance optimizations, or code quality improvements
- **Documentation**: Clarifications, corrections, or helpful additions to docs
- **Compatibility updates**: Keeping the extension working with new Chrome/URQL versions

### What We Don't Accept

- **Major new features**: Event timelines, request tools, or other complex functionality
- **Framework support**: This extension is Chrome-only (not Firefox, Edge, etc.)
- **Significant UI overhauls**: The current UI is intentionally simple

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in the [Issues](../../issues) section
2. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Chrome version and URQL version

### Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b fix/your-bug-fix`
3. Make your changes
4. Test locally:
   ```bash
   npm install
   npm run build
   # Load the extension in Chrome and test
   ```
5. Commit with a clear message: `git commit -m "Fix: description of fix"`
6. Push to your fork: `git push origin fix/your-bug-fix`
7. Open a Pull Request with:
   - Description of the change
   - Why it's needed
   - How you tested it

## Development Setup

See the [Development](README.md#development) section in the README.

## Questions?

Open an issue for discussion before starting work on significant changes.
