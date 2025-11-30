/*
 * AQUATRACKING - ESP32 Water Flow Sensor (VERSIÓN FINAL)
 * Placa: ESP32-S3 Mini
 * Sensor: YF-S201
 * Pin de Señal: GPIO 10 (cable AZUL)
 * 
 * FUNCIONALIDAD: Detecta INICIO y FIN del flujo automáticamente
 * Envía UNA medición completa por cada uso del grifo
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <time.h>  // Para NTP

// ==================== CONFIGURACIÓN ====================
// WiFi
const char* WIFI_SSID = "NISHI";           // ⚠️ CAMBIAR si es necesario
const char* WIFI_PASSWORD = "123456789";       // ⚠️ CAMBIAR

// Backend API
const char* API_URL = "http://172.20.10.2:3000/api/measurements";  // ⚠️ CAMBIAR IP
const char* SENSOR_ID = "691507a2b7ab0e3a275ff20a";    // Sensor: llave_patio
const char* HOME_ID = "691507a2b7ab0e3a275ff1fb";      // Tu homeId

// Sensor YF-S201
const int SENSOR_PIN = 10;                        // GPIO 10 (cable AZUL)
const int LED_PIN = 47;                           // LED indicador

// Configuración de detección de fin de flujo
const unsigned long FLOW_TIMEOUT = 3000;          // 3 segundos sin pulsos = flujo terminó
const unsigned long MIN_MEASUREMENT_TIME = 1000;  // Mínimo 1 segundo para considerar válido

// Configuración NTP (hora real)
const char* NTP_SERVER = "pool.ntp.org";
const long GMT_OFFSET_SEC = -10800;               // Chile: GMT-3 (-3 * 3600)
const int DAYLIGHT_OFFSET_SEC = 0;                // Sin horario de verano

// ==================== VARIABLES GLOBALES ====================
volatile long pulseCount = 0;
unsigned long flowStartTime = 0;
unsigned long lastPulseTime = 0;
float totalLiters = 0;
bool flowActive = false;

// ==================== FUNCIONES ====================

// Interrupción - cuenta pulsos y marca tiempo
void IRAM_ATTR countPulse() {
  pulseCount++;
  lastPulseTime = millis();
  
  // Si es el primer pulso, marcar inicio
  if (!flowActive) {
    flowActive = true;
    flowStartTime = millis();
    digitalWrite(LED_PIN, HIGH); // LED ON = flujo activo
  }
}

// Sincronizar hora con NTP
void syncTime() {
  Serial.println("🕐 Sincronizando hora con NTP...");
  configTime(GMT_OFFSET_SEC, DAYLIGHT_OFFSET_SEC, NTP_SERVER);
  
  struct tm timeinfo;
  int attempts = 0;
  while (!getLocalTime(&timeinfo) && attempts < 10) {
    Serial.print(".");
    delay(1000);
    attempts++;
  }
  
  if (getLocalTime(&timeinfo)) {
    Serial.println("\n✅ Hora sincronizada!");
    Serial.print("📅 Fecha/Hora: ");
    Serial.println(&timeinfo, "%Y-%m-%d %H:%M:%S");
  } else {
    Serial.println("\n⚠️ No se pudo sincronizar la hora");
  }
}

// Conectar WiFi
void connectWiFi() {
  Serial.println("\n🔌 Conectando a WiFi...");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✅ WiFi conectado!");
    Serial.print("📍 IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n❌ Error: No se pudo conectar a WiFi");
  }
}

// Enviar medición completa al backend
bool sendMeasurement(long pulses, unsigned long startTime, unsigned long endTime) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️ WiFi desconectado");
    return false;
  }

  // Calcular litros con fórmula correcta del YF-S201
  unsigned long durationMs = endTime - startTime;
  float durationSec = durationMs / 1000.0;
  
  // Frecuencia (pulsos/seg) / 7.5 = Caudal (L/min)
  float frequency = pulses / durationSec;
  float flowRateLMin = frequency / 7.5;
  float liters = flowRateLMin * (durationSec / 60.0);


  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");
  
  // Crear timestamps en formato ISO 8601 con hora real de NTP
  char startTimeStr[30];
  char endTimeStr[30];
  
  struct tm timeinfo;
  if (getLocalTime(&timeinfo)) {
    // Calcular tiempo de inicio (restar duración)
    time_t now = mktime(&timeinfo);
    time_t startEpoch = now - (durationMs / 1000);
    struct tm* startTimeInfo = localtime(&startEpoch);
    
    // Formato ISO 8601 con timezone explícito: YYYY-MM-DDTHH:MM:SS-03:00
    strftime(startTimeStr, sizeof(startTimeStr), "%Y-%m-%dT%H:%M:%S-03:00", startTimeInfo);
    strftime(endTimeStr, sizeof(endTimeStr), "%Y-%m-%dT%H:%M:%S-03:00", &timeinfo);
  } else {
    // Fallback si no hay hora sincronizada
    sprintf(startTimeStr, "2025-11-24T00:00:00-03:00");
    sprintf(endTimeStr, "2025-11-24T00:00:00-03:00");
  }
  
  StaticJsonDocument<300> doc;
  doc["sensorId"] = SENSOR_ID;
  doc["homeId"] = HOME_ID;
  doc["startTime"] = startTimeStr;
  doc["endTime"] = endTimeStr;
  doc["liters"] = liters;
  doc["durationSec"] = durationMs / 1000.0;
  doc["unit"] = "L";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  Serial.println("\n📤 Enviando medición completa:");
  Serial.println(jsonString);
  
  int httpCode = http.POST(jsonString);
  
  if (httpCode > 0) {
    Serial.printf("✅ Respuesta: %d\n", httpCode);
    if (httpCode == 201 || httpCode == 200) {
      Serial.println("📥 Datos guardados correctamente");
      
      // Parpadeo = éxito
      for (int i = 0; i < 3; i++) {
        digitalWrite(LED_PIN, LOW);
        delay(100);
        digitalWrite(LED_PIN, HIGH);
        delay(100);
      }
      digitalWrite(LED_PIN, LOW);
      http.end();
      return true;
    } else {
      String response = http.getString();
      Serial.println("❌ Error del servidor:");
      Serial.println(response);
    }
  } else {
    Serial.printf("❌ Error HTTP: %s\n", http.errorToString(httpCode).c_str());
  }
  
  http.end();
  digitalWrite(LED_PIN, LOW);
  return false;
}

// ==================== SETUP ====================
void setup() {
  Serial.begin(115200);
  delay(2000);  // Esperar a que Serial esté listo
  
  Serial.println("\n\n");
  Serial.println("╔════════════════════════════════════╗");
  Serial.println("║   AQUATRACKING - ESP32-S3 Mini    ║");
  Serial.println("║    DETECCIÓN AUTOMÁTICA DE FLUJO   ║");
  Serial.println("╚════════════════════════════════════╝");
  
  pinMode(SENSOR_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  attachInterrupt(digitalPinToInterrupt(SENSOR_PIN), countPulse, RISING);
  
  connectWiFi();
  
  // Sincronizar hora con NTP
  if (WiFi.status() == WL_CONNECTED) {
    syncTime();
  }
  
  Serial.println("\n🚀 Sistema iniciado");
  Serial.println("💧 Esperando flujo de agua...");
  Serial.printf("⏱️  Timeout: %lu ms (sin pulsos = fin de flujo)\n", FLOW_TIMEOUT);
  Serial.println("💡 Sopla el sensor para probar\n");
}

// ==================== LOOP ====================
void loop() {
  unsigned long currentTime = millis();
  
  // Detección de fin de flujo
  if (flowActive) {
    unsigned long timeSinceLastPulse = currentTime - lastPulseTime;
    
    // Si pasaron X segundos sin pulsos = flujo terminó
    if (timeSinceLastPulse >= FLOW_TIMEOUT) {
      
      // Pausa segura para leer valores finales
      detachInterrupt(digitalPinToInterrupt(SENSOR_PIN));
      long finalPulses = pulseCount;
      unsigned long finalStartTime = flowStartTime;
      unsigned long finalEndTime = lastPulseTime;
      unsigned long duration = finalEndTime - finalStartTime;
      
      // Resetear contadores
      pulseCount = 0;
      flowActive = false;
      attachInterrupt(digitalPinToInterrupt(SENSOR_PIN), countPulse, RISING);
      
      // Solo enviar si duró más del mínimo
      if (duration >= MIN_MEASUREMENT_TIME && finalPulses > 0) {
        
        // Calcular valores con fórmula correcta
        float durationSec = duration / 1000.0;
        float frequency = finalPulses / durationSec;
        float flowRateLMin = frequency / 7.5;
        float liters = flowRateLMin * (durationSec / 60.0);

        
        // Mostrar en Serial
        Serial.println("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Serial.println("🛑 FLUJO TERMINADO - Enviando medición");
        Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        Serial.printf("💧 Pulsos totales: %ld\n", finalPulses);
        Serial.printf("💧 Litros: %.3f L\n", liters);
        Serial.printf("⏱️  Duración: %.1f seg\n", duration / 1000.0);
        Serial.printf("🌊 Flujo promedio: %.2f L/min\n", flowRateLMin);
        Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        
        // Enviar al backend
        if (sendMeasurement(finalPulses, finalStartTime, finalEndTime)) {
          totalLiters += liters;
          Serial.printf("\n📊 Total acumulado: %.3f L\n", totalLiters);
        }
        
        Serial.println("\n💧 Esperando próximo flujo...\n");
      } else {
        Serial.println("⚠️ Medición muy corta, descartada");
      }
    } else {
      // Flujo activo - mostrar progreso cada segundo
      static unsigned long lastProgressPrint = 0;
      if (currentTime - lastProgressPrint >= 1000) {
        Serial.printf("🌊 Flujo activo... Pulsos: %ld | %.1f seg\n", 
                      pulseCount, (currentTime - flowStartTime) / 1000.0);
        lastProgressPrint = currentTime;
      }
    }
  }
  
  // Verificar WiFi cada 30 segundos
  static unsigned long lastWiFiCheck = 0;
  if (currentTime - lastWiFiCheck >= 30000) {
    if (WiFi.status() != WL_CONNECTED) {
      Serial.println("\n⚠️ WiFi desconectado, reconectando...");
      connectWiFi();
    }
    lastWiFiCheck = currentTime;
  }
  
  delay(100);
}
