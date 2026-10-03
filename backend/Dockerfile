FROM python:3.11-slim
WORKDIR /app
COPY requirements.lock.txt ./
RUN pip install --no-cache-dir -r requirements.lock.txt
COPY backend ./backend
COPY data/policies.json ./data/policies.json
COPY public/data ./public/data
ENV PYTHONUNBUFFERED=1
RUN useradd --create-home appuser
USER appuser
EXPOSE 8000
CMD ["uvicorn", "backend.api:app", "--host", "0.0.0.0", "--port", "8000"]
