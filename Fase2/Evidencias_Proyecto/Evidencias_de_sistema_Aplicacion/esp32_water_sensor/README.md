# 🚀 Guía Rápida: Configurar ESP32 para AquaTracking

## 📋 Paso 1: Instalar Librerías en Arduino IDE

Abre Arduino IDE y ve a **Sketch → Include Library → Manage Libraries**

Instala:
- `ArduinoJson` por Benoit Blanchon (versión 6.x)

## ⚙️ Paso 2: Configurar el Código

Abre `esp32_water_sensor.ino` y modifica estas líneas:

```cpp
// Línea 18-19: Tu WiFi
const char* WIFI_SSID = "NombreDeTuWiFi";
const char* WIFI_PASSWORD = "ContraseñaDeTuWiFi";

// Línea 22: IP de tu computadora donde corre el backend
const char* API_URL = "http://192.168.1.XXX:3000/api/measurements";
// Reemplaza XXX con tu IP local

// Línea 24: Obtener de MongoDB (ver abajo)
const char* HOME_ID = "673e7c8a9f1234567890abcd";
```

### 🔍 Cómo Obtener tu HOME_ID

**Opción 1: Desde el Dashboard**
1. Abre `http://localhost:5173`
2. Inicia sesión
3. Abre la consola del navegador (F12)
4. Escribe: `localStorage`
5. Busca el `homeId`

**Opción 2: Desde MongoDB Compass**
1. Abre MongoDB Compass
2. Conecta a `mongodb://localhost:27017`
3. Base de datos: `aquatracking`
4. Colección: `homes`
5. Copia el `_id` de tu hogar

**Opción 3: Crear uno nuevo**
Si no tienes ningún hogar, puedes crear uno desde el dashboard o usar este ID temporal:
```
esp32-test-home-001
```

### 📡 Cómo Obtener tu IP Local

**Windows:**
```bash
ipconfig
# Busca "IPv4 Address" en tu adaptador WiFi/Ethernet
```

**Ejemplo:**
```
IPv4 Address: 192.168.1.105
```
Entonces tu API_URL sería:
```cpp
const char* API_URL = "http://192.168.1.105:3000/api/measurements";
```

## 🔌 Paso 3: Conexiones Físicas

```
YF-S201          ESP32
━━━━━━━━━━━━━━━━━━━━━━━━━
VCC (rojo)    →  5V
GND (negro)   →  GND
SIGNAL (amarillo) → GPIO 4
```

## 📤 Paso 4: Subir el Código

1. Conecta el ESP32 por USB
2. En Arduino IDE:
   - **Tools → Board → ESP32 Arduino → ESP32 Dev Module**
   - **Tools → Port → COM X** (el puerto de tu ESP32)
   - **Tools → Upload Speed → 115200**
3. Click en **Upload** (→)
4. Espera a que termine

## 🧪 Paso 5: Probar

1. Abre **Serial Monitor** (Ctrl+Shift+M)
2. Configura a **115200 baud**
3. Deberías ver:
   ```
   ✅ WiFi conectado!
   📍 IP: 192.168.1.XXX
   🚀 Sistema iniciado
   💧 Esperando flujo de agua...
   ```

4. **Abre un grifo** con el sensor instalado
5. Deberías ver:
   ```
   💧 Pulsos: 2250
   💧 Litros: 0.500 L
   ⏱️  Duración: 5.0 seg
   🌊 Flujo: 6.00 L/min
   📤 Enviando datos...
   ✅ Respuesta: 201
   ```

## ✅ Paso 6: Verificar en el Dashboard

1. Abre `http://localhost:5173/user/realtime`
2. Deberías ver los datos actualizándose en tiempo real
3. Sin necesidad de recargar la página

## 🔧 Calibración del Sensor

El YF-S201 tiene aproximadamente **450 pulsos por litro**, pero puede variar.

**Para calibrar:**
1. Llena un recipiente de **1 litro exacto**
2. Anota los pulsos que muestra el Serial Monitor
3. Calcula: `CALIBRATION_FACTOR = pulsos / 1000`
4. Actualiza la línea 25 del código:
   ```cpp
   const float CALIBRATION_FACTOR = 4.5; // Ajustar según tu sensor
   ```

## ❌ Troubleshooting

### Error: WiFi no conecta
- Verifica SSID y password
- Asegúrate que el ESP32 esté cerca del router
- Verifica que tu WiFi sea 2.4GHz (ESP32 no soporta 5GHz)

### Error: HTTP 404
- Verifica que el backend esté corriendo (`npm start`)
- Verifica la IP en API_URL
- Prueba hacer ping: `ping 192.168.1.XXX`

### Error: HTTP 400
- Verifica que HOME_ID sea válido
- Revisa los logs del backend para ver el error exacto

### No cuenta pulsos
- Verifica las conexiones físicas
- Asegúrate que el sensor tenga 5V
- Prueba con otro GPIO (cambia SENSOR_PIN)

## 📊 Datos que se Envían

Cada 5 segundos (si hay flujo), el ESP32 envía:
```json
{
  "sensorId": "esp32-sensor-001",
  "homeId": "tu-home-id",
  "startTime": 1700000000000,
  "endTime": 1700000005000,
  "liters": 0.5,
  "durationSec": 5.0,
  "unit": "L"
}
```

## 🎯 Próximos Pasos

Una vez funcionando:
1. Instala el sensor en la tubería principal
2. Deja corriendo 24/7
3. Monitorea desde el dashboard
4. Configura alertas de consumo excesivo
