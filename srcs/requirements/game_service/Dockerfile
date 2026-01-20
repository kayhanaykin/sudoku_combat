# ====================
# MULTI STAGE BUILD
# ====================

# --- Stage 1: Build (The Kitchen) ---
FROM debian:bookworm AS builder

# Install build tools and wget to download libraries
# -y "assume yes"
RUN apt-get update && apt-get install -y \
    build-essential \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Create the tools directory
RUN mkdir -p tools

# 2. Download and Extract Asio (Standalone version)
# We use version 1.30.2 as an example of a stable release
RUN wget https://github.com/chriskohlhoff/asio/archive/refs/tags/asio-1-30-2.tar.gz -O asio.tar.gz \
    && tar -xzf asio.tar.gz \
    && mv asio-asio-1-30-2/asio/include/* ./tools/ \
    && rm -rf asio.tar.gz asio-asio-1-30-2

# 3. Download Crow (Amalgamated header)
RUN wget https://github.com/CrowCpp/Crow/releases/download/v1.2.0/crow_all.h -O ./tools/crow_all.h

# 4. Copy your local source code
COPY ./srcs ./srcs
COPY Makefile .

# 5. Build (The Makefile uses -I./tools and -DASIO_STANDALONE)
RUN make

# --- Stage 2: Runtime (The Plate) ---
FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y libstdc++6 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/sudoku_server .

EXPOSE 8080
CMD ["./sudoku_server"]