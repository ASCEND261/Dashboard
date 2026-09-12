# Build stage
FROM rust:1.90-slim-bookworm AS builder

WORKDIR /usr/src/ascend-backend

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    pkg-config \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy manifests and source
COPY Cargo.toml Cargo.lock ./
COPY src ./src
COPY init_db.sql ./init_db.sql

# Build release binary with controlled memory
ENV CARGO_BUILD_JOBS=1
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

WORKDIR /app

# Install runtime dependencies for TLS and networking
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    libssl3 \
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
