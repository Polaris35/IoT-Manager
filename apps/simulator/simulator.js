const mqtt = require("mqtt");

// Settings
const BROKER_URL = "mqtt://localhost:1883";
const client = mqtt.connect(BROKER_URL);

console.log("🤖 IoT Simulator starting...");

const DEVICES = [
  // ==========================================================
  // 1. ZIGBEE: SONOFF TRVZB (thermostat)
  // ==========================================================
  {
    id: "sonoff_trv",
    name: "SONOFF TRVZB (Bedroom)",
    topic: "zigbee2mqtt/trv_bedroom",
    commandTopic: "zigbee2mqtt/trv_bedroom/set",
    interval: 8000,

    state: {
      calibration: 0.0, // local_temperature_calibration
    },

    generate: function () {
      const baseTemp = 22.5 + (Math.random() * 0.5 - 0.25);

      return {
        battery: Math.floor(80 + Math.random() * 10), // 80-90%
        local_temperature: Number(baseTemp.toFixed(1)),
        local_temperature_calibration: this.state.calibration,
        linkquality: 120,
      };
    },
  },

  // ==========================================================
  // 2. ZIGBEE: Xiaomi ZNCZ04LM (smart plug)
  // ==========================================================
  {
    id: "xiaomi_plug",
    name: "Xiaomi Plug (TV)",
    topic: "zigbee2mqtt/plug_tv",
    commandTopic: "zigbee2mqtt/plug_tv/set",
    interval: 5000,

    state: {
      is_on: "ON",
    },

    generate: function () {
      const isPowerOn = this.state.is_on === "ON";
      const voltage = 225 + (Math.random() * 4 - 2); // 223 - 227 V
      const current = isPowerOn ? 0.6 + Math.random() * 0.1 : 0;
      const power = isPowerOn ? voltage * current : 0;

      return {
        state: this.state.is_on,
        power: Number(power.toFixed(1)),
        energy: 15.42,
        current: Number(current.toFixed(2)),
        voltage: Number(voltage.toFixed(1)),
        device_temperature: 35.5 + Math.random(),
        linkquality: 90,
      };
    },
  },
];

client.on("connect", () => {
  console.log(`✅ Simulator connected to ${BROKER_URL}`);

  DEVICES.forEach((device) => {
    console.log(`🚀 Starting loop: ${device.name}`);

    if (device.commandTopic) {
      client.subscribe(device.commandTopic);
      console.log(`   👂 Listening: ${device.commandTopic}`);
    }
    if (device.commandTopicRoot) {
      client.subscribe(`${device.commandTopicRoot}#`);
      console.log(`   👂 Listening: ${device.commandTopicRoot}#`);
    }

    publishTelemetry(device);

    setInterval(() => {
      publishTelemetry(device);
    }, device.interval);
  });
});

function publishTelemetry(device) {
  const payload = JSON.stringify(device.generate());
  client.publish(device.topic, payload);

  const time = new Date().toLocaleTimeString();
  // console.log(`[${time}] 📤 Out -> ${device.topic}`);
}

// --- backend command handle logic ---

client.on("message", (topic, message) => {
  const msgStr = message.toString();
  console.log(`\n📨 [INCOMING CMD] Topic: ${topic} | Payload: ${msgStr}`);

  try {
    const cmd = JSON.parse(msgStr);

    // ZIGBEE: SONOFF TRVZB (thermostat)
    if (topic === "zigbee2mqtt/trv_bedroom/set") {
      const device = DEVICES.find((d) => d.id === "sonoff_trv");
      if (device && cmd.local_temperature_calibration !== undefined) {
        device.state.calibration = Number(cmd.local_temperature_calibration);
        console.log(
          `   👉 TRV Calibration changed to: ${device.state.calibration}°C`,
        );
        publishTelemetry(device);
      }
      // ZIGBEE: Xiaomi ZNCZ04LM (smart plug)
    } else if (topic === "zigbee2mqtt/plug_tv/set") {
      const device = DEVICES.find((d) => d.id === "xiaomi_plug");
      if (device && cmd.state !== undefined) {
        device.state.is_on = cmd.state;
        console.log(`   👉 TV Plug State changed to: ${device.state.is_on}`);
        publishTelemetry(device);
      }
    }
  } catch (e) {
    console.error("Failed to parse incoming command in simulator");
  }
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});
