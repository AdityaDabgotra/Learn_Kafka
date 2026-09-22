FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install required packages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    openjdk-17-jdk \
    netcat \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Kafka version that still supports ZooKeeper
ENV KAFKA_VERSION=3.7.2
ENV SCALA_VERSION=2.13

# Download Kafka
RUN wget https://archive.apache.org/dist/kafka/${KAFKA_VERSION}/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz \
    && tar -xzf kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz \
    && mv kafka_${SCALA_VERSION}-${KAFKA_VERSION} /opt/kafka \
    && rm kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz

# Create Kafka data directories
RUN mkdir -p /tmp/zookeeper \
    /tmp/kafka-logs

WORKDIR /app

COPY package.json .
RUN npm install

COPY server.js .

# ZooKeeper + Kafka ports
EXPOSE 2181 9092

# Start Node.js orchestrator
CMD ["node", "server.js"]