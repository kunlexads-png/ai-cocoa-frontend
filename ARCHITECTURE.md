
# Architecture & Deployment Guide

## Overview

This document outlines the practical infrastructure, deployment stack, and architectural decisions for the AI Processing Plant Dashboard. The system is designed for high availability, real-time data processing, and secure enterprise integration.

## 1. Frontend Architecture

*   **Framework**: React 18 + TypeScript + Vite.
*   **Styling**: Tailwind CSS for utility-first styling.
*   **State Management**: React Context + Custom Hooks (e.g., `useStream`, `useQueue`).
*   **Data Visualization**: Recharts for responsive SVG charting.
*   **Streaming**: Socket.IO Client (simulated in `services/streamService.ts`).
*   **Build Artifact**: Static Single Page Application (SPA).

## 2. Recommended Deployment Stack

### Frontend Hosting
*   **Platform**: Vercel or Netlify.
    *   *Why*: Edge caching, automatic CI/CD from Git, and immediate rollbacks.
*   **Alternative**: AWS S3 + CloudFront (for strict VPC requirements).

### Backend & API
*   **Service**: Node.js (Express) or Python (FastAPI).
*   **Hosting**: AWS ECS (Fargate) or Fly.io.
    *   *Why*: Containerized, scalable compute without managing servers.
*   **Communication**: 
    *   REST for standard CRUD (Batch management, User settings).
    *   WebSockets (Socket.IO) for real-time sensor streams.

### Database Layer
*   **Relational (Metadata)**: PostgreSQL (v14+).
    *   *Tables*: Batches, Users, Compliance Docs.
*   **Time-Series (Sensors)**: TimescaleDB (on top of Postgres) or InfluxDB.
    *   *Why*: Specialized for high-frequency sensor writes (Temperature, Moisture, Vibration).

### AI & Model Inference
*   **Hosting**: 
    *   *Lightweight Models*: ONNX Runtime (Node.js) sidecar.
    *   *Heavy Models (Computer Vision)*: TorchServe on GPU instances (AWS g4dn.xlarge) or SageMaker Endpoints.
*   **LLM Integration**: Google Gemini API (via Vertex AI for enterprise privacy).

### Storage
*   **Object Storage**: AWS S3 or Google Cloud Storage.
    *   *Usage*: Storing intake images, generated PDF reports, and raw sensor logs.

### Authentication
*   **Identity Provider**: Auth0 or AWS Cognito.
*   **Integration**: OIDC / SAML connection to Enterprise Active Directory (Azure AD / Google Workspace).

## 3. Performance & Reliability Strategies

### Caching Strategy (`services/cacheService.ts`)
*   **Browser Cache**: Static assets (JS/CSS).
*   **Application Cache**: In-memory TTL cache for expensive API calls (e.g., LLM Reports).
*   **Backend Cache**: Redis for session storage and frequent database queries.

### Real-time Streaming (`services/streamService.ts`)
*   **Protocol**: WebSockets (preferred) or Server-Sent Events (SSE).
*   **Optimization**: 
    *   Send deltas (changes) only, not full snapshots.
    *   Throttle UI updates to 60fps (using `requestAnimationFrame` or React state batching).

### Asynchronous Processing (`services/queueService.ts`)
*   **Pattern**: Producer-Consumer Queue.
*   **Implementation**: 
    *   Frontend: Optimistic UI updates with background polling.
    *   Backend: Redis Queue (BullMQ) for image processing jobs.

## 4. Security & Compliance

### Data Protection
*   **Encryption at Rest**: AES-256 encryption for all database volumes and S3 buckets.
*   **Encryption in Transit**: TLS 1.3 forced for all HTTP/WebSocket traffic.
*   **Secrets Management**: AWS Secrets Manager or HashiCorp Vault for API keys and DB credentials.

### Access Control (RBAC)
*   **Operator**: Read-only access to Dashboards; Write access to Ticket Creation and Intake.
*   **Supervisor**: Permission to Acknowledge Alerts and Override thresholds.
*   **QA Manager**: Full access to Traceability and Quality modules; Read-only Audit Logs.
*   **Admin**: Full system access including User Management.

### Audit Trails (`services/auditService.ts`)
*   **Scope**: All state-changing actions (CREATE, UPDATE, DELETE, ACKNOWLEDGE).
*   **Storage**: WORM (Write Once Read Many) storage on S3 Glacier for legal hold.
*   **Logging Fields**: Timestamp (UTC), User ID, Role, Action Type, Resource ID, IP Address Hash.

### Data Retention
*   **Raw Sensor Data**: 1 year (Hot), 5 years (Cold Archive).
*   **Intake Images**: 90 days (unless flagged for quality dispute).
*   **Audit Logs**: 7 years (per industry standard compliance).

## 5. Model Training & MLOps Guidance

### Dataset Requirements
*   **Defect Detection**: Minimum ~2,000 annotated images across all defect classes (Mold, Slaty, Foreign Material).
    *   *Augmentation*: Use rotation, lighting jitter, and blur to expand dataset 5x.
*   **Quality Prediction**: Requires pairs of `[Process Features]` + `[Lab Assessed Grade]`.
    *   *Volume*: Start with 3–6 months of historical batch data (~500+ batches) for statistical significance.

### Labeling Strategy
*   **Tools**: Use **CVAT** or **LabelImg** for bounding box annotation.
*   **Format**: Store labels in **COCO** format (standard for Object Detection).
*   **Workflow**: Peer review 10% of labels to ensure consistency (Inter-Annotator Agreement).

### Performance Metrics
*   **Object Detection**: Precision, Recall, and mAP@0.5 (Mean Average Precision).
*   **Numeric Prediction**: MAE (Mean Absolute Error) & RMSE (Root Mean Square Error).
*   **Classification**: Confusion Matrix (True Positives vs False Positives).

### Monitoring Model Drift
*   **Strategy**: Save `Prediction` vs `Actual QC Result` for every completed batch.
*   **Thresholds**:
    *   Compare model accuracy on a rolling 30-day window.
    *   **Trigger**: If performance drops **>10%** from baseline, trigger `RETRAIN_WORKFLOW`.
*   **Action**: Re-train model with the latest 30 days of "drifted" data added to the training set.
