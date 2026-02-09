FROM debian:bookworm AS builder

RUN apt-get update && apt-get in	stall -y \
    build-essential \
    wget \
    ca-certificates \
    libsqlite3-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mkdir -p tools

RUN wget https://github.com/chriskohlhoff/asio/archive/refs/tags/asio-1-30-2.tar.gz -O asio.tar.gz \
    && tar -xzf asio.tar.gz \
    && mv asio-asio-1-30-2/asio/include/* ./tools/ \
    && rm -rf asio.tar.gz asio-asio-1-30-2

RUN wget https://github.com/CrowCpp/Crow/releases/download/v1.2.0/crow_all.h -O ./tools/crow_all.h

COPY ./srcs ./srcs
COPY Makefile .

RUN make

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y \
    libstdc++6 \
    libsqlite3-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN mkdir -p /app/data

ENV STATS_DB_PATH=/app/data/stats.db

COPY --from=builder /app/stats_server .

EXPOSE 8090

CMD ["./stats_server"]
