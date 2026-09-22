# Kafka + Zookeeper — Single Container

One Docker image that runs both Zookeeper and Kafka (Zookeeper is started as a
background daemon, then Kafka runs in the foreground so the container stays
alive). Includes a small Node.js client app (`kafkajs`) to create a topic,
produce messages, and consume them.

## 1. Build the image

```bash
docker build -t kafka-zk .
```

## 2. Run the container

```bash
docker run -d \
  --name kafka-zk \
  -p 2181:2181 \
  -p 9092:9092 \
  -e ADVERTISED_HOST=localhost \
  kafka-zk
```

- `2181` → Zookeeper
- `9092` → Kafka broker
- `ADVERTISED_HOST` should match the hostname/IP your Node app will use to
  connect (use `localhost` when running the Node app on your host machine
  against a container with published ports).

Check it booted correctly:

```bash
docker logs -f kafka-zk
```

You should see Zookeeper start, then Kafka start and stay running.

## 3. Run the Node.js client

```bash
cd app
npm install

npm run create-topic   # creates "demo-topic"
npm run consume        # in one terminal, starts listening
npm run produce        # in another terminal, sends 10 messages
```

Environment variables you can override:

| Variable          | Default            | Purpose                              |
|-------------------|---------------------|---------------------------------------|
| `KAFKA_BROKER`    | `localhost:9092`    | Broker address(es), comma-separated   |
| `KAFKA_TOPIC`      | `demo-topic`         | Topic to produce/consume              |
| `KAFKA_GROUP_ID`   | `demo-group`         | Consumer group id                     |

## Notes

- This single-container setup is meant for local dev/testing. For production
  you'd normally run Zookeeper and Kafka as separate containers/services
  (and eventually move to KRaft mode, which drops Zookeeper entirely).
- Data is written to `/var/lib/zookeeper/data` and `/var/lib/kafka/data`
  inside the container. Mount volumes at those paths if you want data to
  survive container restarts:

```bash
docker run -d \
  --name kafka-zk \
  -p 2181:2181 -p 9092:9092 \
  -v kafka-zk-data:/var/lib/kafka/data \
  -v zk-data:/var/lib/zookeeper/data \
  kafka-zk
```