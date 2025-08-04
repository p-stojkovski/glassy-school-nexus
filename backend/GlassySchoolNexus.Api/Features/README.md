# Features Directory

This directory contains all feature implementations following the Vertical Slice Architecture pattern.

## Structure

Each feature is organized as a self-contained vertical slice with all artifacts collocated:

```
Features/
├── [Entity][Action]/
│   ├── [Action]Endpoint.cs         # HTTP boundary
│   ├── [Action]Command.cs          # Write operations
│   ├── [Action]Query.cs            # Read operations  
│   ├── [Action]Request.cs          # Input contracts
│   ├── [Action]Response.cs         # Output contracts
│   ├── [Action]Validator.cs        # Validation logic
│   └── README.md                   # Feature documentation
```

## Isolation Rules

- No direct references between feature folders
- No shared request/response models across slices
- Shared project contains only cross-cutting infrastructure

## Request Flow Contract

All features must follow this contract:
**Endpoint → Validation → Command/Query → DB → Result → HTTP**

## Example

For a "Get Student By ID" feature:
- Folder: `StudentGetById/`
- Files: `GetByIdEndpoint.cs`, `GetByIdQuery.cs`, `GetByIdRequest.cs`, `GetByIdResponse.cs`, `GetByIdValidator.cs`, `README.md`