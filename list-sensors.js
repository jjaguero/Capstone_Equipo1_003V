// Script para obtener sensores de MongoDB
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/aquatracking')
    .then(async () => {
        const Sensor = mongoose.model('Sensor', new mongoose.Schema({}, { strict: false }));
        const sensors = await Sensor.find({}).limit(10);

        console.log('\n📋 Sensores disponibles en MongoDB:\n');

        if (sensors.length === 0) {
            console.log('⚠️ No hay sensores registrados en la base de datos');
            console.log('\nNecesitas crear un sensor primero desde el dashboard o usar el script de creación.');
        } else {
            sensors.forEach((s, index) => {
                console.log(`${index + 1}. ID: ${s._id}`);
                console.log(`   Serial: ${s.serialNumber || 'N/A'}`);
                console.log(`   Ubicación: ${s.location || 'N/A'}`);
                console.log(`   Home ID: ${s.homeId || 'N/A'}`);
                console.log('');
            });

            console.log('\n💡 Copia uno de estos IDs y úsalo como SENSOR_ID en el ESP32');
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
