# Job Importer

A fully automated Job Importer system built using Node.js, Express, MongoDB, Redis, and BullMQ, capable of fetching job listings from multiple RSS/XML feeds, processing them, and queuing them for further processing.

This project features server-side job fetching, validation, and queue management, along with logging of import activities.


## Features
### 1. Job Import

- Fetch jobs from multiple RSS/XML sources

- Validate jobs by GUID or link

- Add valid jobs to a BullMQ queue

- Track queued jobs in Redis to prevent duplicates

- Log import statistics (total fetched, valid, invalid, queued)

### 2. Manual Trigger

- Manual import can be triggered via endpoint or script
- Provides import summary including duration, valid/invalid jobs, and sources fetched

### 3. Import Logging

- Every import creates an ImportLog in MongoDB
- Tracks:
  - Start and finish time
  - Total jobs fetched
  - Number of valid and invalid jobs
  - Queued job count
  - Source URLs 
 
 ## Tech Stack
- Node.js & Express.js
- MongoDB & Mongoose
- Redis & BullMQ
- XML Parsing via xml2js
- JavaScript (ES Modules) 

 ## Folder Structure (High-Level)
```
JOB-IMPORTER/
│
├── client/                
│   └── ... 
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── index.js
│   │   ├── controllers/
│   │   │   └── import.controller.js
│   │   ├── model/
│   │   │   ├── ImportLog.model.js
│   │   │   └── Job.model.js
│   │   ├── queue/
│   │   │   ├── queue.js
│   │   │   └── worker.js
│   │   ├── routes/
│   │   │   └── import.routes.js
│   │   └── utils/
│   │       └── logger.js
│   ├── package.json
│   ├── package-lock.json
│   └── .env
│
├── .gitignore
└── README.md

```
## Getting Started 

This project was bootstrapped with Create React App..

### 1. Install Dependencies

```bash
  cd server
  npm install

```
### 2. Configure Environment
- Create a .env file in the server folder with:

```bash
  PORT=5000
  MONGO_URI=mongodb://localhost:27017/job_importer
  REDIS_HOST=127.0.0.1
  REDIS_PORT=6379
  JOB_QUEUE_NAME=job-import-queue
  CONCURRENCY=5
  BATCH_SIZE=50
  CRON_SCHEDULE=*/60 * * * * 
```

### 3. Run the Server

```bash
  cd server
  npm start
```
- The server will connect to MongoDB and Redis
### 4. Import Logs

```bash
  cd server
  node server/src/queue/worker.js
```
- Workers will start listening to the job queue
- Jobs will be automatically imported from the configured RSS/XML feeds

### 4. Run the Worker
- All import activity is logged in MongoDB ImportLog collection
- Tracks:
  - Total jobs fetched
  - Valid and invalid jobs
  - Queued jobs
  - Duration

## Available Scripts

### `npm test`

Launches tests in watch mode.

### `npm run build`

Creates a production build.

## Author

- Sakshi Tiwari


