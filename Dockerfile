FROM eclipse-temurin:11-jre-jammy

ENV KAFKA_VERSION=3.9.2 \
    SCALA_VERSION=2.13 \
    KAFKA_HOME=/opt/kafka

# Install curl/netcat (netcat used to wait for Zookeeper to be ready)
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl netcat-openbsd && \
    rm -rf /var/lib/apt/lists/*

# Download and extract Kafka (this bundles Zookeeper too)
RUN curl -fsSL "https://archive.apache.org/dist/kafka/${KAFKA_VERSION}/kafka_${SCALA_VERSION}-${KAFKA_VERSION}.tgz" -o /tmp/kafka.tgz && \
    mkdir -p "$KAFKA_HOME" && \
    tar -xzf /tmp/kafka.tgz -C "$KAFKA_HOME" --strip-components=1 && \
    rm /tmp/kafka.tgz

# Data directories for Zookeeper + Kafka logs (persisted via volumes if you mount them)
RUN mkdir -p /var/lib/zookeeper/data /var/lib/kafka/data

COPY start.sh /start.sh
RUN chmod +x /start.sh

# 2181 = Zookeeper, 9092 = Kafka broker
EXPOSE 2181 9092

ENTRYPOINT ["/start.sh"]