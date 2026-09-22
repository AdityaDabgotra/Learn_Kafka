const { Kafka } = require('kafkajs');

// KAFKA_BROKER defaults to localhost:9092 — override with an env var if the
// broker container is on another host (e.g. "kafka:9092" in docker-compose,
// or "localhost:9092" if you published the port with `-p 9092:9092`).
const brokers = (process.env.KAFKA_BROKER || 'localhost:9092').split(',');

const kafka = new Kafka({
  clientId: 'node-kafka-zk-app',
  brokers,
  retry: {
    initialRetryTime: 300,
    retries: 8
  }
});

module.exports = kafka;