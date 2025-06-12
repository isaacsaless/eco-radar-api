import Fastify from 'fastify';
import getDataRoute from './routes/get-data';
import addPropriedadeRoute from './routes/add-propriedade';

const app = Fastify();

app.register(getDataRoute);
app.register(addPropriedadeRoute);

app.listen({ port: 3000, host:'0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});