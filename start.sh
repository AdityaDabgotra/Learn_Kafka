#!/bin/bash
set -e

KAFKA_HOME="${KAFKA_HOME:-/opt/kafka}"
ADVERTISED_HOST="${ADVERTISED_HOST:-localhost}"

echo ">> Configuring Zookeeper data dir..."
sed -i "s|dataDir=/tmp/zookeeper|dataDir=/var/lib/zookeeper/data|" "$KAFKA_HOME/config/zookeeper.properties"

echo ">> Starting Zookeeper..."
"$KAFKA_HOME/bin/zookeeper-server-start.sh" -daemon "$KAFKA_HOME/config/zookeeper.properties"

echo -n ">> Waiting for Zookeeper on port 2181"
until nc -z localhost 2181; do
  echo -n "."
  sleep 1
done
echo " ready."

echo ">> Configuring Kafka broker..."
sed -i "s|log.dirs=/tmp/kafka-logs|log.dirs=/var/lib/kafka/data|" "$KAFKA_HOME/config/server.properties"

# Make sure the broker listens on all interfaces inside the container
if grep -q "^listeners=" "$KAFKA_HOME/config/server.properties"; then
  sed -i "s|^listeners=.*|listeners=PLAINTEXT://0.0.0.0:9092|" "$KAFKA_HOME/config/server.properties"
else
  echo "listeners=PLAINTEXT://0.0.0.0:9092" >> "$KAFKA_HOME/config/server.properties"
fi

# Advertised listener is what clients (e.g. your Node app) actually connect to
if grep -q "^advertised.listeners=" "$KAFKA_HOME/config/server.properties"; then
  sed -i "s|^advertised.listeners=.*|advertised.listeners=PLAINTEXT://${ADVERTISED_HOST}:9092|" "$KAFKA_HOME/config/server.properties"
else
  echo "advertised.listeners=PLAINTEXT://${ADVERTISED_HOST}:9092" >> "$KAFKA_HOME/config/server.properties"
fi

echo ">> Starting Kafka broker (foreground, keeps container alive)..."
exec "$KAFKA_HOME/bin/kafka-server-start.sh" "$KAFKA_HOME/config/server.properties"