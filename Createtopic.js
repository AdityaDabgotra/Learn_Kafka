const kafka = require('./Kafkaclient');

const TOPIC = process.env.KAFKA_TOPIC || 'demo-topic';

async function run() {
  const admin = kafka.admin();
  await admin.connect();

  const existing = await admin.listTopics();
  if (existing.includes(TOPIC)) {
    console.log(`Topic "${TOPIC}" already exists.`);
  } else {
    await admin.createTopics({
      topics: [{ topic: TOPIC, numPartitions: 1, replicationFactor: 1 }]
    });
    console.log(`Topic "${TOPIC}" created.`);
  }

  await admin.disconnect();
}

run().catch((err) => {
  console.error('Topic creation failed:', err);
  process.exit(1);
});