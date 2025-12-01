FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Copy model files into the container
COPY models /app/models

# Set default model directory
ENV MODEL_DIR=/app/models

# Expose port (Cloud Run uses PORT env var, but we expose 8080 as default)
EXPOSE 8080

# Run the application
# Use PORT env var for Cloud Run compatibility (defaults to 8080)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]


