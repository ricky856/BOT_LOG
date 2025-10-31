// package.json -> "type": "module"
// npm i discord.js
import { Client, GatewayIntentBits, Partials } from "discord.js";

const TOKEN = process.env.DISCORD_TOKEN;         // Bot token
const CHANNEL_ID = "1431595668689911889";      // ej. 123456789012345678
const ROLE_ID = "816732884407943188";       // ej. 112233445566778899
const DELETE_ORIGINAL = false;                   // true si quieres borrar el mensaje del webhook

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
    // Ignora mensajes del propio bot que no sean webhooks
    if (message.author?.bot && !message.webhookId) return;

    // Solo en el canal objetivo
    if (message.channelId !== CHANNEL_ID) return;

    // Solo si es un mensaje publicado por un WEBHOOK
    if (!message.webhookId) return;

    const content = (message.content ?? "").trim();

    await message.channel.send({
      content: `<@&${ROLE_ID}> ${content}`,
      allowedMentions: { roles: [ROLE_ID] }
    });

    if (DELETE_ORIGINAL && message.deletable) {
      await message.delete().catch(() => {});
    }
  } catch (err) {
    console.error("Error reenviando mensaje del webhook:", err);
  }
});

client.login(TOKEN);