const {Kafka} = require('kafkajs')
export const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:9092'],
});