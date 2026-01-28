const mqtt = require("mqtt");

// Settings
const BROKER_URL = "mqtt://localhost:1883";
const client = mqtt.connect(BROKER_URL);

console.log("🤖 IoT Simulator starting...");

const DEVICES = [
  // ==========================================================
  // 1. ZIGBEE: Xiaomi Sensor
  // Profile id: prof_zigbee_xiaomi_gzcgq01lm
  // ==========================================================
  {
    id: "xiaomi",
    name: "Xiaomi Sensor (Kitchen)",
    topic: "zigbee2mqtt/sensor_kitchen",
    commandTopic: "zigbee2mqtt/sensor_kitchen/set",
    interval: 5000,

    state: {
      is_on: "OFF",
      brightness: 100,
    },

    generate: function () {
      return {
        state: this.state.is_on,
        brightness_percent: this.state.brightness,

        temperature: Number((22 + Math.random()).toFixed(2)),
        humidity: Number((45 + Math.random() * 5).toFixed(2)),
        battery: 90,
        voltage: 3000 + Math.floor(Math.random() * 100),
        linkquality: 100 + Math.floor(Math.random() * 20),
      };
    },
  },

  // ==========================================================
  // 2. TASMOTA: Sonoff POW R2
  // Profile id: prof_wifi_sonoff_pow_r2
  // ==========================================================
  {
    id: "sonoff",
    name: "Sonoff POW (Living Room)",
    topic: "tele/sonoff_living_room/SENSOR",
    commandTopicRoot: "cmnd/sonoff_living_room/",
    interval: 8000,

    state: {
      power: "ON",
    },

    generate: function () {
      const voltage = 220 + (Math.random() * 10 - 5);
      const current = 2.5 + Math.random() * 0.5;
      const power = voltage * current;

      return {
        Time: new Date().toISOString(),

        POWER: this.state.power,

        ENERGY: {
          TotalStartTime: "2024-01-01T00:00:00",
          Total: 100.5,
          Power: Number(power.toFixed(1)),
          ApparentPower: Number(power.toFixed(1)),
          ReactivePower: 0,
          Factor: 1.0,
          Voltage: Number(voltage.toFixed(1)), // V
          Current: Number(current.toFixed(3)), // A
        },
      };
    },
  },

  // ==========================================================
  // 3. DIY: Custom ESP32
  // Profile id: profile_diy_weather
  // ==========================================================
  {
    id: "esp32",
    name: "Custom ESP32 (Garage)",
    topic: "devices/esp32_garage/state",
    interval: 3000,

    state: {
      status: "ok",
    },

    generate: function () {
      return {
        status: this.state.status,
        temp: Number((15 + Math.random() * 2).toFixed(1)),
        door_open: false,
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

  // 1. ZIGBEE (JSON Payload)
  if (topic.includes("zigbee2mqtt")) {
    const device = DEVICES.find((d) => d.id === "xiaomi");
    if (device) {
      try {
        const cmd = JSON.parse(msgStr);

        // Update simulator data
        if (cmd.state) {
          device.state.is_on = cmd.state;
          console.log(`   👉 Xiaomi State changed to: ${device.state.is_on}`);
        }
        if (cmd.brightness_percent !== undefined) {
          device.state.brightness = cmd.brightness_percent;
          console.log(
            `   👉 Xiaomi Brightness changed to: ${device.state.brightness}`,
          );
        }

        // Feedback loop
        publishTelemetry(device);
      } catch (e) {
        console.error("Invalid Zigbee JSON");
      }
    }
  }

  // 2. TASMOTA (Suffix Topic)
  // Example: cmnd/sonoff_living_room/POWER
  else if (topic.includes("cmnd/sonoff")) {
    const device = DEVICES.find((d) => d.id === "sonoff");

    if (topic.endsWith("POWER")) {
      device.state.power = msgStr; // "ON" или "OFF"
      console.log(`   👉 Sonoff Power changed to: ${device.state.power}`);

      // Feedback loop
      publishTelemetry(device);
    }
  }
});

client.on("error", (err) => {
  console.error("❌ MQTT Error:", err);
});
