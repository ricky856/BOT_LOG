import { Client, GatewayIntentBits, Partials } from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;           // Token del bot
const CHANNEL_ID = "1431595668689911889";                 // ej: 123456789012345678
const ROLE_ID = "816732884407943188";                  // ej: 112233445566778899
const DELETE_BOT_MESSAGES = true;                  // true = borra los mensajes @ARK del bot, false = los deja

// Frases que activan la mención
const TRIGGER_PHRASES = [
  "was killed by",
  "destroyed your",
  "lunar",
  "your tribe killed"
];

// Frases que deben excluirse (no hacen ping aunque coincidan)
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

// ✅ Evento de conexión
client.once("clientReady", () => {
  console.log(`Conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    // Ignorar mensajes del propio bot (para no crear bucles)
    if (message.author?.id === client.user.id) {
      // Si el mensaje lo ha mandado el bot y se debe borrar automáticamente:
      if (DELETE_BOT_MESSAGES && message.content.includes(`<@&${ROLE_ID}>`)) {
        setTimeout(() => {
          message.delete().catch(() => {});
        }, 15000); // ← tiempo antes de borrarlo (15 segundos)
      }
      return;
    }

    // Solo en el canal configurado
    if (message.channelId !== CHANNEL_ID) return;

    // Solo si el mensaje proviene de un webhook
    if (!message.webhookId) return;

    const content = (message.content ?? "").trim();
    const lower = content.toLowerCase();

    // 🚫 Ignorar si contiene alguna frase excluida
    const isExcluded = EXCLUDED_PHRASES.some(phrase => lower.includes(phrase));
    if (isExcluded) return;

    // 🔍 Buscar si contiene una frase activadora
    const shouldPing = TRIGGER_PHRASES.some(phrase => lower.includes(phrase));

    // Si cumple condición → enviar mención
    if (shouldPing) {
      await message.channel.send({
        content: `<@&${ROLE_ID}> ${content}`,
        allowedMentions: { roles: [ROLE_ID] }
      });
      console.log(`Mención enviada: ${content}`);
    }

  } catch (err) {
    console.error("Error procesando mensaje:", err);
  }
});

client.login(TOKEN);