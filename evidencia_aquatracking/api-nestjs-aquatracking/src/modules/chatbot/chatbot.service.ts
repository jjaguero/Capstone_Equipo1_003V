import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';

@Injectable()
export class ChatbotService implements OnModuleInit {
  private bot: Telegraf;
  private frontendUrl: string;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
    if (!botToken) {
      console.error('TELEGRAM_BOT_TOKEN no está configurado.');
      return;
    }

    this.bot = new Telegraf(botToken);

    // URL del frontend para construir enlaces (fallback a localhost)
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5174';

    // Comando /start con menú de acciones más frecuentes
    this.bot.start((ctx) => {
      ctx.reply(
        '¡Bienvenido al chatbot de AquaTracking! Selecciona una opción o escribe tu pregunta:',
        Markup.inlineKeyboard([
          [
            Markup.button.url(
              '📊 Dashboard',
              `${this.frontendUrl}/user/dashboard`,
            ),
            Markup.button.url(
              '⏱️ Tiempo Real',
              `${this.frontendUrl}/user/realtime`,
            ),
          ],
          [
            Markup.button.url(
              '🔔 Alertas',
              `${this.frontendUrl}/user/alerts`,
            ),
            Markup.button.url(
              '💧 Consumo',
              `${this.frontendUrl}/user/consumption`,
            ),
          ],
          [
            Markup.button.url(
              '🛠️ Soporte',
              `${this.frontendUrl}/user/support`,
            ),
            Markup.button.url(
              '👤 Perfil',
              `${this.frontendUrl}/settings`,
            ),
          ],
          [Markup.button.callback('❓ FAQ', 'faq')],
        ]),
      );
    });

    // Comando /help
    this.bot.help((ctx) => {
      ctx.reply(
        'Puedo ayudarte con: consumo, sensores, alertas y soporte. Usa /faq para preguntas frecuentes.',
      );
    });

    // Acción para mostrar FAQs desde botón
    this.bot.action('faq', async (ctx) => {
      await this.sendFAQ(ctx);
    });

    // Comando /faq directo
    this.bot.command('faq', async (ctx) => {
      await this.sendFAQ(ctx);
    });

    // Intents por palabras clave
    this.registerKeywordIntents();

    this.bot.launch();

    console.log('Bot de Telegram iniciado con FAQs y sugerencias.');
  }

  private async sendFAQ(ctx: any) {
    const faqs = [
      {
        q: '¿Cómo veo mi consumo de agua?',
        a: `Puedes ver tu historial y análisis en "💧 Consumo": ${this.frontendUrl}/user/consumption`,
      },
      {
        q: '¿Dónde veo datos en tiempo real?',
        a: `Revisa "⏱️ Tiempo Real": ${this.frontendUrl}/user/realtime`,
      },
      {
        q: 'Tengo problemas con un sensor',
        a: `Abre un ticket en "🛠️ Soporte": ${this.frontendUrl}/user/support. Si hay alertas críticas, aparecerán en ${this.frontendUrl}/user/alerts`,
      },
      {
        q: '¿Cómo actualizo mis datos de perfil?',
        a: `Puedes editar tu perfil aquí: ${this.frontendUrl}/settings`,
      },
      {
        q: '¿Qué significa una alerta crítica?',
        a: 'Una alerta crítica indica consumo anómalo, posible fuga o sensor inactivo prolongado. Revisa Alertas y, si persiste, crea un ticket en Soporte.',
      },
    ];

    let text = 'Preguntas Frecuentes:\n\n';
    faqs.forEach((item, idx) => {
      text += `${idx + 1}. ${item.q}\n${item.a}\n\n`;
    });

    await ctx.reply(text);
  }

  private registerKeywordIntents() {
    // Consumo / gasto
    this.bot.hears(/consumo|gasto|litros|historial/i, (ctx) => {
      ctx.reply(
        `Tu consumo y análisis está en "💧 Consumo": ${this.frontendUrl}/user/consumption`,
      );
    });

    // Sensores / conexión / estado
    this.bot.hears(/sensor|sensores|conexión|estado/i, (ctx) => {
      ctx.reply(
        `Información de tus sensores: ${this.frontendUrl}/user/sensors. Si un sensor no aparece o marca inactivo, abre Soporte: ${this.frontendUrl}/user/support`,
      );
    });

    // Soporte / ayuda / ticket
    this.bot.hears(/soporte|ayuda|ticket|problema/i, (ctx) => {
      ctx.reply(
        `Cuéntanos el problema en "🛠️ Soporte": ${this.frontendUrl}/user/support. Un técnico te ayudará apenas se asigne el ticket.`,
      );
    });

    // Alertas / notificaciones
    this.bot.hears(/alerta|crítica|notificación/i, (ctx) => {
      ctx.reply(
        `Revisa tus alertas: ${this.frontendUrl}/user/alerts. Si ves consumo anómalo, verifica llaves y fugas, y abre un ticket si persiste.`,
      );
    });

    // Perfil / datos
    this.bot.hears(/perfil|datos|email|rut/i, (ctx) => {
      ctx.reply(
        `Actualiza tu perfil aquí: ${this.frontendUrl}/settings. Mantener tus datos al día mejora el soporte.`,
      );
    });

    // Fallback: cualquier texto no reconocido
    this.bot.on('text', (ctx) => {
      ctx.reply(
        'No estoy seguro de entender. Prueba /faq o dime "consumo", "sensores", "alertas" o "soporte".',
      );
    });
  }
}