/**
 * Test básico para verificar la normalización de nombres de sensores
 */

import { normalizeSensorName, getFullSensorName } from './sensor-name.utils';

// Test rápido para verificar la normalización
const testNormalization = () => {
  console.log('🧪 Testing sensor name normalization...');
  
  // Test casos básicos definidos en constantes
  console.log('✅ Casos básicos:');
  console.log('  baño_principal ->', normalizeSensorName('baño_principal'));
  console.log('  lavamanos ->', normalizeSensorName('lavamanos'));
  console.log('  inodoro ->', normalizeSensorName('inodoro'));
  console.log('  lavaplatos ->', normalizeSensorName('lavaplatos'));
  console.log('  jardin ->', normalizeSensorName('jardin'));
  
  // Test casos automáticos
  console.log('✅ Casos automáticos:');
  console.log('  llave_jardin ->', normalizeSensorName('llave_jardin'));
  console.log('  cocina_principal ->', normalizeSensorName('cocina_principal'));
  
  // Test nombres completos
  console.log('✅ Nombres completos:');
  console.log('  ducha + baño_principal ->', getFullSensorName('baño_principal', 'ducha'));
  console.log('  lavamanos + baño_principal ->', getFullSensorName('baño_principal', 'lavamanos'));
  console.log('  lavaplatos + cocina ->', getFullSensorName('cocina', 'lavaplatos'));
  
  console.log('🎉 Test completed!');
};

// Ejecutar test solo si estamos en desarrollo
if (process.env.NODE_ENV === 'development') {
  testNormalization();
}

export default testNormalization;