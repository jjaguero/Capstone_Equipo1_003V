// Script para ver las últimas mediciones guardadas
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/aquatracking')
    .then(async () => {
        const Measurement = mongoose.model('Measurement', new mongoose.Schema({}, { strict: false }));

        console.log('\n📊 Últimas 5 mediciones guardadas:\n');

        const measurements = await Measurement.find({})
            .sort({ createdAt: -1 })
            .limit(5);

        if (measurements.length === 0) {
            console.log('⚠️ No hay mediciones en la base de datos');
        } else {
            measurements.forEach((m, index) => {
                console.log(`${index + 1}. ID: ${m._id}`);
                console.log(`   Sensor: ${m.sensorId}`);
                console.log(`   Home: ${m.homeId}`);
                console.log(`   Litros: ${m.liters} L`);
                console.log(`   Duración: ${m.durationSec} seg`);
                console.log(`   Inicio: ${m.startTime}`);
                console.log(`   Fin: ${m.endTime}`);
                console.log(`   Creado: ${m.createdAt}`);
                console.log('');
            });
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Error:', err.message);
        process.exit(1);
    });
