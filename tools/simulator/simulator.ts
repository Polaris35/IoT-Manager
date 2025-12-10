const mqtt = require("mqtt");

// Настройки подключения
const BROKER_URL = "mqtt://localhost:1883";
const client = mqtt.connect(BROKER_URL);

// --- ОПИСАНИЕ УСТРОЙСТВ ---

const DEVICES = [
  // ==========================================================
  // 1. ZIGBEE: Xiaomi Sensor (Light/Temp/Bat)
  // Профиль: prof_zigbee_xiaomi_gzcgq01lm
  // ==========================================================
  {
    name: "Xiaomi Sensor (Kitchen)",
    topic: "zigbee2mqtt/sensor_kitchen",
    interval: 5000,
    generate: () => ({
      // Профиль берет отсюда 'battery' и 'voltage'
      // Остальные поля (temperature, linkquality) просто игнорируются профилем, это ок.
      temperature: Number((22 + Math.random()).toFixed(2)),
      humidity: Number((45 + Math.random() * 5).toFixed(2)),
      battery: 90,
      voltage: 3000 + Math.floor(Math.random() * 100), // ~3000 мВ. Профиль умножит на 0.001 и получит ~3.0В
      linkquality: 100,
    }),
  },

  // ==========================================================
  // 2. TASMOTA: Sonoff POW R2
  // Профиль: prof_wifi_sonoff_pow_r2
  // ==========================================================
  {
    name: "Sonoff POW (Living Room)",
    topic: "tele/sonoff_living_room/SENSOR",
    interval: 8000,
    generate: () => {
      const voltage = 220 + (Math.random() * 10 - 5);
      const current = 2.5 + Math.random() * 0.5;
      const power = voltage * current;

      return {
        Time: new Date().toISOString(),

        // --- ВАЖНОЕ ИЗМЕНЕНИЕ ---
        // Добавляем POWER, так как твой профиль ищет маппинг "POWER" -> "status"
        // В реальности это может приходить в топике STATE, но для теста шлем все вместе.
        POWER: "ON",

        // Профиль ищет: ENERGY.Voltage, ENERGY.Current, ENERGY.Power
        ENERGY: {
          TotalStartTime: "2024-01-01T00:00:00",
          Total: 100.5,
          Power: Number(power.toFixed(1)), // W
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
  // ==========================================================
  {
    name: "Custom ESP32 (Garage)",
    topic: "devices/esp32_garage/state",
    interval: 3000,
    generate: () => ({
      // Профиль ищет поле "temp" -> мапит в "temperature"
      status: "ok",
      temp: Number((15 + Math.random() * 2).toFixed(1)),
      door_open: false,
    }),
  },
];

// --- ЗАПУСК ---

client.on("connect", () => {
  console.log(`✅ Simulator connected to ${BROKER_URL}`);

  DEVICES.forEach((device) => {
    console.log(`🚀 Starting: ${device.name}`);

    // Мгновенная отправка при старте
    client.publish(device.topic, JSON.stringify(device.generate()));

    setInterval(() => {
      const payload = JSON.stringify(device.generate());
      client.publish(device.topic, payload);

      const time = new Date().toLocaleTimeString();
      console.log(
        `[${time}] Out -> ${device.topic} | Size: ${payload.length}b`
      );
    }, device.interval);
  });
});

client.on("error", (err: any) => {
  console.error("❌ MQTT Error:", err);
});
