---
title: API v2
tags:
  - project
status: planning
date_started: 2025-01-15
date_due: 2025-04-01
---

# API v2

Complete rewrite of REST API with GraphQL support and improved authentication.

## Goals
- Migrate from REST to GraphQL
- Implement OAuth2 authentication
- Add rate limiting and caching
- Improve documentation
- Backwards compatibility layer for v1

## Current Phase: Planning
- [x] Requirements gathering
- [x] Architecture design
- [ ] Security audit planning
- [ ] Database schema design
- [ ] API endpoint specification
- [ ] Choose GraphQL framework

## Technical Stack
- GraphQL (considering Apollo Server)
- PostgreSQL for primary data
- Redis for caching
- OAuth2 via Auth0
- Docker deployment

## Timeline
- Planning phase: Jan 15 - Feb 1
- Development: Feb 1 - Mar 15
- Testing: Mar 15 - Mar 25
- Launch: April 1, 2025

## Notes
- Currently in planning/research phase
- Shows in "Planning" section in Hyperdash
- Associated todo: setup-ci.md (blocked on this project)
- Medium-to-long term project
