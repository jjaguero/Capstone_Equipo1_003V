import PDFDocument from 'pdfkit';

interface SensorConsumption {
    sensorName: string;
    location: string;
    totalLiters: number;
    percentage: number;
}

interface DailyConsumptionData {
    date: Date;
    totalLiters: number;
    bySensor: Array<{ sensorId: string; liters: number }>;
}

interface GeneratePDFOptions {
    userName: string;
    homeAddress: string;
    period: string;
    startDate: Date;
    endDate: Date;
    dailyConsumption: DailyConsumptionData[];
    sensors: any[];
    totalConsumption: number;
    averageDaily: number;
}

/**
 * Genera un PDF de reporte de consumo de agua usando PDFKit
 * @param options Opciones de generación del PDF
 * @returns Buffer del PDF generado
 */
export async function generateConsumptionPDF(
    options: GeneratePDFOptions,
): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        try {
            const {
                userName,
                homeAddress,
                period,
                startDate,
                endDate,
                dailyConsumption,
                sensors,
                totalConsumption,
                averageDaily,
            } = options;

            // Crear documento PDF
            const doc = new PDFDocument({
                size: 'A4',
                margins: { top: 50, bottom: 50, left: 50, right: 50 },
            });

            const chunks: Buffer[] = [];

            // Capturar el PDF en chunks
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // Colores del tema
            const primaryColor = '#6366F1'; // Indigo
            const secondaryColor = '#93C5FD'; // Light blue
            const textColor = '#1F2937'; // Gray-800
            const lightGray = '#F3F4F6'; // Gray-100

            // ===== HEADER =====
            doc
                .rect(0, 0, doc.page.width, 80)
                .fill(primaryColor);

            doc
                .fontSize(28)
                .fillColor('#FFFFFF')
                .font('Helvetica-Bold')
                .text('AquaTracking', 50, 25, { align: 'center' });

            doc
                .fontSize(14)
                .font('Helvetica')
                .text('Reporte de Consumo de Agua', 50, 55, { align: 'center' });

            // ===== INFORMACIÓN DEL PERÍODO =====
            let yPos = 100;

            doc.fillColor(textColor).fontSize(10).font('Helvetica');

            doc.text(`Período: ${period}`, 50, yPos);
            doc.text(`Desde: ${formatDate(startDate)}`, 50, yPos + 15);
            doc.text(`Hasta: ${formatDate(endDate)}`, 50, yPos + 30);

            doc.text(`Usuario: ${userName}`, 320, yPos);
            doc.text(`Dirección: ${homeAddress}`, 320, yPos + 15);
            doc.text(`Generado: ${formatDate(new Date())}`, 320, yPos + 30);

            // ===== RESUMEN DE CONSUMO =====
            yPos += 60;

            // Fondo del resumen
            doc
                .roundedRect(50, yPos, doc.page.width - 100, 60, 5)
                .fill(secondaryColor);

            doc
                .fontSize(14)
                .fillColor(primaryColor)
                .font('Helvetica-Bold')
                .text('Resumen de Consumo', 50, yPos + 10, {
                    width: doc.page.width - 100,
                    align: 'center',
                });

            doc.fillColor(textColor).fontSize(10).font('Helvetica');
            doc.text('Consumo Total:', 70, yPos + 35);

            doc.fontSize(16).font('Helvetica-Bold');
            doc.text(`${totalConsumption.toFixed(2)} L`, 160, yPos + 33);

            doc.fontSize(10).font('Helvetica');
            doc.text('Promedio Diario:', 320, yPos + 35);

            doc.fontSize(16).font('Helvetica-Bold');
            doc.text(`${averageDaily.toFixed(2)} L`, 420, yPos + 33);

            // ===== CONSUMO POR SENSOR =====
            yPos += 80;

            doc
                .fontSize(12)
                .fillColor(primaryColor)
                .font('Helvetica-Bold')
                .text('Consumo por Dispositivo', 50, yPos);

            yPos += 20;

            // Calcular consumo por sensor
            const sensorConsumption = calculateSensorConsumption(
                dailyConsumption,
                sensors,
            );

            if (sensorConsumption.length > 0) {
                // Dibujar tabla de sensores
                drawSensorTable(doc, sensorConsumption, yPos);
                yPos += 30 + sensorConsumption.length * 25;
            } else {
                doc
                    .fontSize(10)
                    .fillColor(textColor)
                    .font('Helvetica')
                    .text('No hay datos de sensores disponibles', 50, yPos);
                yPos += 30;
            }

            // ===== DETALLE DE CONSUMO DIARIO =====
            if (yPos > 650) {
                doc.addPage();
                yPos = 50;
            }

            doc
                .fontSize(12)
                .fillColor(primaryColor)
                .font('Helvetica-Bold')
                .text('Detalle de Consumo Diario', 50, yPos);

            yPos += 20;

            // Mostrar todos los días del rango solicitado
            if (dailyConsumption.length > 0) {
                drawConsumptionTable(doc, dailyConsumption, yPos);
            } else {
                doc
                    .fontSize(10)
                    .fillColor(textColor)
                    .font('Helvetica')
                    .text('No hay datos de consumo disponibles', 50, yPos);
            }

            // ===== FOOTER EN LA ÚLTIMA PÁGINA =====
            // Agregar footer solo en la página actual (última)
            doc
                .fontSize(8)
                .fillColor('#808080')
                .font('Helvetica')
                .text(
                    'AquaTracking - Sistema de Monitoreo de Consumo de Agua',
                    50,
                    doc.page.height - 35,
                    { align: 'center', width: doc.page.width - 100 },
                );

            // Finalizar el documento
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Dibuja la tabla de consumo por sensor
 */
function drawSensorTable(
    doc: PDFKit.PDFDocument,
    sensorConsumption: SensorConsumption[],
    startY: number,
) {
    let tableTop = startY;
    const col1X = 50;
    const col2X = 80;
    const col3X = 230;
    const col4X = 380;
    const col5X = 480;
    const rowHeight = 25;
    const pageHeight = doc.page.height;
    const bottomMargin = 100;

    // Header de la tabla
    doc
        .rect(col1X, tableTop, doc.page.width - 100, rowHeight)
        .fill('#6366F1');

    doc
        .fontSize(9)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text('#', col1X + 5, tableTop + 8)
        .text('Dispositivo', col2X + 5, tableTop + 8)
        .text('Ubicación', col3X + 5, tableTop + 8)
        .text('Consumo', col4X + 5, tableTop + 8)
        .text('%', col5X + 5, tableTop + 8);

    // Filas de datos
    sensorConsumption.forEach((sensor, index) => {
        const y = tableTop + rowHeight * (index + 1);

        // Verificar si necesitamos una nueva página
        if (y + rowHeight > pageHeight - bottomMargin) {
            doc.addPage();
            tableTop = 50;

            // Redibujar header
            doc
                .rect(col1X, tableTop, doc.page.width - 100, rowHeight)
                .fill('#6366F1');

            doc
                .fontSize(9)
                .fillColor('#FFFFFF')
                .font('Helvetica-Bold')
                .text('#', col1X + 5, tableTop + 8)
                .text('Dispositivo', col2X + 5, tableTop + 8)
                .text('Ubicación', col3X + 5, tableTop + 8)
                .text('Consumo', col4X + 5, tableTop + 8)
                .text('%', col5X + 5, tableTop + 8);

            const newY = tableTop + rowHeight;
            const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F3F4F6';

            doc.rect(col1X, newY, doc.page.width - 100, rowHeight).fill(fillColor);

            doc
                .fontSize(9)
                .fillColor('#1F2937')
                .font('Helvetica')
                .text(`${index + 1}`, col1X + 5, newY + 8)
                .text(sensor.sensorName, col2X + 5, newY + 8, { width: 140 })
                .text(sensor.location, col3X + 5, newY + 8, { width: 140 })
                .text(`${sensor.totalLiters.toFixed(2)} L`, col4X + 5, newY + 8)
                .text(`${sensor.percentage.toFixed(1)}%`, col5X + 5, newY + 8);

            tableTop = newY;
        } else {
            const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F3F4F6';

            doc.rect(col1X, y, doc.page.width - 100, rowHeight).fill(fillColor);

            doc
                .fontSize(9)
                .fillColor('#1F2937')
                .font('Helvetica')
                .text(`${index + 1}`, col1X + 5, y + 8)
                .text(sensor.sensorName, col2X + 5, y + 8, { width: 140 })
                .text(sensor.location, col3X + 5, y + 8, { width: 140 })
                .text(`${sensor.totalLiters.toFixed(2)} L`, col4X + 5, y + 8)
                .text(`${sensor.percentage.toFixed(1)}%`, col5X + 5, y + 8);
        }
    });
}

/**
 * Dibuja la tabla de consumo diario
 */
function drawConsumptionTable(
    doc: PDFKit.PDFDocument,
    consumption: DailyConsumptionData[],
    startY: number,
) {
    let tableTop = startY;
    const col1X = 50;
    const col2X = 200;
    const col3X = 400;
    const rowHeight = 25;
    const pageHeight = doc.page.height;
    const bottomMargin = 100; // Espacio para el footer

    // Header de la tabla
    doc
        .rect(col1X, tableTop, doc.page.width - 100, rowHeight)
        .fill('#6366F1');

    doc
        .fontSize(9)
        .fillColor('#FFFFFF')
        .font('Helvetica-Bold')
        .text('Fecha', col1X + 5, tableTop + 8)
        .text('Día', col2X + 5, tableTop + 8)
        .text('Consumo', col3X + 5, tableTop + 8);

    // Filas de datos
    consumption.forEach((day, index) => {
        const y = tableTop + rowHeight * (index + 1);

        // Verificar si necesitamos una nueva página
        if (y + rowHeight > pageHeight - bottomMargin) {
            doc.addPage();
            tableTop = 50;

            // Redibujar header en la nueva página
            doc
                .rect(col1X, tableTop, doc.page.width - 100, rowHeight)
                .fill('#6366F1');

            doc
                .fontSize(9)
                .fillColor('#FFFFFF')
                .font('Helvetica-Bold')
                .text('Fecha', col1X + 5, tableTop + 8)
                .text('Día', col2X + 5, tableTop + 8)
                .text('Consumo', col3X + 5, tableTop + 8);

            // Ajustar y para la nueva página (primera fila después del header)
            const newY = tableTop + rowHeight;
            const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F3F4F6';

            doc.rect(col1X, newY, doc.page.width - 100, rowHeight).fill(fillColor);

            doc
                .fontSize(9)
                .fillColor('#1F2937')
                .font('Helvetica')
                .text(formatDate(day.date), col1X + 5, newY + 8)
                .text(getDayName(day.date), col2X + 5, newY + 8)
                .text(`${day.totalLiters.toFixed(2)} L`, col3X + 5, newY + 8);

            // Actualizar tableTop para la siguiente iteración
            tableTop = newY;
        } else {
            const fillColor = index % 2 === 0 ? '#FFFFFF' : '#F3F4F6';

            doc.rect(col1X, y, doc.page.width - 100, rowHeight).fill(fillColor);

            doc
                .fontSize(9)
                .fillColor('#1F2937')
                .font('Helvetica')
                .text(formatDate(day.date), col1X + 5, y + 8)
                .text(getDayName(day.date), col2X + 5, y + 8)
                .text(`${day.totalLiters.toFixed(2)} L`, col3X + 5, y + 8);
        }
    });
}

/**
 * Calcula el consumo por sensor
 */
function calculateSensorConsumption(
    dailyConsumption: DailyConsumptionData[],
    sensors: any[],
): SensorConsumption[] {
    const sensorMap: { [key: string]: { liters: number; sensor: any } } = {};

    dailyConsumption.forEach((day) => {
        if (day.bySensor && Array.isArray(day.bySensor)) {
            day.bySensor.forEach((sensorData) => {
                const sensorId = sensorData.sensorId;
                const liters = sensorData.liters || 0;

                if (!sensorId) return;

                if (!sensorMap[sensorId]) {
                    const sensor = sensors.find((s) => s._id.toString() === sensorId);
                    sensorMap[sensorId] = {
                        liters: 0,
                        sensor,
                    };
                }
                sensorMap[sensorId].liters += liters;
            });
        }
    });

    const totalConsumption = Object.values(sensorMap).reduce(
        (sum, item) => sum + item.liters,
        0,
    );

    return Object.values(sensorMap)
        .map((item) => ({
            sensorName:
                item.sensor?.name ||
                item.sensor?.serialNumber ||
                'Sensor Desconocido',
            location: item.sensor?.location || 'Sin ubicación',
            totalLiters: item.liters,
            percentage:
                totalConsumption > 0 ? (item.liters / totalConsumption) * 100 : 0,
        }))
        .sort((a, b) => b.totalLiters - a.totalLiters);
}

/**
 * Formatea una fecha en formato DD/MM/YYYY
 */
function formatDate(date: Date): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Obtiene el nombre del día de la semana
 */
function getDayName(date: Date): string {
    const days = [
        'Domingo',
        'Lunes',
        'Martes',
        'Miércoles',
        'Jueves',
        'Viernes',
        'Sábado',
    ];
    return days[new Date(date).getDay()];
}
