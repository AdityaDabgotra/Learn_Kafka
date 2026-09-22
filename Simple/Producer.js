const {kafka} = require('./client');

async function init(){
    const producer = kafka.producer();
    console.log("Producer Connecting...");
    await producer.connect();
    console.log("Producer Connected Successfully.");

    // Send a message to the 'rider-updates' topic
    const message = {
        topic: 'rider-updates',
        messages: [
            {partition:0,key:'location-update',value:JSON.stringify({name: 'tony stark', location: {lat: 37.7749, lng: -122.4194}})},
        ],
    };

    console.log("Sending message:", message);
    await producer.send(message);
    console.log("Message sent.");

    await producer.disconnect();
    console.log("Producer Disconnected.");
}

init();