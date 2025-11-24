import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Telegraf, Markup, Context } from 'telegraf';
import OpenAI from 'openai';
import { TelegramUser, TelegramUserDocument } from '../../schemas/telegram-user.schema';
import { User, UserDocument } from '../../schemas/user.schema';
import { DailyConsumption, DailyConsumptionDocument } from '../../schemas/daily-consumption.schema';
import { Sensor, SensorDocument } from '../../schemas/sensor.schema';
import { Alert, AlertDocument } from '../../schemas/alert.schema';

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
      const aiResponse = await this.askAIWithUserData(userMessage, user as UserDocument);
      await ctx.reply(aiResponse, { parse_mode: 'Markdown' });
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

  private async askAIWithUserData(question: string, user: UserDocument): Promise<string> {
    if (!this.openai) {
      return '⚠️ El agente de IA no está disponible en este momento.';
    }

    try {
      // Obtener datos del usuario para contexto
      let userContext = '';

      if (user && user.homeId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayConsumption = await this.dailyConsumptionModel.findOne({
          homeId: user.homeId,
          date: { $gte: today },
        });

        const sensors = await this.sensorModel.find({ homeId: user.homeId });
        const alerts = await this.alertModel.find({ homeId: user.homeId, status: 'active' });

        userContext = `
DATOS DEL USUARIO:
- Nombre: ${user.name}
- Personas en hogar: ${user.people}
- Límite diario: ${user.limitLitersPerDay}L
- Consumo hoy: ${todayConsumption?.totalLiters || 0}L
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

❌ NO PUEDES RESPONDER SOBRE:
- Series, películas, entretenimiento
- Recetas de cocina
- Noticias, deportes, política
- Consejos generales no relacionados con agua
- Cualquier tema fuera de AquaTracking

PERSONALIDAD Y ESTILO:
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
        max_tokens: 300,
      });

      return completion.choices[0]?.message?.content || '❌ No pude generar una respuesta.';
    } catch (error) {
      console.error('Error al consultar a Groq:', error);
      return '❌ Lo siento, tuve un problema al procesar tu pregunta. Intenta de nuevo.';
    }
  }
}
