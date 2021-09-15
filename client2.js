var mqtt = require('mqtt');
const readline = require('readline');

var client  = mqtt.connect('mqtt://test.mosquitto.org');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const user = 'usuario-02';
const level = 'administrator';

let room = '';
let inRoom = false;

client.on('connect', function () {
  client.subscribe('sistema', function (err) {
    if (!err) {
      console.log("Sem erro");
    }
  });
  client.subscribe('listar-salas', function (err) {
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
        if (dados.command === "failed_to_join"){
          console.log("Não foi possível entrar na sala");
        }else if(dados.command === "joined_room"){
          client.subscribe(dados.data.room, function (err) {
            if (!err) {
              inRoom = true;
              room = dados.data.room;

              console.log(`Você está na sala: ${dados.data.room}`);
              console.log("Usuários na sala:");
              dados.data.participants.map((p) => {
                console.log(`>>${p}`);
              });
              console.log("Se você for administrador pode digitar '/ban nome_do_usuario' para banir um usuário da sala");
              console.log("Você pode a qualquer momento digitar '/quit' para sair da sala");       
            } else{
              console.log("Não foi possível conectar à sala.");
              client.publish('sair-sala', JSON.stringify({user: user, data: dados.data.room}));
            }
          });
        }else if(dados.command === 'quit_success'){
          client.unsubscribe(room, function (err) {
            if (!err) {
              inRoom = false;
              room = '';
              console.log("Você deixou a sala com sucesso");

              console.log("Digite:"+
                          "\n>>>'/join nome_da_sala' -> para entrar numa das salas existentes"+
                          "\n>>>'/create nome_da_sala' -> para criar uma sala nova se for administrador"+
                          "\n>>>'/list' -> para listar as salas");
    
              console.log("Salas:");
              dados.data.map((room) => {
                console.log(`>>>${room.room}`);
              });
            } else{
              console.log("Houve uma falha ao deixar a sala");
            }
          });
        }else if(dados.command === 'create_success'){
          console.log("Sala criada com sucesso!");
        }else if(dados.command === 'ban_success'){
          console.log(dados.data);
        }else if(dados.command === 'failed_ban'){
          console.log(dados.data);
        }else if(dados.command === 'create_fail'){
          console.log(dados.data);
        }else if(dados.command === 'banned'){
          client.unsubscribe(room, function (err) {
            if (!err) {
              room = "";
              inRoom = false;
              console.log(`Você foi banido da sala ${dados.data.room} pelo usuário ${dados.data.adm}` );
              console.log("Digite:"+
                          "\n>>>'/join nome_da_sala' -> para entrar numa das salas existentes"+
                          "\n>>>'/create nome_da_sala' -> para criar uma sala nova se for administrador"+
                          "\n>>>'/list' -> para listar as salas");
          
              console.log("Salas");
              dados.data.rooms.map((room) => {
                console.log(`>>>${room.room}`);
              });
            } else{
              client.publish('sistema', JSON.stringify({user: dados.adm, command: "failed_ban", data: "Ocorreu um erro no banimento do usuário"}));
            }
          });
        }
      }
      break;
    case 'listar-salas':
      if((dados.user === user) && (dados.data !== "")){
        console.log("Salas")
        dados.data.map((room) => {
          console.log(`>>>${room.room}`);
        });
      }
      break;
    case room:
      if(dados.user !== user){
        console.log(`>${dados.user}: ${dados.data.message}`)
      }
      break;
  }
});

console.log("Digite:"+
                "\n>>>'/join nome_da_sala' -> para entrar numa das salas existentes"+
                "\n>>>'/create nome_da_sala' -> para criar uma sala nova se for administrador"+
                "\n>>>'/list' -> para listar as salas");

rl.on('line', line => {
  if (!inRoom){
    if(line.slice(0,5)==="/join"){ 
      client.publish('entrar-sala', JSON.stringify({user: user, data: line.slice(6)}));
    } else if(line.slice(0,7)==="/create"){
      client.publish('criar-sala', JSON.stringify({user: user, data: {room: line.slice(8), level}}));
    } else if(line.slice(0,5)==="/list"){
      client.publish('listar-salas', JSON.stringify({user: user, data: ""}));
    } else {
      console.log("Você digitou um comando inválido!");
    }
  } else {
    if(line.slice(0,5)==="/quit"){
      client.publish('sair-sala', JSON.stringify({user: user, data: room}));
    }else if(line.slice(0,4)==="/ban"){
      client.publish('ban', JSON.stringify({user: user, data: {user: line.slice(5), room: room, level}}));
    } else{
      client.publish(room, JSON.stringify({user: user, data: {room, message: line}}));
    }
  }
});