# Multi-stage build for One Front Door
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./backend/
COPY dashboard/ ./dashboard/
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 8000 8501

CMD ["sh", "-c", "python backend/main.py & streamlit run dashboard/app.py --server.port 8501 --server.address 0.0.0.0"]
