# Git Merge Platform

A web-based Git merge conflict resolution platform built with React, Spring Boot, and JGit.

## Modules
- `frontend/`: Vite + React UI with Monaco Editor and Axios.
- `backend/`: Spring Boot REST API using JGit.

## Run
### Backend
```bash
cd backend
./mvnw spring-boot:run
```
Windows:
```bat
mvnw.cmd spring-boot:run
```

Set credentials before running:
```bash
export GIT_USERNAME=your-github-username
export GIT_TOKEN=your-github-token
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

The frontend expects the backend at `http://localhost:8080` according to `src/services/api.js`.

## Important
The backend currently operates on the repository configured under `workspace.root` and the `My_Repo` directory. For multi-user production use, replace this shared workspace design with isolated per-session workspaces and add authentication, authorization, validation, and secure secret management.
