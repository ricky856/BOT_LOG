import { Client, GatewayIntentBits, Partials } from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;           // Token del bot
const CHANNEL_ID = "1431595668689911889";                 // ej: 123456789012345678
const ROLE_ID = "816732884407943188";                  // ej: 112233445566778899

// Frases que activan la mención
const TRIGGER_PHRASES = [
  "was killed by",
  "destroyed your",
  "lunar",
  "your tribe killed"
];

// Frases exactas a excluir (si están, NO se hace ping ni se borra nada)
const EXCLUDED_PHRASES = [
  "destroyed your 'inx c4 charge'"
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

// Evento de conexión (preparado para v15+)
client.once("clientReady", () => {
  console.log(`Conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    // Ignora mensajes del propio bot (para evitar bucles)
    if (message.author?.id === client.user.id) return;

    // Solo en el canal configurado
    if (message.channelId !== CHANNEL_ID) return;

    // Solo mensajes que provienen de un WEBHOOK
    if (!message.webhookId) return;

    const content = (message.content ?? "").trim();
    const lower = content.toLowerCase();

    // 1) Si es un mensaje EXCLUIDO → no hacer nada
    const isExcluded = EXCLUDED_PHRASES.some(p => lower.includes(p));
    if (isExcluded) return;

    // 2) ¿Contiene alguna frase que activa ping?
    const shouldPing = TRIGGER_PHRASES.some(p => lower.includes(p));

    if (shouldPing) {
      // a) Enviar el mensaje del BOT con @ARK
      await message.channel.send({
        content: `<@&${ROLE_ID}> ${content}`,
        allowedMentions: { roles: [ROLE_ID] }
      });
      console.log(`Ping enviado y se eliminará el webhook original: ${content}`);

      // b) Borrar SOLO el mensaje ORIGINAL del WEBHOOK (dejar el del bot)
      if (message.deletable) {
        // pequeño retraso para asegurar orden visual
        setTimeout(() => {
          message.delete().catch(() => {});
        }, 500);
      }
    }
    // Si NO hay ping → no se borra nada y el webhook queda intacto.

  } catch (err) {
    console.error("Error procesando mensaje:", err);
  }
});

client.login(TOKEN);