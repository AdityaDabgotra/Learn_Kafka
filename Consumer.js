const kafka = require('./Kafkaclient');

const TOPIC = process.env.KAFKA_TOPIC || 'demo-topic';
const GROUP_ID = process.env.KAFKA_GROUP_ID || 'demo-group';

async function run() {
  const consumer = kafka.consumer({ groupId: GROUP_ID });

  await consumer.connect();
  await consumer.subscribe({ topic: TOPIC, fromBeginning: true });
  console.log(`Consumer connected. Listening on "${TOPIC}" (group: ${GROUP_ID})...`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(
        `[${topic}:${partition}] key=${message.key?.toString()} value=${message.value?.toString()}`
      );
    }
  });

  const shutdown = async () => {
    console.log('Shutting down consumer...');
    await consumer.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

run().catch((err) => {
  console.error('Consumer error:', err);
  process.exit(1);
});