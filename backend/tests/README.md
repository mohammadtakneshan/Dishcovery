# Backend Tests

This directory contains tests for the Dishcovery backend API.

## Running Tests

```bash
cd backend
pytest tests/
```

## Test Coverage

```bash
pytest tests/ --cov=. --cov-report=html
```

## Writing Tests

Follow the existing patterns in `test_app.py` and add new test files as needed.
