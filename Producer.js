const kafka = require('./Kafkaclient');

const TOPIC = process.env.KAFKA_TOPIC || 'demo-topic';

async function run() {
  const producer = kafka.producer();
  await producer.connect();
  console.log(`Producer connected. Sending messages to "${TOPIC}"...`);

  let count = 0;
  const interval = setInterval(async () => {
    count += 1;
    const message = {
      key: `key-${count}`,
      value: JSON.stringify({ count, timestamp: new Date().toISOString() })
    };

    try {
      await producer.send({
        topic: TOPIC,
        messages: [message]
      });
      console.log('Sent:', message.value);
    } catch (err) {
      console.error('Send failed:', err.message);
    }

    if (count >= 10) {
      clearInterval(interval);
      await producer.disconnect();
      console.log('Producer disconnected.');
      process.exit(0);
    }
  }, 1000);
}

run().catch((err) => {
  console.error('Producer error:', err);
  process.exit(1);
});