var mqtt = require('mqtt');
var server  = mqtt.connect('mqtt://test.mosquitto.org');

const salaGeral = 'sala-geral';
const ban = 'ban';
const criarSala = 'criar-sala';
const entrarSala = 'entrar-sala';
const sairSala = 'sair-sala';
const listarSalas = 'listar-salas';

let rooms = [{room: 'sala-geral', participants: []}]

server.on('connect', function () {
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
  server.subscribe(listarSalas, function (err) {
    if (!err) {
      console.log("sem erro");
    }
  });
});

server.on('message', function (topic, message) {
  // message is Buffer
  const dados = JSON.parse(message.toString());

  switch(topic){
    case ban:
      if(dados.data.level === "administrator"){
        const tempRoom = rooms.find((room) => room.room === dados.data.room);
        const userToBanInRoom = tempRoom.participants.findIndex((user) => user === dados.data.user);

        if(tempRoom !== undefined){
          tempRoom.participants = tempRoom.participants.filter((p) => p !== dados.data.user);
          rooms = rooms.map((room) => {
            if(room.room === tempRoom.room){
              return tempRoom;
            }else{
              return room;
            }
          });
        }

        if(userToBanInRoom !== -1){
          server.publish('sistema', JSON.stringify({user: dados.user, command: "ban_success", data: "Usuário banido com sucesso"}));
          server.publish('sistema', JSON.stringify({user: dados.data.user, command: "banned", data: {room: dados.data.room, rooms: rooms, adm: dados.user}}));
        } else{
          server.publish('sistema', JSON.stringify({user: dados.user, command: "failed_ban", data: "Usuário não encontrado"}));
        }
      } else{
        server.publish('sistema', JSON.stringify({user: dados.user, command: "failed_ban", data: "Você não tem permissão para banir."}));
      }
      console.log(rooms);
      break;
    case criarSala:
      if(dados.data.level === "administrator"){
        rooms.push({room: dados.data.room, participants: []});
        server.publish('sistema', JSON.stringify({user: dados.user, command: "create_success", data: dados.data}));
      } else{
        server.publish('sistema', JSON.stringify({user: dados.user, command: "create_fail", data: "Você não tem permissão para criar salas"}));
      }
      console.log(rooms);
      break;
    case entrarSala:
      const tempRoom = rooms.find((room) => room.room === dados.data);
      if(tempRoom !== undefined){
        tempRoom.participants.push(dados.user);
        rooms = rooms.map((room) => {
          if(room.room === tempRoom.room){
            return tempRoom;
          }else{
            return room;
          }
        });
        server.publish('sistema', JSON.stringify({user: dados.user, command: "joined_room", data: {room: tempRoom.room, participants: tempRoom.participants}}));
      } else{
        server.publish('sistema', JSON.stringify({user: dados.user, command: "failed_to_join", data: ""}));
      }

      console.log(rooms);
      break;
    case sairSala:
      const tempRoom2 = rooms.find((room) => room.room === dados.data);

      if(tempRoom2 !== undefined){
        tempRoom2.participants = tempRoom2.participants.filter((p) => p !== dados.user);
        rooms = rooms.map((room) => {
          if(room.room === tempRoom2.room){
            return tempRoom2;
          }else{
            return room;
          }
        });
      }
        
      server.publish('sistema', JSON.stringify({user: dados.user, command: "quit_success", data: rooms}));

      console.log(rooms);
      break;
    case listarSalas:
      if (dados.data === ""){
        server.publish('listar-salas', JSON.stringify({user: dados.user, data: rooms}));
      }
      break;
  }
  console.log(message.toString());
  // server.end();
});