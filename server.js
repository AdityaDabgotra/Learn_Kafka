const { spawn } = require("child_process");
const net = require("net");

const KAFKA_HOME = "/opt/kafka";

let zookeeper;
let kafka;

function startProcess(command, args, name) {
    console.log(`Starting ${name}...`);

    const process = spawn(command, args, {
        stdio: "inherit"
    });

    process.on("error", (error) => {
        console.error(`${name} error:`, error);
    });

    process.on("exit", (code, signal) => {
        console.log(`${name} stopped. Code: ${code}, Signal: ${signal}`);

        if (name === "ZooKeeper") {
            console.error("ZooKeeper stopped. Shutting down container.");
            shutdown();
        }

        if (name === "Kafka") {
            console.error("Kafka stopped. Shutting down container.");
            shutdown();
        }
    });

    return process;
}

function waitForPort(host, port, timeout = 30000) {
    return new Promise((resolve, reject) => {
        const start = Date.now();

        function check() {
            const socket = new net.Socket();

            socket.setTimeout(1000);

            socket.connect(port, host, () => {
                socket.destroy();
                console.log(`${host}:${port} is ready.`);
                resolve();
            });

            socket.on("error", () => {
                socket.destroy();

                if (Date.now() - start > timeout) {
                    reject(
                        new Error(
                            `Timeout waiting for ${host}:${port}`
                        )
                    );
                    return;
                }

                setTimeout(check, 1000);
            });

            socket.on("timeout", () => {
                socket.destroy();

                if (Date.now() - start > timeout) {
                    reject(
                        new Error(
                            `Timeout waiting for ${host}:${port}`
                        )
                    );
                    return;
                }

                setTimeout(check, 1000);
            });
        }

        check();
    });
}

async function start() {
    console.log("======================================");
    console.log(" Starting Kafka + ZooKeeper");
    console.log("======================================");

    // --------------------------------
    // 1. Start ZooKeeper
    // --------------------------------

    zookeeper = startProcess(
        `${KAFKA_HOME}/bin/zookeeper-server-start.sh`,
        [
            `${KAFKA_HOME}/config/zookeeper.properties`
        ],
        "ZooKeeper"
    );

    // --------------------------------
    // 2. Wait for ZooKeeper
    // --------------------------------

    console.log("Waiting for ZooKeeper...");

    await waitForPort("127.0.0.1", 2181);

    console.log("ZooKeeper is ready.");

    // --------------------------------
    // 3. Start Kafka
    // --------------------------------

    kafka = startProcess(
        `${KAFKA_HOME}/bin/kafka-server-start.sh`,
        [
            `${KAFKA_HOME}/config/server.properties`
        ],
        "Kafka"
    );

    // --------------------------------
    // 4. Wait for Kafka
    // --------------------------------

    console.log("Waiting for Kafka...");

    await waitForPort("127.0.0.1", 9092);

    console.log("======================================");
    console.log(" Kafka is ready!");
    console.log(" ZooKeeper: localhost:2181");
    console.log(" Kafka:     localhost:9092");
    console.log("======================================");
}

function shutdown() {
    console.log("Shutting down...");

    if (kafka) {
        kafka.kill("SIGTERM");
    }

    if (zookeeper) {
        zookeeper.kill("SIGTERM");
    }

    setTimeout(() => {
        process.exit(0);
    }, 3000);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

start().catch((error) => {
    console.error("Failed to start Kafka/ZooKeeper:");
    console.error(error);

    shutdown();
});