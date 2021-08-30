var mqtt = require('mqtt');
var server  = mqtt.connect('mqtt://test.mosquitto.org');

const salaGeral = 'sala-geral';
const ban = 'ban';
const criarSala = 'criar-sala';
const entrarSala = 'entrar-sala';
const sairSala = 'sair-sala';

let salas = [{nome: 'sala-geral', participantes: []}]

server.on('connect', function () {
  server.subscribe(salaGeral, function (err) {
    if (!err) {
      console.log("sem erro");
    }
  });
  server.subscribe(ban, function (err) {
    if (!err) {
      console.log("sem erro");
    }
  });
  server.subscribe(criarSala, function (err) {
    if (!err) {
      console.log("sem erro");
    }
  });
  server.subscribe(entrarSala, function (err) {
    if (!err) {
      console.log("sem erro");
    }
  });
  server.subscribe(sairSala, function (err) {
    if (!err) {
      console.log("sem erro");
    }
  });
});

server.on('message', function (topic, message) {
  // message is Buffer
  const dados = JSON.parse(message.toString());

  switch(topic){
    case salaGeral:
      break;
    case ban:
      break;
    case criarSala:
      break;
    case entrarSala:
      break;
    case sairSala:
      break;
  }
  console.log(message.toString());
  server.end();
});