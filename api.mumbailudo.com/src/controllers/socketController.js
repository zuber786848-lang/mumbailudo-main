const socket = require('socket.io');
const ludoGame = require('../models/ludo.game');
const ludoUser = require('../models/ludo.user');
const ludoTransaction = require('../models/ludo.transaction');
// const { errorResponse, successResponse } = require('../helper/status.response');

module.exports = function (server) {
  // const io = socket(server, {
  //   cors: {
  //     origin: "*",
  //     credentials: true,
  //   },
  // });

  const io = socket(server, {
    cors: {
      origin: "https://mumbailudo.com", // Ensure this matches your client-side URL
      methods: ["GET", "POST"],
      credentials: true,
    },
  });


  io.on('connection', (socket) => {
    console.log('Connected to socket', socket.id);

    socket.on('socket-created-game', async () => {
      try {
        const isGame = await ludoGame.find({
          $or:[
            {
                status: "new"
            },
            {
                status: "requested"
            },
            {
                status: "running"
            },
            {
                status: "conflict"
            },

        ],
        }).populate({
          path: "creator_id",
          select: "name phone" // Specify the fields you want to include
      })
      .populate({
          path: "acceptor_id",
          select: "name phone" // Specify the fields you want to include
      })

      if (isGame && isGame.length > 0) {
        io.emit('socket-receive-game', { data: isGame }); // Broadcast to all clients
      } else {
        io.emit('socket-receive-game', { data: [], message: 'No games found' });
      }
      } catch (e) {
        io.emit('socket-receive-game', { error: e.message });
      }
    });

    socket.on('socket-running-game', async () => {
      try {
        const isGame = await ludoGame.find({
          $or:[
            {
                status: "running"
            },
            {
                status: "conflict"
            },

        ],
        }).populate({
          path: "creator_id",
          select: "name phone" // Specify the fields you want to include
      })
      .populate({
          path: "acceptor_id",
          select: "name phone" // Specify the fields you want to include
      })

      if (isGame && isGame.length > 0) {
        io.emit('socket-receive-running-game', { data: isGame }); // Broadcast to all clients
      } else {
        io.emit('socket-receive-game', { data: [], message: 'No games found' });
      }
      } catch (e) {
        io.emit('socket-receive-game', { error: e.message });
      }
    });

    socket.on('socket-set-game-details', async (data) => {
      try {
        const isGame = await ludoGame.findOne({
            _id: data
        }).populate({
          path: "creator_id",
          select: "name phone" // Specify the fields you want to include
      })
      .populate({
          path: "acceptor_id",
          select: "name phone" // Specify the fields you want to include
      });

        if (isGame) {
          io.emit('socket-receive-game-details', { data: isGame }); // Broadcast to all clients
          console.log("isGame", isGame);
        } else {
          io.emit('socket-receive-game-details', { error: 'No new games found' });
        }
      } catch (e) {
        io.emit('socket-receive-game-details', { error: e.message });
      }
    });

    socket.on('socket-set-refresh', async () => {
      try {

          io.emit('socket-receive-refresh'); // Broadcast to all clients

      } catch (e) {
        io.emit('socket-receive-refresh', { error: e.message });
      }
    });

    socket.on('socket-created-deposit', async () => {

        io.emit('socket-deposit-receive-refresh'); // Broadcast to all clients

    });
    socket.on('socket-created-withdrawal', async () => {

        io.emit('socket-withdrawal-receive-refresh'); // Broadcast to all clients

    });


    socket.on('disconnect', () => {
      console.log('Disconnected from the server');
    });
  });
};
