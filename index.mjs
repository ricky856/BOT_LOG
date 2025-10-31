import { Client, GatewayIntentBits, Partials } from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;           // Token del bot
const CHANNEL_ID = "1431595668689911889";                 // ej: 123456789012345678
const ROLE_ID = "816732884407943188";                  // ej: 112233445566778899
const DELETE_ORIGINAL = true;                     // true si quieres borrar el mensaje original del webhook

// Palabras o frases que activarán la mención
const TRIGGER_PHRASES = [
  "was killed by",
  "destroyed your",
  "LUNAR"
];

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

client.on("ready", () => {
  console.log(`Conectado como ${client.user.tag}`);
});

client.on("messageCreate", async (message) => {
  try {
    // Ignorar mensajes del propio bot
    if (message.author?.bot && !message.webhookId) return;
    // Solo en el canal configurado
    if (message.channelId !== CHANNEL_ID) return;
    // Solo mensajes que provengan de un webhook
    if (!message.webhookId) return;

    const content = (message.content ?? "").trim();

    // Verifica si el mensaje contiene alguna frase de activación
    const lower = content.toLowerCase();
    const found = TRIGGER_PHRASES.some(phrase => lower.includes(phrase.toLowerCase()));

    if (found) {
      await message.channel.send({
        content: `<@&${ROLE_ID}> ${content}`,
        allowedMentions: { roles: [ROLE_ID] }
      });
      console.log(`Mención enviada: ${content}`);
    }

    if (DELETE_ORIGINAL && message.deletable) {
      await message.delete().catch(() => {});
    }
  } catch (err) {
    console.error("Error procesando mensaje:", err);
  }
});

client.login(TOKEN);
