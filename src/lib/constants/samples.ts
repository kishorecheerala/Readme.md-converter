export interface SampleDoc {
  id: string;
  name: string;
  category: string;
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'technical-readme',
    name: 'Technical README',
    category: 'Developer',
    content: `# Enterprise Core Engine 🚀

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-98%25-blue)
![License](https://img.shields.io/badge/license-MIT-purple)
![Version](https://img.shields.io/badge/version-v2.4.0-orange)

An ultra-performant, scalable, asynchronous microservice framework built for high-throughput enterprise event streaming.

---

## Key Features

- **Sub-millisecond Latency**: Optimized for real-time telemetry processing.
- **Zero Configuration Setup**: Automatic peer discovery and payload serialization.
- **Resilient Circuit Breaker**: Built-in retry mechanisms and dead-letter queues.
- **Mathematical Performance Metrics**: Verified algorithm guarantees.

---

## Architecture Overview

\`\`\`mermaid
flowchart TD
    Client[Web & Mobile Clients] --> Gateway[API Gateway Layer]
    Gateway --> IngestionService[Ingestion Microservice]
    IngestionService --> MessageQueue[(Kafka Message Bus)]
    MessageQueue --> Worker1[Analytics Worker]
    MessageQueue --> Worker2[Notification Worker]
    Worker1 --> Database[(PostgreSQL DB)]
    Worker2 --> Redis[(Redis Cache)]
\`\`\`

---

## Mathematical Guarantees

The routing engine guarantees an upper bound on memory consumption bounded by:

$$ M(n) = \\mathcal{O}\\left(n \\log n\\right) + \\sum_{i=1}^{k} \\lambda_i $$

Where $n$ represents the total active connection nodes and $\\lambda_i$ denotes buffer allocation size.

---

## Quick Start Code

\`\`\`typescript
import { CoreEngine, ClusterMode } from '@enterprise/core';

async function bootstrap() {
  const engine = new CoreEngine({
    mode: ClusterMode.HIGH_AVAILABILITY,
    maxRetries: 5,
    timeoutMs: 3000,
  });

  await engine.connect();
  console.log('🚀 Core Engine active on port 8080');
}

bootstrap().catch(console.error);
\`\`\`

---

## System Performance Matrix

| Node Type | Throughput (req/s) | P99 Latency (ms) | Memory Alloc (MB) | Status |
| :--- | :--- | :--- | :--- | :--- |
| Gateway | 120,000 | 1.2ms | 256 MB | Operational |
| Ingestion | 95,000 | 2.1ms | 512 MB | Operational |
| Analytics | 45,000 | 4.8ms | 1024 MB | Operational |
| Database | 30,000 | 8.5ms | 2048 MB | Operational |

> **Note**: Benchmark measurements were conducted using 64-core ARM virtual nodes with 10Gbps dedicated backplane network connectivity.
`,
  },
  {
    id: 'api-docs',
    name: 'API Specification',
    category: 'Documentation',
    content: `# Payment Gateway REST API v3

![API Status](https://img.shields.io/badge/api-v3.0.1-blue)
![Uptime](https://img.shields.io/badge/uptime-99.99%25-brightgreen)

Welcome to the official **Payment Gateway API** documentation.

---

## Authentication

All REST API requests require a valid Bearer Token in the HTTP Authorization header:

\`\`\`bash
Authorization: Bearer sec_key_9f8a7b6c5d4e3f2a1
\`\`\`

---

## Endpoints

### 1. Create Charge

\`POST /v3/charges\`

#### Request Headers
- \`Content-Type: application/json\`
- \`Idempotency-Key: string\`

#### Request Payload
\`\`\`json
{
  "amount": 4999,
  "currency": "usd",
  "customer_id": "cus_99182a",
  "description": "Monthly Enterprise Subscription",
  "metadata": {
    "order_id": "ORD-2026-8812"
  }
}
\`\`\`

#### Response \`201 Created\`
\`\`\`json
{
  "id": "ch_3M19a82Lk",
  "object": "charge",
  "amount": 4999,
  "currency": "usd",
  "paid": true,
  "status": "succeeded",
  "created": 1774392000
}
\`\`\`

---

## Transaction Lifecycle

\`\`\`mermaid
sequenceDiagram
    autonumber
    Client->>API Gateway: POST /v3/charges
    API Gateway->>Fraud Engine: Evaluate Risk Score
    Fraud Engine-->>API Gateway: Risk Passed (0.02)
    API Gateway->>Payment Network: Authorize Amount
    Payment Network-->>API Gateway: Approved (Auth #88219)
    API Gateway-->>Client: 201 Created (charge_id)
\`\`\`
`,
  },
  {
    id: 'academic-paper',
    name: 'Academic Paper',
    category: 'Publication',
    content: `# Asynchronous Convergence in Distributed Consensus Protocols

**Dr. Eleanor Vance & Prof. Marcus Sterling**  
*Department of Computer Science, Institute of Advanced Technology*

---

## Abstract

Distributed consensus remains a cornerstone of fault-tolerant systems. In this paper, we propose **AsyncPaxos+**, an enhanced consensus algorithm that achieves deterministic convergence under partial synchrony with zero message complexity degradation.

---

## Introduction

Modern cloud architectures demand high availability across geo-replicated data centers. Classical consensus protocols suffer from latency spikes during network partitions:

$$ L(t) = \\int_{0}^{T} \\sigma(t) \\cdot \\Phi(t) \\, dt $$

Where $\\sigma(t)$ models packet loss density and $\\Phi(t)$ represents round-trip latency.

---

## Experimental Protocol

Algorithms were evaluated across 500 simulated nodes over 72 continuous hours.

\`\`\`python
def calculate_consensus_convergence(nodes, network_latency):
    total_consensus_time = 0
    for node in nodes:
        time_to_vote = node.round_trip + network_latency
        total_consensus_time += time_to_vote
    return total_consensus_time / len(nodes)
\`\`\`

| Protocol Variant | Mean Latency (ms) | Fault Tolerance | Consensus Rounds |
| :--- | :--- | :--- | :--- |
| Standard Paxos | 42.5ms | $f < n/2$ | 3.2 rounds |
| Raft | 38.1ms | $f < n/2$ | 2.8 rounds |
| AsyncPaxos+ (Ours) | **19.4ms** | $f < n/2$ | **1.4 rounds** |

---

## Conclusion

AsyncPaxos+ reduces round-trip delays by **54.3%** while guaranteeing safety against arbitrary message reordering.
`,
  },
  {
    id: 'corporate-report',
    name: 'Corporate Progress Report',
    category: 'Enterprise',
    content: `# Q3 Engineering & Product Strategy Report

**Prepared by:** Engineering Leadership Team  
**Date:** July 2026  
**Classification:** Internal & Confidential

---

## Executive Summary

During Q3, the engineering organization successfully completed 4 major product milestones, increased system uptime to **99.995%**, and reduced cloud operational costs by **18.2%**.

---

## Quarterly Metrics Snapshot

- **Active Monthly Users**: 1,450,000 (+22% YoY)
- **API Requests Served**: 4.2 Billion
- **Mean Time to Recovery (MTTR)**: 3.8 Minutes
- **Engineering Headcount**: 84 Full-Time Engineers

---

## Project Timeline

\`\`\`mermaid
gantt
    title Q3 Roadmap Execution
    dateFormat  YYYY-MM-DD
    section Infrastructure
    Migration to Kubernetes     :done, 2026-07-01, 2026-07-15
    Database Sharding Phase 1  :active, 2026-07-10, 2026-07-25
    section AI Integration
    Document Analyzer Launch    :done, 2026-07-05, 2026-07-18
    Auto-Summarizer Module      :2026-07-20, 2026-07-31
\`\`\`

---

## Financial Efficiency Matrix

| Infrastructure Component | Q2 Spend ($) | Q3 Spend ($) | Variance (%) |
| :--- | :--- | :--- | :--- |
| Compute Instances | $45,200 | $36,800 | -18.6% |
| Database Storage | $28,400 | $23,100 | -18.7% |
| CDN & Networking | $14,100 | $12,500 | -11.3% |
| **Total Expenditure** | **$87,700** | **$72,400** | **-17.4%** |

> **Recommendation**: Reallocate cost savings toward AI infrastructure and high-availability database cluster expansions in Q4.
`,
  },
];
