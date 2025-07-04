import Fastify from 'fastify';
import getDataRoute from './routes/get-data';
import addPropriedadeRoute from './routes/add-propriedade';
import getPropriedadesRoute from './routes/get-propriedades';
import getAlertasRoute from './routes/get-alertas';
import deletePropriedadeRoute from './routes/delete-propriedade';
import aiChatBotRoute from './routes/ai-chat-bot';
import getTtsRoute from './routes/get-tts';

const app = Fastify();

app.register(getDataRoute);
app.register(addPropriedadeRoute);
app.register(getPropriedadesRoute);
app.register(getAlertasRoute);
app.register(deletePropriedadeRoute);
app.register(aiChatBotRoute);
app.register(getTtsRoute);

app.listen({ port: 3000, host:'0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});