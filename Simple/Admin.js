const {Kafka} = require('kafkajs')
const { } = require('./client');

async function init(){
    const admin = kafka.admin();
    console.log("Admin Connecting...");
    await admin.connect();
    console.log("Admin Connected.");

    console.log("Creating Topic 'rider-updates'...");
    await admin.createTopics({
        topics: [
            {
                topic: 'rider-updates',
                numPartitions: 2,
                replicationFactor: 1
            }
        ]
    }).then((result) => {
        console.log("Topic Created:", result);
    }).catch((err) => {
        console.error("Error creating topic:", err);
    }).finally(async () => {
        await admin.disconnect();
        console.log("Admin Disconnected.");
    });
}

init();