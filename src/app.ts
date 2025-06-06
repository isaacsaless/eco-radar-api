import Fastify from 'fastify';
import routes from './routes/get-data'; 

const app = Fastify();

app.register(routes);

app.listen({ port: 3000, host:'0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
