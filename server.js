/**
 * This is the main Node.js server script for your project
 * Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
 */

const path = require("path");
const r = require("request");

// Require the fastify framework and instantiate it
const fastify = require("fastify")({
  // Set this to true for detailed logging:
  logger: false,
});

// Setup our static files
fastify.register(require("@fastify/static"), {
  root: path.join(__dirname, "public"),
  prefix: "/", // optional: default '/'
});

// View is a templating manager for fastify
fastify.register(require("@fastify/view"), {
  engine: {
    handlebars: require("handlebars"),
  },
});

fastify.get("/", function (request, reply) {
  const estacoes = require("./src/estacoes.json");
  if (request.query.e) {
    if (estacoes.hasOwnProperty(request.query.e)) {
      r.get(
        process.env.endpoint.replace('estacao', estacoes[request.query.e]),
        (error, response, body) => {
          if (error) {
            throw new Error(`HTTP error! Status: ${response.status}`);
            return reply
              .code(500)
              .header("Content-Type", "text/plain; charset=utf-8")
              .send("Deu ruim, disgulpa. :( )");
          } else {
            const data = JSON.parse(body);
            return reply.view("/src/pages/onibus.hbs", {
              "onibus": data.length,
              "tempo": ((data.length > 0) ? data[0].arrivalTime : null)
            });
          }
        }
      );
    } else {
      return reply
        .code(200)
        .header("Content-Type", "text/plain; charset=utf-8")
        .send("Ops. Ainda não...");
    }
  } else {
    return reply
        .code(500)
        .header("Content-Type", "text/plain; charset=utf-8")
        .send("Pera...");
  }
});

// Run the server and report out to the logs
fastify.listen(
  { port: process.env.PORT, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Your app is listening on ${address}`);
  }
);
