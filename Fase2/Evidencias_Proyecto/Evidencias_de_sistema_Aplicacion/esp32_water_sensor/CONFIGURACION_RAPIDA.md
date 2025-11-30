# ⚡ Configuración Rápida - ESP32-S3 Mini

## ✅ Lo que ya tienes funcionando:
- ESP32-S3 Mini conectado al YF-S201
- Sensor en GPIO 10 (cable azul)
- Código de prueba detectando pulsos correctamente

## 🔧 Solo necesitas configurar 3 cosas:

### 1️⃣ Tu WiFi (líneas 18-19)
```cpp
const char* WIFI_SSID = "NombreDeTuWiFi";
const char* WIFI_PASSWORD = "TuContraseña";
```

### 2️⃣ IP de tu PC (línea 22)
**Obtener tu IP:**
```bash
# En PowerShell o CMD:
ipconfig

# Busca "IPv4 Address" en tu adaptador WiFi
# Ejemplo: 192.168.1.105
```

Luego actualiza:
```cpp
const char* API_URL = "http://192.168.1.105:3000/api/measurements";
//                            ^^^^^^^^^^^^^ TU IP AQUÍ
```

### 3️⃣ Tu homeId (línea 23)
**Opción A - Desde el navegador:**
1. Abre `http://localhost:5173`
2. Presiona F12 (Consola del navegador)
3. Escribe: `localStorage`
4. Busca `homeId` y copia el valor

**Opción B - Crear uno temporal:**
```cpp
const char* HOME_ID = "esp32-test-home";
```

## 📤 Subir el código

1. Abre `esp32_water_sensor.ino` en Arduino IDE
2. Configura las 3 cosas de arriba
3. **Tools → Board → ESP32-S3 Dev Module**
4. **Tools → Port → COM X** (tu puerto)
5. Click **Upload** (→)

## 🧪 Probar

1. Abre **Serial Monitor** (Ctrl+Shift+M)
2. Configura a **115200 baud**
3. Deberías ver:
   ```
   ✅ WiFi conectado!
   📍 IP: 192.168.1.XXX
   🚀 Sistema iniciado
   💧 Esperando flujo de agua...
   💡 Sopla el sensor para probar
   ```

4. **Sopla el sensor** (como en tu código de prueba)
5. Deberías ver:
   ```
   💧 Pulsos: 45
   💧 Litros: 0.100 L
   ⏱️  Duración: 5.0 seg
   🌊 Flujo: 6.00 L/min
   📤 Enviando datos...
   ✅ Respuesta: 201
   📊 Total acumulado: 0.100 L
   ```

## 🎯 Verificar en el Dashboard

1. Abre `http://localhost:5173/user/realtime`
2. Sopla el sensor
3. Deberías ver los datos actualizándose en tiempo real

## 🔍 Diferencias con tu código de prueba

✅ **Mantuve:**
- GPIO 10
- `RISING` en la interrupción
- Pausa segura con `detachInterrupt`
- Fórmula `pulsos / 7.5` para L/min

✅ **Agregué:**
- Conexión WiFi
- Envío HTTP POST al backend
- JSON con los datos
- LED indicador
- Reconexión automática

## ❌ Si algo falla

### WiFi no conecta
```cpp
// Verifica líneas 18-19
const char* WIFI_SSID = "TuWiFi";  // ⚠️ Exactamente como aparece
const char* WIFI_PASSWORD = "TuPassword";
```

### HTTP 404
```cpp
// Verifica línea 22
const char* API_URL = "http://192.168.1.XXX:3000/api/measurements";
//                            ^^^^^^^^^^^^^ TU IP
```

### LED no parpadea
```cpp
// Línea 29 - Prueba con GPIO 48 si 47 no funciona
const int LED_PIN = 48;  // O prueba con 2
```

## 📊 Datos que envía cada 5 segundos

```json
{
  "sensorId": "esp32-s3-sensor-001",
  "homeId": "tu-home-id",
  "startTime": 1700000000,
  "endTime": 1700000005,
  "liters": 0.1,
  "durationSec": 5.0,
  "unit": "L"
}
```

¡Listo! Con estos 3 cambios ya debería funcionar 🚀
