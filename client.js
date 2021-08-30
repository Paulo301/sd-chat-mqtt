var mqtt = require('mqtt');
var client  = mqtt.connect('mqtt://test.mosquitto.org');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const user = 'usuario-01';
const level = 'simple';
let room = '';
let inRoom = false;

client.on('connect', function () {
  client.subscribe('sistema', function (err) {
    if (!err) {
      console.log("Sem erro");
    }
  });
});

client.on('message', function (topic, message) {
  // message is Buffer
  const dados = JSON.parse(message.toString());

  switch(topic){
    case 'sistema':
      if(dados.user === user){
        console.log(dados.data);
      }
      break;
    case 'listar-salas':
      break;
    case room:
      break;
  }
});

console.log("Digite:"+
                "\n>>>'/join nome_da_sala' -> para entrar numa das salas existentes"+
                "\n>>>'/create nome_da_sala' -> para criar uma sala nova se for administrador"+
                "\n>>>'/list' -> para listar as salas");

rl.on('line', line => {
  if (inRoom){
    if(line.slice(0,5)==="/join"){ 
      client.publish('entrar-sala', JSON.stringify({user: user, data: line.slice(6)}));
    } else if(line.slice(0,7)==="/create"){
      client.publish('criar-sala', JSON.stringify({user: user, data: line.slice(8)}));
    } else if(line.slice(0,5)==="/list"){
      client.publish('listar-salas', JSON.stringify({user: user, data: ""}));
    }
  } else {

  }
});