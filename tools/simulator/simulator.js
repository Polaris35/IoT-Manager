const mqtt = require("mqtt");

// Настройки
const BROKER_URL = "mqtt://localhost:1883";
const client = mqtt.connect(BROKER_URL);

console.log("🤖 IoT Simulator starting...");

// --- ОПИСАНИЕ УСТРОЙСТВ ---

const DEVICES = [
  // ==========================================================
  // 1. ZIGBEE: Xiaomi Sensor
  // Профиль: prof_zigbee_xiaomi_gzcgq01lm
  // Тестируем:
  // - commandMode: 'json' (команды приходят JSON-ом в .../set)
  // - factor: voltage (3000 mV -> 3.0 V)
  // ==========================================================
  {
    id: "xiaomi",
    name: "Xiaomi Sensor (Kitchen)",
    topic: "zigbee2mqtt/sensor_kitchen",
    commandTopic: "zigbee2mqtt/sensor_kitchen/set", // Zigbee слушает здесь
    interval: 5000,

    // Внутреннее состояние (изменяется командами)
    state: {
      is_on: "OFF", // Zigbee часто шлет строки
      brightness: 100,
    },

    generate: function () {
      return {
        // Статичные данные (меняются командой)
        state: this.state.is_on,
        brightness_percent: this.state.brightness,

        // Динамические данные (сенсоры)
        temperature: Number((22 + Math.random()).toFixed(2)),
        humidity: Number((45 + Math.random() * 5).toFixed(2)),
        battery: 90,
        // Шлем в милливольтах, чтобы проверить factor: 0.001 на бэкенде
        voltage: 3000 + Math.floor(Math.random() * 100),
        linkquality: 100 + Math.floor(Math.random() * 20),
      };
    },
  },

  // ==========================================================
  // 2. TASMOTA: Sonoff POW R2
  // Профиль: prof_wifi_sonoff_pow_r2
  // Тестируем:
  // - commandMode: 'topic' (команды меняют хвост топика)
  // - Вложенный JSON (ENERGY.Voltage)
  // ==========================================================
  {
    id: "sonoff",
    name: "Sonoff POW (Living Room)",
    topic: "tele/sonoff_living_room/SENSOR",
    // Tasmota слушает семейство топиков cmnd/...
    // Мы подпишемся на корень, чтобы ловить всё
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

        // Статус реле (меняется командой)
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
  // Профиль: profile_diy_weather
  // Тестируем: Простой маппинг
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

// --- ЛОГИКА ---

client.on("connect", () => {
  console.log(`✅ Simulator connected to ${BROKER_URL}`);

  DEVICES.forEach((device) => {
    console.log(`🚀 Starting loop: ${device.name}`);

    // 1. Подписываемся на команды
    if (device.commandTopic) {
      client.subscribe(device.commandTopic);
      console.log(`   👂 Listening: ${device.commandTopic}`);
    }
    if (device.commandTopicRoot) {
      // Подписываемся по вайлдкарду (для Tasmota: cmnd/dev/+)
      client.subscribe(`${device.commandTopicRoot}#`);
      console.log(`   👂 Listening: ${device.commandTopicRoot}#`);
    }

    // 2. Отправляем первое сообщение сразу
    publishTelemetry(device);

    // 3. Запускаем цикл
    setInterval(() => {
      publishTelemetry(device);
    }, device.interval);
  });
});

function publishTelemetry(device) {
  const payload = JSON.stringify(device.generate());
  client.publish(device.topic, payload);

  // Красивый лог
  const time = new Date().toLocaleTimeString();
  // console.log(`[${time}] 📤 Out -> ${device.topic}`);
}

// --- ОБРАБОТКА КОМАНД ОТ БЭКЕНДА ---

client.on("message", (topic, message) => {
  const msgStr = message.toString();
  console.log(`\n📨 [INCOMING CMD] Topic: ${topic} | Payload: ${msgStr}`);

  // 1. Логика ZIGBEE (JSON Payload)
  if (topic.includes("zigbee2mqtt")) {
    const device = DEVICES.find((d) => d.id === "xiaomi");
    if (device) {
      try {
        const cmd = JSON.parse(msgStr);

        // Обновляем состояние симулятора
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

        // Мгновенно отправляем новое состояние (Feedback loop)
        publishTelemetry(device);
      } catch (e) {
        console.error("Invalid Zigbee JSON");
      }
    }
  }

  // 2. Логика TASMOTA (Suffix Topic)
  // Пример: cmnd/sonoff_living_room/POWER
  else if (topic.includes("cmnd/sonoff")) {
    const device = DEVICES.find((d) => d.id === "sonoff");

    // Определяем, какая команда пришла, по хвосту топика
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
