const {Kafka} = require('kafkajs')
export const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['https://localhost:9092'],
});