import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Telegraf, Markup, Context, Input } from 'telegraf';
import OpenAI from 'openai';
import { TelegramUser, TelegramUserDocument } from '../../schemas/telegram-user.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { DailyConsumption, DailyConsumptionDocument } from '../../schemas/daily-consumption.schema';
import { Sensor, SensorDocument } from '../../schemas/sensor.schema';
import { Alert, AlertDocument } from '../../schemas/alert.schema';
import { Home, HomeDocument } from '../../schemas/home.schema';
import { generateConsumptionPDF } from '../../utils/pdf-generator.util';

@Injectable()
export class ChatbotService implements OnModuleInit {
  private bot: Telegraf;
  private frontendUrl: string;
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(TelegramUser.name) private telegramUserModel: Model<TelegramUserDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(DailyConsumption.name) private dailyConsumptionModel: Model<DailyConsumptionDocument>,
    @InjectModel(Sensor.name) private sensorModel: Model<SensorDocument>,
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    @InjectModel(Home.name) private homeModel: Model<HomeDocument>,
  ) { }

  onModuleInit() {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN no está configurado.');
      return;
    }

    // ⭐ Inicializar Groq AI usando OpenAI SDK
    const groqApiKey = this.configService.get<string>('GROQ_API_KEY');
    if (groqApiKey) {
      this.openai = new OpenAI({
        apiKey: groqApiKey,
        baseURL: 'https://api.groq.com/openai/v1',
      });
      console.log('✅ Agente de IA Groq inicializado con modelo llama-3.3-70b-versatile');
    } else {
      console.warn('⚠️ GROQ_API_KEY no configurado. El bot funcionará sin IA.');
    }

    this.bot = new Telegraf(botToken);

    // URL del frontend
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';

    // Comando /start
    this.bot.start(async (ctx) => {
      const telegramId = ctx.from.id.toString();
      const linkedUser = await this.telegramUserModel.findOne({ telegramId });

      if (linkedUser) {
        const user = await this.userModel.findOne({ rut: linkedUser.rut });
        await ctx.reply(
          `¡Hola de nuevo, ${user?.name || 'usuario'}! 👋\n\nYa estás vinculado. Puedo ayudarte con:\n• Tu consumo de agua\n• Estado de tus sensores\n• Alertas activas\n• Consejos personalizados\n\nO usa el menú rápido:`,
          Markup.inlineKeyboard([
            [
              Markup.button.callback('📊 Mi Consumo', 'my_consumption'),
              Markup.button.callback('🔌 Mis Sensores', 'my_sensors'),
            ],
            [
              Markup.button.callback('🔔 Mis Alertas', 'my_alerts'),
              Markup.button.callback('📈 Estadísticas', 'my_stats'),
            ],
            [
              Markup.button.callback('🔗 Accesos Rápidos', 'quick_links'),
            ],
          ]),
        );
      } else {
        await ctx.reply(
          '¡Bienvenido a AquaTracking! 💧\n\nPara brindarte información personalizada sobre tu consumo de agua, necesito vincularte.\n\n📝 Por favor, ingresa tu RUT (formato: 12345678-9 o 12345678-K):',
        );
      }
    });

    // Comando /desvincular
    this.bot.command('desvincular', async (ctx) => {
      const telegramId = ctx.from.id.toString();
      const result = await this.telegramUserModel.deleteOne({ telegramId });

      if (result.deletedCount > 0) {
        await ctx.reply('✅ Te has desvinculado correctamente. Usa /start para vincularte de nuevo.');
      } else {
        await ctx.reply('⚠️ No estabas vinculado.');
      }
    });

    // Comando /help
    this.bot.help(async (ctx) => {
      await ctx.reply(
        '🤖 *Asistente de AquaTracking*\n\nPuedes preguntarme:\n\n💧 *Sobre tu consumo*\n• "¿Cuál es mi consumo de hoy?"\n• "¿Cuánto gasté esta semana?"\n• "¿Estoy excediendo mi límite?"\n\n🔌 *Sobre tus sensores*\n• "¿Cuántos sensores tengo?"\n• "¿Están funcionando mis sensores?"\n• "Estado de mis sensores"\n\n🔔 *Sobre alertas*\n• "¿Tengo alertas activas?"\n• "Muéstrame mis alertas"\n\n💡 *Consejos*\n• "¿Cómo puedo ahorrar agua?"\n• "Dame recomendaciones"\n\n📱 *Comandos*\n• /start - Iniciar o ver menú\n• /desvincular - Desvincular cuenta\n• /help - Ver esta ayuda',
        { parse_mode: 'Markdown' }
      );
    });

    // Handlers para botones callback
    this.bot.action('my_consumption', async (ctx) => {
      await ctx.answerCbQuery();
      await this.handleMyConsumption(ctx);
    });

    this.bot.action('my_sensors', async (ctx) => {
      await ctx.answerCbQuery();
      await this.handleMySensors(ctx);
    });

    this.bot.action('my_alerts', async (ctx) => {
      await ctx.answerCbQuery();
      await this.handleMyAlerts(ctx);
    });

    this.bot.action('my_stats', async (ctx) => {
      await ctx.answerCbQuery();
      await this.handleMyStats(ctx);
    });

    this.bot.action('quick_links', async (ctx) => {
      await ctx.answerCbQuery();
      await ctx.reply(
        `🔗 *Accesos Rápidos*\n\n📊 Dashboard: ${this.frontendUrl}/user/dashboard\n⏱️ Tiempo Real: ${this.frontendUrl}/user/realtime\n💧 Consumo: ${this.frontendUrl}/user/consumption\n🔔 Alertas: ${this.frontendUrl}/user/alerts\n🔌 Sensores: ${this.frontendUrl}/user/sensors\n🛠️ Soporte: ${this.frontendUrl}/user/support\n👤 Perfil: ${this.frontendUrl}/settings`,
        { parse_mode: 'Markdown' }
      );
    });

    // Manejo de mensajes de texto
    this.bot.on('text', async (ctx) => {
      const telegramId = ctx.from.id.toString();
      const userMessage = ctx.message.text;
      const linkedUser = await this.telegramUserModel.findOne({ telegramId });

      // Si no está vinculado, intentar vincular por RUT
      if (!linkedUser) {
        await this.handleRutLinking(ctx, userMessage, telegramId);
        return;
      }

      // Si está vinculado, procesar la pregunta con IA
      await ctx.sendChatAction('typing');
      const user = await this.userModel.findOne({ rut: linkedUser.rut });
      if (!user) {
        await ctx.reply('⚠️ Error: No se encontró tu usuario. Usa /desvincular y vuelve a vincularte.');
        return;
      }
      const aiResponse = await this.askAIWithUserData(userMessage, user as UserDocument, ctx);
      if (aiResponse) {
        // Escapar solo caracteres problemáticos pero mantener formato intencional
        // Escapar: _ - ( ) . ! = + { } [ ] \ | > #
        // NO escapar: * (usado para negritas por la IA)
        const escapedResponse = aiResponse
          .replace(/\\/g, '\\\\')  // Escapar backslashes primero
          .replace(/_/g, '\\_')     // Escapar guiones bajos
          .replace(/-/g, '\\-')     // Escapar guiones
          .replace(/\(/g, '\\(')    // Escapar paréntesis
          .replace(/\)/g, '\\)')
          .replace(/\./g, '\\.')    // Escapar puntos
          .replace(/!/g, '\\!')     // Escapar exclamaciones
          .replace(/=/g, '\\=')     // Escapar igual
          .replace(/\+/g, '\\+')    // Escapar más
          .replace(/{/g, '\\{')     // Escapar llaves
          .replace(/}/g, '\\}')
          .replace(/\[/g, '\\[')    // Escapar corchetes
          .replace(/]/g, '\\]')
          .replace(/\|/g, '\\|')    // Escapar pipe
          .replace(/>/g, '\\>')     // Escapar mayor que
          .replace(/#/g, '\\#');    // Escapar hashtag

        await ctx.reply(escapedResponse, { parse_mode: 'MarkdownV2' });
      }
    });

    this.bot.launch();
    console.log('🤖 Bot de Telegram iniciado con vinculación por RUT.');
  }

  private async handleRutLinking(ctx: Context, rut: string, telegramId: string) {
    // Validar formato básico de RUT y normalizar (K mayúscula)
    const rutRegex = /^\d{7,8}-[\dkK]$/;
    const normalizedRut = rut.trim().toUpperCase();
    if (!rutRegex.test(normalizedRut)) {
      await ctx.reply('❌ Formato de RUT inválido. Por favor usa el formato: 12345678-9 o 12345678-K');
      return;
    }

    // Buscar usuario por RUT (normalizado)
    const user = await this.userModel.findOne({ rut: normalizedRut });
    if (!user) {
      await ctx.reply('❌ No encontré un usuario con ese RUT. Verifica que esté registrado en AquaTracking.');
      return;
    }

    // Crear vinculación
    await this.telegramUserModel.create({
      telegramId,
      rut: normalizedRut,
      firstName: ctx.from?.first_name || '',
      lastName: ctx.from?.last_name || '',
      username: ctx.from?.username || '',
    });

    await ctx.reply(
      `✅ ¡Vinculación exitosa!\n\nHola ${user.name}, ahora puedes preguntarme sobre:\n• Tu consumo de agua\n• Estado de tus sensores\n• Alertas activas\n• Y mucho más\n\n💡 Prueba preguntándome: "¿Cuál es mi consumo de hoy?"`,
      Markup.inlineKeyboard([
        [
          Markup.button.callback('📊 Mi Consumo', 'my_consumption'),
          Markup.button.callback('🔌 Mis Sensores', 'my_sensors'),
        ],
        [
          Markup.button.callback('🔔 Mis Alertas', 'my_alerts'),
        ],
      ]),
    );
  }

  private async handleMyConsumption(ctx: any) {
    const telegramId = ctx.from.id.toString();
    const linkedUser = await this.telegramUserModel.findOne({ telegramId });
    if (!linkedUser) return;

    const user = await this.userModel.findOne({ rut: linkedUser.rut });
    if (!user || !user.homeId) {
      await ctx.reply('⚠️ No tienes un hogar asignado.');
      return;
    }

    // Obtener consumo de hoy
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayConsumption = await this.dailyConsumptionModel.findOne({
      homeId: user.homeId,
      date: { $gte: today },
    });

    const consumed = todayConsumption?.totalLiters || 0;
    const limit = user.limitLitersPerDay;
    const percentage = ((consumed / limit) * 100).toFixed(1);
    const status = consumed > limit ? '🔴 Excedido' : consumed > limit * 0.8 ? '🟡 Cerca del límite' : '🟢 Normal';

    await ctx.reply(
      `💧 *Tu Consumo de Hoy*\n\n📊 Consumo actual: *${consumed}L*\n🎯 Límite diario: *${limit}L*\n📈 Uso: *${percentage}%*\n\nEstado: ${status}\n\nVer más detalles: ${this.frontendUrl}/user/consumption`,
      { parse_mode: 'Markdown' }
    );
  }

  private async handleMySensors(ctx: any) {
    const telegramId = ctx.from.id.toString();
    const linkedUser = await this.telegramUserModel.findOne({ telegramId });
    if (!linkedUser) return;

    const user = await this.userModel.findOne({ rut: linkedUser.rut });
    if (!user || !user.homeId) {
      await ctx.reply('⚠️ No tienes un hogar asignado.');
      return;
    }

    const sensors = await this.sensorModel.find({ homeId: user.homeId });

    if (sensors.length === 0) {
      await ctx.reply('⚠️ No tienes sensores registrados.');
      return;
    }

    let message = `🔌 *Tus Sensores* (${sensors.length})\n\n`;
    sensors.forEach((sensor, idx) => {
      const statusIcon = sensor.status === 'active' ? '🟢' : '🔴';
      const sensorName = (sensor as any).name || sensor.serialNumber;
      message += `${idx + 1}. ${statusIcon} *${sensorName}*\n   Ubicación: ${sensor.location}\n   Estado: ${sensor.status}\n\n`;
    });

    message += `Ver más: ${this.frontendUrl}/user/sensors`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  private async handleMyAlerts(ctx: any) {
    const telegramId = ctx.from.id.toString();
    const linkedUser = await this.telegramUserModel.findOne({ telegramId });
    if (!linkedUser) return;

    const user = await this.userModel.findOne({ rut: linkedUser.rut });
    if (!user || !user.homeId) {
      await ctx.reply('⚠️ No tienes un hogar asignado.');
      return;
    }

    const alerts = await this.alertModel
      .find({ homeId: user.homeId, status: 'active' })
      .sort({ triggeredAt: -1 })
      .limit(5);

    if (alerts.length === 0) {
      await ctx.reply('✅ No tienes alertas activas.');
      return;
    }

    let message = `🔔 *Alertas Activas* (${alerts.length})\n\n`;
    alerts.forEach((alert, idx) => {
      const severity = (alert as any).severity || 'info';
      const severityIcon = severity === 'critical' ? '🔴' : severity === 'warning' ? '🟡' : '🔵';
      message += `${idx + 1}. ${severityIcon} *${alert.type}*\n   ${alert.message}\n\n`;
    });

    message += `Ver todas: ${this.frontendUrl}/user/alerts`;

    await ctx.reply(message, { parse_mode: 'Markdown' });
  }

  private async handleMyStats(ctx: any) {
    const telegramId = ctx.from.id.toString();
    const linkedUser = await this.telegramUserModel.findOne({ telegramId });
    if (!linkedUser) return;

    const user = await this.userModel.findOne({ rut: linkedUser.rut });
    if (!user || !user.homeId) {
      await ctx.reply('⚠️ No tienes un hogar asignado.');
      return;
    }

    // Obtener estadísticas de los últimos 7 días
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekConsumption = await this.dailyConsumptionModel.find({
      homeId: user.homeId,
      date: { $gte: sevenDaysAgo },
    });

    const totalWeek = weekConsumption.reduce((sum, day) => sum + day.totalLiters, 0);
    const avgPerDay = (totalWeek / 7).toFixed(1);
    const avgPerPerson = (totalWeek / 7 / user.people).toFixed(1);

    await ctx.reply(
      `📈 *Tus Estadísticas (7 días)*\n\n💧 Total: *${totalWeek}L*\n📊 Promedio/día: *${avgPerDay}L*\n👤 Promedio/persona/día: *${avgPerPerson}L*\n👥 Personas en hogar: *${user.people}*\n\nVer dashboard completo: ${this.frontendUrl}/user/dashboard`,
      { parse_mode: 'Markdown' }
    );
  }

  private async askAIWithUserData(question: string, user: UserDocument, ctx?: any): Promise<string> {
    if (!this.openai) {
      return '⚠️ El agente de IA no está disponible en este momento.';
    }

    try {
      // Obtener datos del usuario para contexto
      let userContext = '';

      if (user && user.homeId) {
        // Obtener fecha de hoy en UTC (medianoche)
        const now = new Date();
        const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

        // Consumo de hoy
        const todayConsumption = await this.dailyConsumptionModel.findOne({
          homeId: user.homeId,
          date: today,
        });

        // Consumo de esta semana (últimos 7 días)
        const sevenDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 7, 0, 0, 0, 0));
        const weekConsumption = await this.dailyConsumptionModel.aggregate([
          {
            $match: {
              homeId: user.homeId,
              date: { $gte: sevenDaysAgo, $lte: today }
            }
          },
          {
            $group: {
              _id: null,
              totalLiters: { $sum: '$totalLiters' },
              days: { $sum: 1 }
            }
          }
        ]);

        // Consumo de este mes
        const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
        const monthConsumption = await this.dailyConsumptionModel.aggregate([
          {
            $match: {
              homeId: user.homeId,
              date: { $gte: monthStart, $lte: today }
            }
          },
          {
            $group: {
              _id: null,
              totalLiters: { $sum: '$totalLiters' },
              days: { $sum: 1 }
            }
          }
        ]);

        const sensors = await this.sensorModel.find({ homeId: user.homeId });
        const alerts = await this.alertModel.find({ homeId: user.homeId, status: 'active' });

        const weekTotal = weekConsumption[0]?.totalLiters || 0;
        const weekDays = weekConsumption[0]?.days || 0;
        const monthTotal = monthConsumption[0]?.totalLiters || 0;
        const monthDays = monthConsumption[0]?.days || 0;

        const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        const currentMonth = monthNames[now.getUTCMonth()];

        // Obtener consumo diario de los últimos 30 días
        const thirtyDaysAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30, 0, 0, 0, 0));
        const dailyRecords = await this.dailyConsumptionModel.find({
          homeId: user.homeId,
          date: { $gte: thirtyDaysAgo, $lte: today }
        }).sort({ date: -1 }).limit(30).lean();

        const dailyData = dailyRecords.map(r => {
          const date = new Date(r.date);
          const dateStr = `${date.getUTCDate()}/${date.getUTCMonth() + 1}`;
          return `  • ${dateStr}: ${r.totalLiters.toFixed(2)}L`;
        }).join('\n');

        // Obtener consumo histórico COMPLETO (todos los meses disponibles)
        const historicalConsumption = await this.dailyConsumptionModel.aggregate([
          {
            $match: {
              homeId: user.homeId
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' }
              },
              totalLiters: { $sum: '$totalLiters' },
              days: { $sum: 1 }
            }
          },
          {
            $sort: { '_id.year': -1, '_id.month': -1 }
          }
        ]);

        const historicalData = historicalConsumption.map(m => {
          const monthName = monthNames[m._id.month - 1];
          const avgDaily = m.days > 0 ? (m.totalLiters / m.days).toFixed(1) : 0;
          return `  • ${monthName} ${m._id.year}: ${m.totalLiters.toFixed(2)}L total (${avgDaily}L/día promedio, ${m.days} días con datos)`;
        }).join('\n');

        // Calcular total histórico
        const totalHistorical = historicalConsumption.reduce((sum, m) => sum + m.totalLiters, 0);
        const totalDays = historicalConsumption.reduce((sum, m) => sum + m.days, 0);
        const avgDailyOverall = totalDays > 0 ? (totalHistorical / totalDays).toFixed(2) : 0;

        // Obtener primer y último registro
        const firstRecord = await this.dailyConsumptionModel.findOne({ homeId: user.homeId }).sort({ date: 1 }).lean();
        const lastRecord = await this.dailyConsumptionModel.findOne({ homeId: user.homeId }).sort({ date: -1 }).lean();

        const firstDate = firstRecord ? new Date(firstRecord.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No disponible';
        const lastDate = lastRecord ? new Date(lastRecord.date).toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }) : 'No disponible';

        // Calcular consumo por sensor para el mes actual
        const sensorConsumptionMap = new Map();
        const monthConsumptionRecords = await this.dailyConsumptionModel.find({
          homeId: user.homeId,
          date: { $gte: monthStart, $lte: today }
        }).lean();

        monthConsumptionRecords.forEach(record => {
          record.bySensor.forEach((s: any) => {
            const current = sensorConsumptionMap.get(s.sensorId) || 0;
            sensorConsumptionMap.set(s.sensorId, current + s.liters);
          });
        });

        const sensorDetails = sensors.map(sensor => {
          const sensorId = (sensor._id as any).toString();
          const consumption = sensorConsumptionMap.get(sensorId) || 0;
          return `  • ${sensor.name || sensor.serialNumber} (${sensor.location}): ${consumption.toFixed(2)}L este mes`;
        }).join('\n');

        userContext = `
DATOS DEL USUARIO:
- Nombre: ${user.name}
- Personas en hogar: ${user.people}
- Límite diario: ${user.limitLitersPerDay}L

CONSUMO ACTUAL:
- Hoy: ${todayConsumption?.totalLiters ? todayConsumption.totalLiters.toFixed(2) : '0.00'}L
- Esta semana (últimos 7 días): ${weekTotal.toFixed(2)}L en ${weekDays} días
- Este mes (${currentMonth}): ${monthTotal.toFixed(2)}L en ${monthDays} días

SENSORES Y UBICACIONES (consumo del mes actual):
${sensorDetails || '  • No hay sensores registrados'}

CONSUMO DIARIO (últimos 30 días):
${dailyData || '  • No hay datos disponibles'}

CONSUMO POR MES (histórico completo):
${historicalData || '  • No hay datos históricos disponibles'}

ESTADÍSTICAS GENERALES:
- Total histórico: ${totalHistorical.toFixed(2)}L
- Promedio diario general: ${avgDailyOverall}L/día
- Total de días con datos: ${totalDays}
- Primer registro: ${firstDate}
- Último registro: ${lastDate}

SISTEMA:
- Sensores activos: ${sensors.filter(s => s.status === 'active').length}/${sensors.length}
- Alertas activas: ${alerts.length}
`;
      }

      const systemPrompt = `Eres Andrés, un asistente amigable y conversacional de AquaTracking, un sistema de monitoreo de consumo de agua.

${userContext}

🚫 LÍMITES ESTRICTOS - SOLO PUEDES HABLAR DE:
- Consumo de agua del usuario
- Sensores de agua
- Alertas de consumo
- Estadísticas de uso de agua
- Consejos para ahorrar agua
- Configuración de AquaTracking
- Vinculación/desvinculación de cuenta
- Generación de reportes PDF

❌ NO PUEDES RESPONDER SOBRE:
- Series, películas, entretenimiento
- Recetas de cocina
- Noticias, deportes, política
- Consejos generales no relacionados con agua
- Cualquier tema fuera de AquaTracking

📄 DETECCIÓN DE SOLICITUDES DE PDF:
Si el usuario solicita un PDF, reporte o informe, debes responder EXACTAMENTE en este formato JSON (sin texto adicional):
{
  "type": "pdf_request",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "description": "descripción breve del rango"
}

Interpretación de rangos de fechas (hoy es ${new Date().toLocaleDateString('es-CL')}):
- "PDF del mes actual" o "PDF de este mes" → startDate: primer día del mes actual, endDate: último día del mes actual
- "PDF de los últimos 3 meses" → startDate: hace 3 meses desde hoy, endDate: hoy
- "PDF de septiembre" → startDate: 2025-09-01, endDate: 2025-09-30
- "PDF de septiembre a noviembre" → startDate: 2025-09-01, endDate: 2025-11-30
- "PDF de la última semana" → startDate: hace 7 días, endDate: hoy
- "PDF del mes pasado" → startDate: primer día del mes pasado, endDate: último día del mes pasado

IMPORTANTE: Si detectas una solicitud de PDF, SOLO responde con el JSON, sin texto adicional antes ni después.

PERSONALIDAD Y ESTILO (solo para respuestas normales, NO para PDFs):
- Habla de forma natural y cercana, como un amigo que ayuda
- Varía tus respuestas, NO repitas las mismas frases
- Sé conciso pero informativo (máximo 3-4 líneas)
- Usa emojis ocasionalmente para dar calidez 💧🌊✨
- Adapta tu tono a la pregunta: casual para charla, técnico para datos

REGLAS DE RESPUESTA:
1. Si el consumo es 0L, NO lo menciones a menos que te pregunten específicamente
2. Enfócate en lo que el usuario pregunta, no repitas todos los datos cada vez
3. Usa los datos solo cuando sean RELEVANTES a la pregunta
4. Si te preguntan algo FUERA DE CONTEXTO, responde amablemente que solo puedes ayudar con temas de agua
5. Varía tus saludos y despedidas
6. Usa formato Markdown solo para destacar números importantes (*texto*)

INTERPRETACIÓN DE FECHAS:
- Hoy es ${new Date().toLocaleDateString('es-CL')} (${new Date().getUTCDate()}/${new Date().getUTCMonth() + 1})
- "Ayer" = día anterior a hoy (${new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 1)).getUTCDate()}/${new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 1)).getUTCMonth() + 1})
- "Anteayer" = hace 2 días (${new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 2)).getUTCDate()}/${new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), new Date().getUTCDate() - 2)).getUTCMonth() + 1})
- Cuando te pregunten por "ayer", "anteayer" o un día específico, busca en la lista "CONSUMO DIARIO (últimos 30 días)" la fecha correspondiente
- Si no encuentras datos para ese día específico en la lista, di que no hay datos para ese día

EJEMPLOS DE RESPUESTAS FUERA DE CONTEXTO:
❌ Pregunta: "¿Qué serie está en tendencia en HBO Max?"
✅ Respuesta: "¡Uy! 😅 Solo estoy configurado para ayudarte con el monitoreo de agua. ¿Quieres saber algo sobre tu consumo o sensores?"

❌ Pregunta: "¿Cómo hago un pudding de chocolate?"
✅ Respuesta: "Jaja, me encantaría ayudarte, pero solo sé de agua 💧 ¿Necesitas revisar tu consumo o algún sensor?"

RECUERDA: Si la pregunta NO es sobre agua/AquaTracking, rechaza educadamente y redirige a temas de agua.`;

      const completion = await this.openai.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0]?.message?.content || '❌ No pude generar una respuesta.';

      // Detectar si es una solicitud de PDF
      try {
        const jsonMatch = aiResponse.match(/\{[\s\S]*"type":\s*"pdf_request"[\s\S]*\}/);
        if (jsonMatch && ctx) {
          const pdfRequest = JSON.parse(jsonMatch[0]);
          await this.generateAndSendPDF(ctx, user, pdfRequest.startDate, pdfRequest.endDate, pdfRequest.description);
          return ''; // No enviar respuesta de texto, solo el PDF
        }
      } catch (e) {
        // No es JSON válido, continuar normalmente
        console.log('No se detectó solicitud de PDF válida');
      }

      return aiResponse;
    } catch (error) {
      console.error('Error al consultar a Groq:', error);
      return '❌ Lo siento, tuve un problema al procesar tu pregunta. Intenta de nuevo.';
    }
  }

  /**
   * Genera y envía un PDF de consumo con rango de fechas personalizado
   */
  private async generateAndSendPDF(
    ctx: any,
    user: UserDocument,
    startDateStr: string,
    endDateStr: string,
    description: string
  ): Promise<void> {
    try {
      await ctx.reply(`📄 Generando PDF de ${description}...`);

      // Convertir strings a fechas UTC
      const startDate = new Date(startDateStr + 'T00:00:00.000Z');
      const endDate = new Date(endDateStr + 'T23:59:59.999Z');

      // Obtener datos de consumo del rango
      const consumptionData = await this.dailyConsumptionModel.find({
        homeId: user.homeId,
        date: { $gte: startDate, $lte: endDate }
      }).sort({ date: 1 }).lean();

      if (consumptionData.length === 0) {
        await ctx.reply('⚠️ No hay datos de consumo para el rango solicitado.');
        return;
      }

      // Obtener información del hogar
      const home = await this.homeModel.findById(user.homeId).lean();

      // Obtener sensores
      const sensors = await this.sensorModel.find({ homeId: user.homeId }).lean();

      // Calcular totales
      const totalConsumption = consumptionData.reduce((sum, day) => sum + day.totalLiters, 0);
      const avgDaily = totalConsumption / consumptionData.length;

      // Agrupar por sensor
      const sensorConsumption = new Map();
      consumptionData.forEach(day => {
        day.bySensor.forEach((s: any) => {
          const current = sensorConsumption.get(s.sensorId) || 0;
          sensorConsumption.set(s.sensorId, current + s.liters);
        });
      });

      // Generar PDF
      const pdfBuffer = await generateConsumptionPDF({
        userName: user.name,
        homeAddress: home?.address || 'No especificada',
        period: description,
        startDate: startDate,
        endDate: endDate,
        totalConsumption: totalConsumption,
        averageDaily: avgDaily,
        dailyConsumption: consumptionData.map(d => ({
          date: d.date,
          totalLiters: d.totalLiters,
          bySensor: d.bySensor
        })),
        sensors: sensors
      });

      // Enviar PDF por Telegram
      await ctx.replyWithDocument(
        Input.fromBuffer(pdfBuffer, `consumo_${startDateStr}_${endDateStr}.pdf`),
        { caption: `📊 Reporte de Consumo: ${description}\n\n📅 Período: ${startDate.toLocaleDateString('es-CL')} - ${endDate.toLocaleDateString('es-CL')}\n💧 Total: ${totalConsumption.toFixed(2)}L\n📈 Promedio diario: ${avgDaily.toFixed(2)}L` }
      );

    } catch (error) {
      console.error('Error generando PDF:', error);
      await ctx.reply('❌ Error al generar el PDF. Por favor intenta de nuevo.');
    }
  }
}
