# Build stage
FROM rust:1.80-slim-bullseye AS builder

WORKDIR /usr/src/ascend-backend

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests and source
COPY backend/Cargo.toml backend/Cargo.lock ./
COPY backend/src ./src
COPY backend/init_db.sql ./init_db.sql

# Build release binary with controlled memory
ENV CARGO_BUILD_JOBS=1
ENV SQLX_OFFLINE=true
RUN cargo build --release

# Runtime stage
FROM debian:bullseye-slim

WORKDIR /app

# Install runtime dependencies for TLS and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl1.1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy compiled binary from builder
COPY --from=builder /usr/src/ascend-backend/target/release/ascend-backend /app/ascend-backend

# Create proof storage directory
RUN mkdir -p /app/storage/proofs

ENV PORT=8000
ENV STORAGE_DIR=/app/storage/proofs
EXPOSE 8000

CMD ["/app/ascend-backend"]
