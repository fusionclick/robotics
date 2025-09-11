const express = require("express");
const app = express();
const dotenv = require("dotenv");
const axios = require("axios");
// const FormData = require('form-data');
dotenv.config();
connectDB = require("./config/db");
const http = require("http");
const cors = require("cors");
app.use(cors());
const db = connectDB();
const server = http.createServer(app);
app.use(express.json());
var io = require("socket.io")(server);
const moment = require("moment-timezone");
const jeetoJokerRoom = require("./models/room");
async function sleep(timer) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timer);
  });
}
app.options("/delete", cors());

app.use(
  cors({
    origin: "https://smart.smartwingames.com", // Replace with your actual PHP server domain
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: "Content-Type,Authorization",
    credentials: true, // Allow credentials (cookies, headers)
    optionsSuccessStatus: 200,
  })
);

app.post("/delete", async (req, res) => {
  try {
    await jeetoJokerRoom.deleteMany({});
    res.status(200).json({
      message: "All documents deleted successfully",
    });
    console.log("hhhhhh");
  } catch (e) {
    console.log(e);
  }
});

io.on("connection", async (socket) => {
  /**
   * Connection Handler.
   **/
  console.log(`one socket connected:${socket.id}`);
  /**
   * Socket Events For Application Logic.
   **/
  socket.on("joinRoom", async (body) => {
    try {
      let playerId = body.playerId;
      let name = body.name;
      let totalCoin = body.totalCoin;
      let profileImageUrl = body.profileImageUrl;
      let playerStatus = body.playerStatus;
      let gameName = body.gameName;
      console.log(gameName, "join room event hiiiiiiiiiiii");

      let all = await jeetoJokerRoom.find();
      let roomId = " ";

      all.every((element) => {
        if (element.isJoin == true) {
          roomId = element._id.toString();
          return false;
        }
        return true;
      });

      console.log(roomId, "room id in join room event");
      if (roomId == " ") {
        //CREATES A NEW ROOM IF NO EMPTY ROOM IS FOUND

        console.log(`${name}`);

        let roomJJ = new jeetoJokerRoom();

        let player = {
          socketID: socket.id,
          playerId: playerId,
          name: name,
          playerType: "Real Player",
          totalCoin: totalCoin,
          profileImageUrl: profileImageUrl,
          playerStatus: playerStatus,
        };

        roomJJ.players.push(player);
        roomJJ.gameName = gameName;

        let roomId = roomJJ._id.toString();

        socket.join(roomId);

        socket.emit("createRoomSuccess", roomJJ);
        roomJJ.isJoin = true;
        roomJJ = await roomJJ.save();
        io.to(roomId).emit("startGame", true);

        console.log(roomJJ);
      } else {
        //JOINS A ROOM WHICH IS NOT FULL
        roomJJ = await jeetoJokerRoom.findById(roomId);

        if (roomJJ.isJoin === true) {
          let player = {
            socketID: socket.id,
            playerId: playerId,
            name: name,
            playerType: "Real Player",
            totalCoin: totalCoin,
            profileImageUrl: profileImageUrl,
            playerStatus: playerStatus,
          };

          let players = roomJJ.players;

          // Check if player already exists
          let isExistingPlayer = players.some(
            (element) => element.playerId == playerId
          );

          if (isExistingPlayer) {
            // Remove existing player
            players = players.filter((element) => element.playerId != playerId);
            roomJJ.players = players;
            await roomJJ.save();
          }

          // Add new/updated player
          roomJJ.players.push(player);

          socket.join(roomId);

          roomJJ = await roomJJ.save();

          io.to(roomId).emit("updatedPlayers", roomJJ.players);
          socket.emit("updatedPlayer", player);
          io.to(roomId).emit("updatedRoom", roomJJ);
          io.to(roomId).emit("roomMessage", `${name} has joined the room.`);
          io.to(roomId).emit("GameId", roomJJ.gameId);
          io.to(roomId).emit("drawTime", roomJJ.draw_time);
        } else {
          socket.emit(
            "errorOccured",
            "Sorry! The Room is full. Please try again."
          );
          return;
        }
      }
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("start", async (body) => {
    try {
      console.log("game started");
      let roomId = body.roomId;
      let gameName = body.gameName;
      // //console.log(gameName,roomId,"66666666666666666666666666666666")
      let roomJJ = await jeetoJokerRoom.findById(roomId);
      socket.join(roomId);
      let mediumCounter = 0;
      do {
        var gameId = Math.floor(Date.now() / 1000).toString();
        const istMoment = moment().tz("Asia/Kolkata");

        // //console.log(gameId, "game idddddddddddddddddddddd");
        // console.log(istMoment, "ist momentttttttttttttttttttttttttttttttttt");
        // Format the IST time in 12-hour format
        // Calculate the IST time 5 minutes ahead
        const futureTimeMoment = istMoment.clone().add(3, "minutes");
        // Convert to 12-hour format with AM/PM
        const futureFormattedTime = futureTimeMoment.format("h:mm A");

        // console.log(futureFormattedTime,"kkkkkkkkkkk")
        io.to(roomId).emit("drawTime", futureFormattedTime); // Emit formatted time
        io.to(roomId).emit("GameId", gameId);
        // console.log(typeof gameId, "kkkkkkkkkkkkkkkkkkkkk");
        io.to(roomId).emit("betting", true);

        roomJJ.gameId = gameId;
        // console.log(futureFormattedTime,"draw timeeeeeeeeeeeeeee")
        roomJJ.draw_time = futureFormattedTime;
        roomJJ = await roomJJ.save();
        io.to(roomId).emit(
          "roomMessage",
          "Betting Time Starts. Place your bets now."
        );
        let modeValue = "none";

        // Your axios call

        // console.log(modeValue,"kkkkkkkkkkkkkkk")

        for (let i = 0; i < 186; i++) {
          //176
          io.to(roomId).emit("timer", (190 - i).toString()); //180
          let roomJJ = await jeetoJokerRoom.findById(roomId);
          roomJJ.currentTime = (190 - i).toString(); //180
          roomJJ = await roomJJ.save();
          await sleep(1000);
          if (i == 185 && gameName == "16CardPrint") {
            //175
            // console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
            async function sendBetSumRequest() {
              try {
                const formData = new URLSearchParams();
                formData.append("GameId", gameId); // No newline character
                formData.append("gameName", "jeetoJoker"); // Added 'game' parameter

                const response = await axios.post(
                  "https://smart.smartwingames.com/api/player-bet-sum",
                  formData,
                  {
                    headers: {
                      "Content-Type": "application/x-www-form-urlencoded",
                    },
                  }
                );

                // console.log("API Response:", response.data);
                roomJJ.totalBetSum = response.data.totalValueSum;
                roomJJ.cardsValue1 = response.data.cardValueSet;
                roomJJ = await roomJJ.save();
                // console.log(roomJJ.totalBetSum,"kkkkkkkkkkkkkkkkkkk")
              } catch (error) {
                console.error(
                  "API Error:",
                  error.response ? error.response.data : error.message
                );
              }
            }
            sendBetSumRequest();

            // io.to(roomId).emit("timer", 4)
            break;
          }

          if (roomJJ === null) {
            break;
          }
        }
        // console.log(modeValue,"ab ka hua mode")
        let win_price = "1x";
        const getModeCall = async () => {
          try {
            const response = await axios.get(
              "https://smart.smartwingames.com/api/winning-hotlist?game_name=16cardsprint"
            );
            return response.data;
          } catch (error) {
            console.error("Error fetching data: ", error);
            throw error;
          }
        };

        // Main function
        const fetchAndSetMode = async () => {
          try {
            const data = await getModeCall();
            if (data?.list?.length > 0) {
              modeValue = data.list[0].win_type;
              // console.log(modeValue, "pppppppppppppp");
              win_price = data.list[0].win_price;
              // console.log(win_price,"win priceeeeeeeeeeeeeeeeeee")
              if (
                win_price == null ||
                win_price == undefined ||
                win_price == ""
              ) {
                win_price = "1x";
              }

              // Make sure roomJJ is fetched before this point
              roomJJ.mode = modeValue;
              roomJJ.winPrice = win_price;
              await roomJJ.save(); // No reassignment needed

              console.log("Room updated in database.");
            } else {
              console.warn("No data found in the list");
            }
          } catch (error) {
            console.error("Error:", error);
          }
        };

        fetchAndSetMode();

        const getSlot = async () => {
          try {
            const response = await axios.get(
              "https://smart.smartwingames.com/api/win-slot"
            );
            const data = response.data;
            return data;
          } catch (error) {
            console.log(error);
          }
        };
        let predictedSlot = "none";
        const slotData = getSlot(); //get slot function call
        // console.log(slotData, "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk");
        let id;
        slotData.then((data) => {
          predictedSlot = data.data.slot;
          id = data.data.id;
        });
        let predictedPercentage = "none";
        const getPercentage = async () => {
          const response = await axios.get(
            "https://smart.smartwingames.com/api/winpercentage"
          );
          const data = response.data;
          return data;
        };

        const percentageResult = getPercentage();
        percentageResult.then((data) => {
          predictedPercentage = data.data.percentage;
        });

        roomJJ = await jeetoJokerRoom.findById(roomId);
        io.to(roomId).emit("bettingGameId", roomJJ.gameId);
        if (roomJJ == null) {
          return;
        }
        io.to(roomId).emit("roomData", roomJJ);
        io.to(roomId).emit("timer", "3");

        await sleep(500);
        io.to(roomId).emit("timer", "2");
        await sleep(500);
        io.to(roomId).emit("timer", "1");
        await sleep(500);
        io.to(roomId).emit("timer", "0");
        io.to(roomId).emit(
          "roomMessage",
          "Betting Time Stops. Now the winner is being decided."
        );
        io.to(roomId).emit("betting", false);
        roomJJ = await jeetoJokerRoom.findById(roomId);
        roomJJ.cancelBet = true;
        roomJJ.mode = modeValue;
        roomJJ = await roomJJ.save();

        roomJJ = await jeetoJokerRoom.findById(roomId);

        roomJJ = await roomJJ.save();
        // console.log(
        // roomJJ.cardsValue1,
        // "++++++++++++++Updated cardsValue1+++++++++++"
        // );
        // Update totalBetSum
        for (let i = 0; i < roomJJ.players.length; i++) {
          for (let j = 0; j < roomJJ.cardsValue1.length; j++) {
            roomJJ.cardsValue1[j].value =
              roomJJ.cardsValue1[j].value +
              roomJJ.players[i].cardSetValue[j].value;
          }
        }
        roomJJ = await roomJJ.save();
        // console.log(roomJJ.totalBetSum, "++++++++++bet sum total+++++++++");
        io.to(roomId).emit("roomData", roomJJ);
        // console.log(predictedPercentage, "99999999999999999999");
        // console.log(predictedSlot, "+++99999999999999999999++++++++");

        if (predictedSlot != "none") {
          io.to(roomId).emit("slot", predictedSlot);
          const deleteSlot = async () => {
            try {
              const response = await axios.post(
                "https://smart.smartwingames.com/api/Win-slote-delete",
                new URLSearchParams({ id: id }), // form data with id = 3
                {
                  headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                  },
                }
              );
              return response.data;
            } catch (error) {
              console.error("Error deleting slot:", error);
              return null;
            }
          };
          // console.log(deleteSlot,"oooooooooooo")
          deleteSlot().then((data) => {
            if (data) {
              deletionResult = data.message; // Adjust based on your API's response format
              // console.log("++++Deletion response++++:", deletionResult);
            }
          });
        } else {
          if (predictedPercentage != "none") {
            // console.log("+++++percentage wala mai ghus gyaa hai+++++")
            function percentageResultFunction(percent) {
              let percentValue = 100 - percent;
              function findCardsInRange(arr) {
                let totalSum = Math.floor(
                  (percentValue / 100) * roomJJ.totalBetSum
                );
                // console.log(totalSum, "ooooooooooooooooooooooooooo===========");
                let lowerThreshold1 = 0.0 * totalSum;
                let upperThreshold1 = 1 * totalSum;

                let cardsInRange = [];
                let valueInRange = [];

                for (let i = 0; i < arr.length; i++) {
                  let card = arr[i];
                  let cardValue = card.value * 10;

                  if (
                    cardValue >= lowerThreshold1 &&
                    cardValue <= upperThreshold1
                  ) {
                    console.log(
                      cardValue,
                      lowerThreshold1,
                      upperThreshold1,
                      "++++++thresild 1++++++++++"
                    );
                    cardsInRange.push(card.card);
                    valueInRange.push(cardValue);
                  }
                }

                return { cardsInRange, valueInRange };
              }
              // Usage:
              let output = findCardsInRange(roomJJ.cardsValue1);
              // console.log(
              // "The cards whose 10 times their value is within the specified ranges are:",
              // output.cardsInRange,output.valueInRange
              // );
              // let maxCardValue = output.valueInRange
              let valueInRange = output.valueInRange;
              let cardsInRangeData = output.cardsInRange;
              // console.log(output.cardsInRange,"ggggggggggggggggggggg")
              if (output.cardsInRange.length == 0) {
                // console.log("+++++++++No cards found in the specified range+++++++++++");
                let cards = [
                  11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43,
                  44,
                ];
                let slot = cards[Math.floor(Math.random() * cards.length)];
                io.to(roomId).emit("slot", slot);
                let randomElement1 = slot;
                // let player_id = roomJJ.players[0].playerId;
                var is_beted = 0;
                if (roomJJ.totalBetSum > 0) {
                  is_beted = 1;
                } else {
                  is_beted = 0;
                }
                // console.log(is_beted,roomJJ.winPrice,"pppppppppppppppppp")
                const apiUrl =
                  "https://smart.smartwingames.com/api/live-data-from-node";
                const requestData = {
                  win_number: randomElement1.toString(),
                  game_name: gameName,
                  is_beted: is_beted.toString(),
                  bonous_spin: roomJJ.winPrice,
                };
                axios
                  .post(apiUrl, requestData)
                  .then((response) => {
                    console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                  })
                  .catch((error) => {
                    console.error(
                      error,
                      "++++++data nahi ayya error khaya++++++++"
                    ); // Print any errors
                  });

                const apiUrl1 =
                  "https://smart.smartwingames.com/api/result-from-node";
                const requestData1 = {
                  win_number: randomElement1.toString(),
                  game_id: gameId,
                };
                console.log("Request Data:", requestData1);
                console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                axios
                  .post(apiUrl1, requestData1)
                  .then((response) => {
                    console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                  })
                  .catch((error) => {
                    console.error(
                      error,
                      "++++++data nahi ayya error khaya++++++++"
                    ); // Print any errors
                  });
              } else {
                const MaxWinIndex = valueInRange.indexOf(
                  Math.max(...valueInRange)
                );
                let slot = cardsInRangeData[MaxWinIndex];

                // let slot =
                //   cardsInRangeData[
                //     Math.floor(Math.random() * cardsInRangeData.length)
                //   ];
                console.log(slot, "8888888888888888888888888888888");
                var is_beted = 0;
                if (cardsInRangeData.length > 0) {
                  if (slot) {
                    if (roomJJ.totalBetSum > 0) {
                      is_beted = 1;
                    } else {
                      is_beted = 0;
                    }

                    io.to(roomId).emit("slot", slot);
                    console.log(
                      is_beted,
                      roomJJ.winPrice,
                      "pppppppppppppppppp"
                    );
                    console.log("slot", slot, "+++++slot++++++");
                    const apiUrl =
                      "https://smart.smartwingames.com/api/live-data-from-node";
                    const requestData = {
                      win_number: slot.toString(),
                      game_name: gameName,
                      win_price: roomJJ.winPrice,
                      is_beted: is_beted.toString(),
                      bonous_spin: roomJJ.winPrice,
                    };

                    console.log("Request Data:", requestData);

                    axios
                      .post(apiUrl, requestData)
                      .then((response) => {
                        console.log("API Response:", response.data);
                      })
                      .catch((error) => {
                        console.error("API request failed:", error.message);
                        // Handle the error gracefully, e.g., log it and continue with the rest of the application
                      });

                    const apiUrl1 =
                      "https://smart.smartwingames.com/api/result-from-node";
                    const requestData1 = {
                      win_number: slot.toString(),
                      game_id: gameId,
                    };
                    console.log("Request Data:", requestData1);
                    console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                    axios
                      .post(apiUrl1, requestData1)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });
                  }
                } else {
                  let cards = [
                    11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43,
                    44,
                  ];
                  let slot = cards[Math.floor(Math.random() * cards.length)];
                  io.to(roomId).emit("slot", slot);
                  let randomElement1 = slot;
                  var is_beted = 0;
                  if (roomJJ.totalBetSum > 0) {
                    is_beted = 1;
                  } else {
                    is_beted = 0;
                  }
                  // let player_id = roomJJ.players[0].playerId;
                  console.log(is_beted, roomJJ.winPrice, "pppppppppppppppppp");
                  const apiUrl =
                    "https://smart.smartwingames.com/api/live-data-from-node";
                  const requestData = {
                    win_number: randomElement1.toString(),
                    game_name: gameName,
                    is_beted: is_beted.toString(),
                    bonous_spin: roomJJ.winPrice,
                  };

                  axios
                    .post(apiUrl, requestData)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });

                  const apiUrl1 =
                    "https://smart.smartwingames.com/api/result-from-node";
                  const requestData1 = {
                    win_number: randomElement1.toString(),
                    game_id: gameId,
                  };
                  console.log("Request Data:", requestData1);
                  console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl1, requestData1)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });
                }
              }
            }
            percentageResultFunction(predictedPercentage);
          } else {
            if (roomJJ.mode == "none" || roomJJ.mode == "") {
              let mode;
              if (mediumCounter < 3) {
                mode = "Medium";
                mediumCounter++;
                console.log("++++++++++pahle iske andar aagya+++++++++");
              } else if (mediumCounter == 3) {
                mode = "HighMedium";
                mediumCounter = 0;
                console.log("++++++++++ ab iske andar aagya+++++++++");
              }
              if (mode == "Medium") {
                console.log("+++++++++++++++++Medium+++++++++++++++++++");
                function findCardsInRange(arr) {
                  let totalSum = roomJJ.totalBetSum;

                  console.log(totalSum, "++++++++++totalSum++++++++++++");

                  let lowerThreshold1 = 0.0 * totalSum;
                  let upperThreshold1 = 1.0 * totalSum;

                  let cardsInRange = [];
                  let valueInRange = [];

                  for (let i = 0; i < arr.length; i++) {
                    let card = arr[i];
                    let cardValue = card.value * 10;

                    if (
                      cardValue >= lowerThreshold1 &&
                      cardValue <= upperThreshold1
                    ) {
                      //   console.log("++++++thresild 1++++++++++");
                      cardsInRange.push(card.card);
                      valueInRange.push(cardValue);
                    }
                  }

                  return { cardsInRange, valueInRange };
                }
                // Usage:
                let output = findCardsInRange(roomJJ.cardsValue1);
                console.log(
                  "The cards whose 10 times their value is within the specified ranges are:",
                  output.cardsInRange
                );
                let minCardValue = output.valueInRange;

                let minValue = Math.min(...minCardValue);
                let index = -1;
                var array2 = [];
                for (let i = 0; i < roomJJ.cardsValue1.length; i++) {
                  if (roomJJ.cardsValue1[i].value == minValue / 10) {
                    array2.push(roomJJ.cardsValue1[i].card);
                    index = i;
                  }
                }
                console.log(array2, "+++++hiiiiiiiiiiiiiiii+++++++++");
                var randomIndex1 = Math.floor(Math.random() * array2.length);
                var randomElement1 = array2[randomIndex1];
                var is_beted = 0;
                if (roomJJ.totalBetSum > 0) {
                  is_beted = 0;
                } else {
                  is_beted = 1;
                }
                if (index != -1) {
                  io.to(roomId).emit("slot", randomElement1);
                  console.log(is_beted, roomJJ.winPrice, "pppppppppppppppppp");
                  const apiUrl =
                    "https://smart.smartwingames.com/api/live-data-from-node";
                  const requestData = {
                    win_number: randomElement1.toString(),
                    game_name: gameName,
                    win_price: roomJJ.winPrice,
                    is_beted: is_beted.toString(),
                    bonous_spin: roomJJ.winPrice,
                  };
                  console.log("Request Data:", requestData);
                  console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl, requestData)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });

                  // ----------------------------------

                  const apiUrl1 =
                    "https://smart.smartwingames.com/api/result-from-node";
                  const requestData1 = {
                    win_number: randomElement1.toString(),
                    game_id: gameId,
                  };
                  console.log("Request Data:", requestData1);
                  console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl1, requestData1)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });
                } else {
                  let cards = [
                    11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42, 43,
                    44,
                  ];
                  let slot = cards[Math.floor(Math.random() * cards.length)];
                  io.to(roomId).emit("slot", slot);
                  let randomElement1 = slot;
                  console.log(is_beted, roomJJ.winPrice, "pppppppppppppppppp");
                  // let player_id = roomJJ.players[0].playerId;
                  const apiUrl =
                    "https://smart.smartwingames.com/api/live-data-from-node";
                  const requestData = {
                    win_number: randomElement1.toString(),
                    game_name: gameName,
                    is_beted: is_beted.toString(),
                    bonous_spin: roomJJ.winPrice,
                  };

                  axios
                    .post(apiUrl, requestData)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });

                  const apiUrl1 =
                    "https://smart.smartwingames.com/api/result-from-node";
                  const requestData1 = {
                    win_number: randomElement1.toString(),
                    game_id: gameId,
                  };
                  console.log("Request Data:", requestData1);
                  console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl1, requestData1)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });
                }
              } else if (mode == "HighMedium") {
                console.log("+++++++no setMode is on+++++++++");
                console.log("+++++++++++++++++highMedium+++++++++++++++++++");
                function findCardsInRange(arr) {
                  let totalSum = roomJJ.totalBetSum;

                  let lowerThreshold1 = 1.0 * totalSum;
                  let upperThreshold1 = 1.8 * totalSum;

                  let cardsInRange = [];
                  let valueInRange = [];

                  for (let i = 0; i < arr.length; i++) {
                    let card = arr[i];
                    let cardValue = card.value * 10;

                    if (
                      cardValue >= lowerThreshold1 &&
                      cardValue <= upperThreshold1
                    ) {
                      cardsInRange.push(card.card);
                      valueInRange.push(cardValue);
                    }
                  }

                  return { cardsInRange, valueInRange };
                }

                // Usage:

                let output = findCardsInRange(roomJJ.cardsValue1);
                console.log(
                  "The cards whose 10 times their value is within the specified ranges are:",
                  output.cardsInRange
                );
                let minCardValue = output.valueInRange;
                const randomIndex = Math.floor(
                  Math.random() * minCardValue.length
                );
                console.log(
                  minCardValue[randomIndex],
                  "=========kiiiiiiiiiiiiiiiiiiiiiii+++++++++"
                );
                let minValue = minCardValue[randomIndex];

                let index = -1;
                var array2 = [];
                for (let i = 0; i < roomJJ.cardsValue1.length; i++) {
                  console.log("aaaaaaaaaaaaaaaaaaaaa==========+++++++++>");
                  roomJJ = await jeetoJokerRoom.findById(roomId);
                  if (roomJJ.cardsValue1[i].value == minValue / 10) {
                    array2.push(roomJJ.cardsValue1[i].card);

                    index = i;
                  }
                }
                console.log(array2, "+++++hiiiiiiiiiiiiiiii+++++++++");
                var randomIndex1 = Math.floor(Math.random() * array2.length);
                var randomElement1 = array2[randomIndex1];
                var is_beted = 0;
                if (roomJJ.totalBetSum > 0) {
                  is_beted = 1;
                } else {
                  is_beted = 0;
                }
                if (index != -1) {
                  io.to(roomId).emit("slot", randomElement1);
                  //  console.log(is_beted,roomJJ.winPrice,"pppppppppppppppppp")
                  const apiUrl =
                    "https://smart.smartwingames.com/api/live-data-from-node";
                  const requestData = {
                    win_number: randomElement1.toString(),
                    game_name: gameName,
                    win_price: roomJJ.winPrice,
                    is_beted: is_beted.toString(),
                    bonous_spin: roomJJ.winPrice,
                  };
                  console.log("Request Data:", requestData);
                  axios
                    .post(apiUrl, requestData)
                    .then((response) => {
                      console.log(response.data, "++++++++dada aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });

                  const apiUrl1 =
                    "https://smart.smartwingames.com/api/result-from-node";
                  const requestData1 = {
                    win_number: randomElement1.toString(),
                    game_id: gameId,
                  };
                  console.log("Request Data:", requestData1);
                  // console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl1, requestData1)
                    .then((response) => {
                      // console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });
                } else {
                  console.log(
                    "+++++++++++++++++++medium++++++++++++++++++++++++++++++++"
                  );
                  function findCardsInRange(arr) {
                    let totalSum = roomJJ.totalBetSum;
                    console.log(totalSum, "++++++++++++totalSum+++++++++++");

                    let lowerThreshold3 = 0 * totalSum;
                    let upperThreshold3 = 1 * totalSum;
                    let cardsInRange = [];
                    let valueInRange = [];

                    for (let i = 0; i < arr.length; i++) {
                      let card = arr[i];
                      let cardValue = card.value * 10;

                      if (
                        cardValue >= lowerThreshold3 &&
                        cardValue <= upperThreshold3
                      ) {
                        cardsInRange.push(card.card);
                        valueInRange.push(cardValue);
                      }
                    }

                    return { cardsInRange, valueInRange };
                  }
                  // Usage:
                  let output = findCardsInRange(roomJJ.cardsValue1);
                  console.log(
                    "The cards whose 10 times their value is within the specified ranges are:",
                    output.cardsInRange
                  );
                  let minCardValue = output.valueInRange;
                  const randomIndex = Math.floor(
                    Math.random() * minCardValue.length
                  );
                  console.log(
                    minCardValue[randomIndex],
                    "=========kiiiiiiiiiiiiiiiiiiiiiii+++++++++"
                  );
                  let minValue = minCardValue[randomIndex];
                  let index = -1;
                  let roomPlayers = roomJJ.players;
                  let player;
                  var array2 = [];
                  for (let i = 0; i < roomJJ.cardsValue1.length; i++) {
                    roomJJ = await jeetoJokerRoom.findById(roomId);
                    if (roomJJ.cardsValue1[i].value == minValue / 10) {
                      array2.push(roomJJ.cardsValue1[i].card);

                      index = i;
                    }
                  }
                  console.log(array2, "+++++hiiiiiiiiiiiiiiii+++++++++");
                  var randomIndex1 = Math.floor(Math.random() * array2.length);
                  var randomElement1 = array2[randomIndex1];
                  var is_beted = 0;
                  if (roomJJ.totalBetSum > 0) {
                    is_beted = 1;
                  } else {
                    is_beted = 0;
                  }
                  if (index != -1) {
                    io.to(roomId).emit("slot", randomElement1);
                    console.log(
                      is_beted,
                      roomJJ.winPrice,
                      "pppppppppppppppppp"
                    );
                    const apiUrl =
                      "https://smart.smartwingames.com/api/live-data-from-node";
                    const requestData = {
                      win_number: randomElement1.toString(),
                      game_name: gameName,
                      win_price: roomJJ.winPrice,
                      is_beted: is_beted.toString(),
                      bonous_spin: roomJJ.winPrice,
                    };
                    console.log("Request Data:", requestData);

                    axios
                      .post(apiUrl, requestData)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });

                    const apiUrl1 =
                      "https://smart.smartwingames.com/api/result-from-node";
                    const requestData1 = {
                      win_number: randomElement1.toString(),
                      game_id: gameId,
                    };
                    console.log("Request Data:", requestData1);
                    console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                    axios
                      .post(apiUrl1, requestData1)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });
                  }
                }
              }
            } else {
              if (roomJJ.mode === "High") {
                console.log("+++++++++++++++++high+++++++++++++++++++");
                function findCardsInRange(arr) {
                  let totalSum = roomJJ.totalBetSum;
                  let lowerThreshold1 = 0.0 * totalSum;
                  let upperThreshold1 = 1.4 * totalSum;

                  let cardsInRange = [];
                  let valueInRange = [];

                  for (let i = 0; i < arr.length; i++) {
                    let card = arr[i];
                    let cardValue = card.value * 10;

                    cardsInRange.push(card.card);
                    valueInRange.push(cardValue);
                  }

                  return { cardsInRange, valueInRange };
                }

                // Usage:

                let output = findCardsInRange(roomJJ.cardsValue1);
                console.log(
                  "The cards whose 10 times their value is within the specified ranges are:",
                  output.cardsInRange
                );
                // let maxCardValue = output.valueInRange
                let minCardValue = output.valueInRange;
                // minCardValue.sort((a, b) => a - b);
                // console.log(
                //   minCardValue[minCardValue.length - 1],
                //   "=========kiiiiiiiiiiiiiiiiiiiiiii+++++++++"
                // );
                // let minValue = minCardValue[minCardValue.length - 1];
                console.log(Math.max(...minCardValue));
                let maxValue = Math.max(...minCardValue);

                // console.log(minValue);
                let index = -1;
                var array2 = [];
                for (let i = 0; i < roomJJ.cardsValue1.length; i++) {
                  roomJJ = await jeetoJokerRoom.findById(roomId);
                  if (roomJJ.cardsValue1[i].value == maxValue / 10) {
                    array2.push(roomJJ.cardsValue1[i].card);

                    index = i;
                  }
                }
                console.log(array2, "+++++hiiiiiiiiiiiiiiii+++++++++");
                var randomIndex1 = Math.floor(Math.random() * array2.length);
                var randomElement1 = array2[randomIndex1];
                var is_beted = 0;
                if (roomJJ.totalBetSum > 0) {
                  is_beted = 1;
                } else {
                  is_beted = 0;
                }
                if (index !== -1) {
                  io.to(roomId).emit("slot", randomElement1);
                  console.log(is_beted, roomJJ.winPrice, "pppppppppppppppppp");
                  const apiUrl =
                    "https://smart.smartwingames.com/api/live-data-from-node";
                  const requestData = {
                    win_number: randomElement1.toString(),
                    game_name: gameName,
                    win_price: roomJJ.winPrice,
                    is_beted: is_beted.toString(),
                    bonous_spin: roomJJ.winPrice,
                  };

                  console.log("Request Data:", requestData);

                  axios
                    .post(apiUrl, requestData)
                    .then((response) => {
                      console.log("API Response:", response.data);
                    })
                    .catch((error) => {
                      console.error("API request failed:", error.message);
                      // Handle the error gracefully, e.g., log it and continue with the rest of the application
                    });

                  const apiUrl1 =
                    "https://smart.smartwingames.com/api/result-from-node";
                  const requestData1 = {
                    win_number: randomElement1.toString(),
                    game_id: gameId,
                  };
                  console.log("Request Data:", requestData1);
                  console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl1, requestData1)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });
                } else {
                  {
                    let cards = [
                      11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42,
                      43, 44,
                    ];
                    let slot = cards[Math.floor(Math.random() * cards.length)];
                    io.to(roomId).emit("slot", slot);
                    let randomElement1 = slot;
                    console.log(
                      is_beted,
                      roomJJ.winPrice,
                      "pppppppppppppppppp"
                    );
                    // let player_id = roomJJ.players[0].playerId;
                    const apiUrl =
                      "https://smart.smartwingames.com/api/live-data-from-node";
                    const requestData = {
                      win_number: randomElement1.toString(),
                      game_name: "16cards",
                      is_beted: is_beted.toString(),
                      bonous_spin: roomJJ.winPrice,
                    };

                    axios
                      .post(apiUrl, requestData)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });

                    const apiUrl1 =
                      "https://smart.smartwingames.com/api/result-from-node";
                    const requestData1 = {
                      win_number: randomElement1.toString(),
                      game_id: gameId,
                    };
                    console.log("Request Data:", requestData1);
                    console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                    axios
                      .post(apiUrl1, requestData1)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });
                  }
                }
              } else if (roomJJ.mode === "Medium") {
                console.log(
                  "+++++++++++++++++++medium++++++++++++++++++++++++++++++++"
                );
                function findCardsInRange(arr) {
                  let totalSum = roomJJ.totalBetSum;
                  console.log(totalSum, "++++++++++++totalSum+++++++++++");
                  let lowerThreshold1 = 0.0 * totalSum;
                  let upperThreshold1 = 1.0 * totalSum;
                  let cardsInRange = [];
                  let valueInRange = [];
                  for (let i = 0; i < arr.length; i++) {
                    let card = arr[i];
                    let cardValue = card.value * 10;

                    if (
                      cardValue >= lowerThreshold1 &&
                      cardValue <= upperThreshold1
                    ) {
                      cardsInRange.push(card.card);
                      valueInRange.push(cardValue);
                    }
                  }

                  return { cardsInRange, valueInRange };
                }

                // Usage:

                let output = findCardsInRange(roomJJ.cardsValue1);
                console.log(
                  "The cards whose 10 times their value is within the specified ranges are:",
                  output.cardsInRange
                );
                let minCardValue = output.valueInRange;
                const randomIndex = Math.floor(
                  Math.random() * minCardValue.length
                );

                console.log(
                  minCardValue[randomIndex],
                  "=========kiiiiiiiiiiiiiiiiiiiiiii+++++++++"
                );
                let minValue = minCardValue[randomIndex];
                // let minValue = Math.min(...minCardValue)
                let index = -1;

                var array2 = [];
                for (let i = 0; i < roomJJ.cardsValue1.length; i++) {
                  roomJJ = await jeetoJokerRoom.findById(roomId);
                  if (roomJJ.cardsValue1[i].value == minValue / 10) {
                    array2.push(roomJJ.cardsValue1[i].card);

                    index = i;
                  }
                }
                console.log(array2, "+++++hiiiiiiiiiiiiiiii+++++++++");
                var randomIndex1 = Math.floor(Math.random() * array2.length);
                var randomElement1 = array2[randomIndex1];
                var is_beted = 0;
                if (roomJJ.totalBetSum > 0) {
                  is_beted = 1;
                } else {
                  is_beted = 0;
                }
                if (index != -1) {
                  io.to(roomId).emit("slot", randomElement1);
                  //  console.log(is_beted,roomJJ.winPrice,"pppppppppppppppppp")
                  const apiUrl =
                    "https://smart.smartwingames.com/api/live-data-from-node";
                  const requestData = {
                    win_number: randomElement1.toString(),
                    game_name: gameName,
                    win_price: roomJJ.winPrice,
                    is_beted: is_beted.toString(),
                    bonous_spin: roomJJ.winPrice,
                  };
                  console.log("Request Data:", requestData);
                  axios
                    .post(apiUrl, requestData)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });

                  const apiUrl1 =
                    "https://smart.smartwingames.com/api/result-from-node";
                  const requestData1 = {
                    win_number: randomElement1.toString(),
                    game_id: gameId,
                  };
                  console.log("Request Data:", requestData1);
                  console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl1, requestData1)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });
                } else {
                  {
                    let cards = [
                      11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42,
                      43, 44,
                    ];
                    let slot = cards[Math.floor(Math.random() * cards.length)];
                    io.to(roomId).emit("slot", slot);
                    let randomElement1 = slot;
                    //  console.log(is_beted,roomJJ.winPrice,"pppppppppppppppppp")
                    // let player_id = roomJJ.players[0].playerId;
                    const apiUrl =
                      "https://smart.smartwingames.com/api/live-data-from-node";
                    const requestData = {
                      win_number: randomElement1.toString(),
                      game_name: gameName,
                      is_beted: is_beted.toString(),
                      bonous_spin: roomJJ.winPrice,
                    };

                    axios
                      .post(apiUrl, requestData)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });
                    const apiUrl1 =
                      "https://smart.smartwingames.com/api/result-from-node";
                    const requestData1 = {
                      win_number: randomElement1.toString(),
                      game_id: gameId,
                    };
                    console.log("Request Data:", requestData1);
                    console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                    axios
                      .post(apiUrl1, requestData1)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });
                  }
                }
              } else if (roomJJ.mode === "HighMedium") {
                console.log("+++++++++++++++++highMedium+++++++++++++++++++");
                function findCardsInRange(arr) {
                  let totalSum = roomJJ.totalBetSum;
                  let lowerThreshold1 = 0.0 * totalSum;
                  let upperThreshold1 = 1.2 * totalSum;

                  let cardsInRange = [];
                  let valueInRange = [];

                  for (let i = 0; i < arr.length; i++) {
                    let card = arr[i];
                    let cardValue = card.value * 10;

                    if (
                      cardValue >= lowerThreshold1 &&
                      cardValue <= upperThreshold1
                    ) {
                      cardsInRange.push(card.card);
                      valueInRange.push(cardValue);
                    }
                  }

                  return { cardsInRange, valueInRange };
                }

                // Usage:

                let output = findCardsInRange(roomJJ.cardsValue1);
                console.log(
                  "The cards whose 10 times their value is within the specified ranges are:",
                  output.cardsInRange
                );
                let minCardValue = output.valueInRange;

                const randomIndex = Math.floor(
                  Math.random() * minCardValue.length
                );
                console.log(
                  minCardValue[randomIndex],
                  "=========kiiiiiiiiiiiiiiiiiiiiiii+++++++++"
                );
                let minValue = minCardValue[randomIndex];
                // let minValue = Math.max(...minCardValue)
                let index = -1;
                var array2 = [];
                for (let i = 0; i < roomJJ.cardsValue1.length; i++) {
                  console.log("aaaaaaaaaaaaaaaaaaaaa==========+++++++++>");
                  roomJJ = await jeetoJokerRoom.findById(roomId);
                  if (roomJJ.cardsValue1[i].value == minValue / 10) {
                    array2.push(roomJJ.cardsValue1[i].card);
                    // console.log("The card with the highest value is:", roomJJ.players[0].cardSetValue[i].card)
                    index = i;
                  }
                }
                console.log(array2, "+++++hiiiiiiiiiiiiiiii+++++++++");
                var randomIndex1 = Math.floor(Math.random() * array2.length);
                var randomElement1 = array2[randomIndex1];
                var is_beted = 0;
                if (roomJJ.totalBetSum > 0) {
                  is_beted = 1;
                } else {
                  is_beted = 0;
                }
                if (index != -1) {
                  io.to(roomId).emit("slot", randomElement1);
                  console.log(is_beted, roomJJ.winPrice, "pppppppppppppppppp");
                  const apiUrl =
                    "https://smart.smartwingames.com/api/live-data-from-node";
                  const requestData = {
                    win_number: randomElement1.toString(),
                    game_name: gameName,
                    win_price: roomJJ.winPrice,
                    is_beted: is_beted.toString(),
                    bonous_spin: roomJJ.winPrice,
                  };
                  console.log("Request Data:", requestData);
                  axios
                    .post(apiUrl, requestData)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });

                  const apiUrl1 =
                    "https://smart.smartwingames.com/api/result-from-node";
                  const requestData1 = {
                    win_number: randomElement1.toString(),
                    game_id: gameId,
                  };
                  console.log("Request Data:", requestData1);
                  console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl1, requestData1)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });
                } else {
                  {
                    let cards = [
                      11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42,
                      43, 44,
                    ];
                    let slot = cards[Math.floor(Math.random() * cards.length)];
                    io.to(roomId).emit("slot", slot);
                    let randomElement1 = slot;
                    // let player_id = roomJJ.players[0].playerId;
                    // console.log(is_beted,roomJJ.winPrice,"pppppppppppppppppp")
                    const apiUrl =
                      "https://smart.smartwingames.com/api/live-data-from-node";
                    const requestData = {
                      win_number: randomElement1.toString(),
                      game_name: gameName,
                      is_beted: is_beted.toString(),
                      bonous_spin: roomJJ.winPrice,
                    };

                    axios
                      .post(apiUrl, requestData)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });

                    const apiUrl1 =
                      "https://smart.smartwingames.com/api/result-from-node";
                    const requestData1 = {
                      win_number: randomElement1.toString(),
                      game_id: gameId,
                    };
                    console.log("Request Data:", requestData1);
                    console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                    axios
                      .post(apiUrl1, requestData1)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });
                  }
                }
              } else if (roomJJ.mode === "Low") {
                console.log("+++++++++++++++++low+++++++++++++++++++");
                function findCardsInRange(arr) {
                  let totalSum = roomJJ.totalBetSum;

                  console.log(totalSum, "++++++++++totalSum++++++++++++");

                  let lowerThreshold1 = 0.0 * totalSum;
                  let upperThreshold1 = 1.0 * totalSum;

                  let cardsInRange = [];
                  let valueInRange = [];

                  for (let i = 0; i < arr.length; i++) {
                    let card = arr[i];
                    let cardValue = card.value * 10;
                    cardsInRange.push(card.card);
                    valueInRange.push(cardValue);
                  }

                  return { cardsInRange, valueInRange };
                }

                // Usage:

                let output = findCardsInRange(roomJJ.cardsValue1);
                console.log(
                  "The cards whose 10 times their value is within the specified ranges are:",
                  output.cardsInRange
                );
                let minCardValue = output.valueInRange;

                let minValue = Math.min(...minCardValue);
                let index = -1;
                var array2 = [];
                for (let i = 0; i < roomJJ.cardsValue1.length; i++) {
                  if (roomJJ.cardsValue1[i].value == minValue / 10) {
                    array2.push(roomJJ.cardsValue1[i].card);
                    index = i;
                  }
                }
                // console.log(array2, "+++++hiiiiiiiiiiiiiiii+++++++++1095");
                var randomIndex1 = Math.floor(Math.random() * array2.length);
                var randomElement1 = array2[randomIndex1];
                var is_beted = 0;
                if (roomJJ.totalBetSum > 0) {
                  is_beted = 0;
                } else {
                  is_beted = 1;
                }
                if (index != -1) {
                  io.to(roomId).emit("slot", randomElement1);
                  console.log(is_beted, roomJJ.winPrice, "pppppppppppppppppp");
                  const apiUrl =
                    "https://smart.smartwingames.com/api/live-data-from-node";
                  const requestData = {
                    win_number: randomElement1.toString(),
                    game_name: gameName,
                    win_price: roomJJ.winPrice,
                    is_beted: is_beted.toString(),
                    bonous_spin: roomJJ.winPrice,
                  };
                  console.log("Request Data:", requestData);
                  // console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl, requestData)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });

                  const apiUrl1 =
                    "https://smart.smartwingames.com/api/result-from-node";
                  const requestData1 = {
                    win_number: randomElement1.toString(),
                    game_id: gameId,
                  };
                  console.log("Request Data:", requestData1);
                  console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                  axios
                    .post(apiUrl1, requestData1)
                    .then((response) => {
                      console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                    })
                    .catch((error) => {
                      console.error(
                        error,
                        "++++++data nahi ayya error khaya++++++++"
                      ); // Print any errors
                    });
                } else {
                  {
                    let cards = [
                      11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42,
                      43, 44,
                    ];
                    let slot = cards[Math.floor(Math.random() * cards.length)];
                    io.to(roomId).emit("slot", slot);
                    let randomElement1 = slot;
                    // let player_id = roomJJ.players[0].playerId;
                    console.log(
                      is_beted,
                      roomJJ.winPrice,
                      "pppppppppppppppppp"
                    );
                    const apiUrl =
                      "https://smart.smartwingames.com/api/live-data-from-node";
                    const requestData = {
                      win_number: randomElement1.toString(),
                      game_name: gameName,
                      is_beted: is_beted.toString(),
                      bonous_spin: roomJJ.winPrice,
                      // player_id: player_id,
                    };

                    axios
                      .post(apiUrl, requestData)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });

                    const apiUrl1 =
                      "https://smart.smartwingames.com/api/result-from-node";
                    const requestData1 = {
                      win_number: randomElement1.toString(),
                      game_id: gameId,
                    };
                    console.log("Request Data:", requestData1);
                    console.log(roomJJ.winPrice, "+++hhhhhhhhhhhhhhhhh+++++++");
                    axios
                      .post(apiUrl1, requestData1)
                      .then((response) => {
                        console.log(response.data, "++++++++data aagyaa++++++"); // Print the response data
                      })
                      .catch((error) => {
                        console.error(
                          error,
                          "++++++data nahi ayya error khaya++++++++"
                        ); // Print any errors
                      });
                  }
                }
              }
            }
          }
        }
        roomJJ.totalBetSum = 0;
        // roomJJ.mode = "none"

        roomJJ = await roomJJ.save();

        // const cardValue = [

        //     {
        //         card: 11,
        //         value: 0
        //     },
        //     {
        //         card: 12,
        //         value: 0
        //     },
        //     {
        //         card: 13,
        //         value: 0,
        //     },
        //     {
        //         card: 14,
        //         value: 0
        //     },
        //     {
        //         card: 21,
        //         value: 0,
        //     },
        //     {
        //         card: 22,
        //         value: 0,
        //     },
        //     {
        //         card: 23,
        //         value: 0,
        //     },
        //     {
        //         card: 24,
        //         value: 0,
        //     },
        //     {
        //         card: 31,
        //         value: 0,
        //     },
        //     {
        //         card: 32,
        //         value: 0,
        //     },
        //     {
        //         card: 33,
        //         value: 0,
        //     },
        //     {
        //         card: 34,
        //         value: 0,
        //     }

        // ]

        // for (let i = 0; i < roomJJ.players.length; i++) {
        //   roomJJ.players[i].cardSetValue = cardValue;
        // }
        // roomJJ.cardsValue1 = cardValue;

        roomJJ = await roomJJ.save();
        console.log("Room Deleted");
        io.to(roomId).emit("roomMessage", "New Game Starting.");
        roomJJ = await roomJJ.save();
        await sleep(10000);

        const deleteX = async () => {
          try {
            const response = await axios.post(
              `https://smart.smartwingames.com/api/delete-x-entry?game_name=${gameName}`,
              {}, // empty POST body
              {
                headers: {
                  "Content-Type": "application/json", // or omit if server doesn t care
                },
              }
            );
            return response.data;
          } catch (error) {
            console.error(
              "Error deleting slot:",
              error.response?.data || error.message
            );
            return null;
          }
        };

        deleteX().then((data) => {
          if (data) {
            const deletionResult = data.message; // Adjust based on API response structure
            console.log("++++Deletion response++++:", deletionResult);
          }
        });

        if (roomJJ.players.length === 0) {
          roomJJ = await jeetoJokerRoom.deleteOne({ _id: roomId });
          console.log(`Room ${roomId} deleted because it had no players.`);
        }
        roomJJ = await jeetoJokerRoom.findById(roomId);
      } while (roomJJ != null);
    } catch (error) {
      console.log(error);
    }
  });
  socket.on("bet", async (body) => {
    try {
      const data = JSON.parse(body);
      const { roomId, playerId, cardValueSet } = data;
      var roomJJ = await jeetoJokerRoom.findById({ _id: roomId });
      console.log(cardValueSet, "hhhhhiiiii");

      // Find player index
      const playerIndex = roomJJ.players.findIndex(
        (element) => element.playerId === playerId
      );
      if (playerIndex === -1) {
        console.log("Player not found");
        return;
      }
      // Update player's cardSetValue
      roomJJ.players[playerIndex].cardSetValue = cardValueSet;
      // Save the updated room document
      roomJJ = await roomJJ.save();
      io.to(roomId).emit("betInfo", { playerId: playerId, cardValueSet });
      io.to(roomId).emit("roomData", roomJJ);
    } catch (error) {
      console.log("Error:", error);
    }
  });

  socket.on("leave", async (body) => {
    try {
      let roomId = body.roomId;
      let playerId = body.playerId;
      let roomJJ = await jeetoJokerRoom.findById(roomId);
      // await jeetoJokerRoom.findByIdAndDelete(roomId);

      roomJJ.players = roomJJ.players.filter((item) => {
        return item.playerId != playerId;
      });
      roomJJ = await roomJJ.save();
      if (roomJJ.totalBetSum === 0) {
        roomJJ = await jeetoJokerRoom.deleteOne({ _id: roomId });
        console.log(`Room ${roomId} deleted because it had no totalbet.`);
      }
    } catch (error) {
      console.log(error);
    }
  });

  socket.on("clearAll", async (body) => {
    try {
      //  let roomId = body.roomId;
      await jeetoJokerRoom.deleteMany({});
      console.log("hiiii");
    } catch (e) {
      console.log(e);
    }
  });

  /**
   * Disconnection Handler.
   **/
  socket.on("disconnect", async () => {
    try {
      console.log(`one socket disconnected:${socket.id}`);

      const playerData = await jeetoJokerRoom.aggregate([
        {
          $match: {
            players: {
              $elemMatch: {
                socketID: socket.id,
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            playerId: {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$players",
                    as: "player",
                    cond: { $eq: ["$$player.socketID", socket.id] },
                  },
                },
                0,
              ],
            },
          },
        },
      ]);
      let playerId;
      if (playerData.length > 0 && playerData[0].playerId) {
        playerId = playerData[0].playerId.playerId;
        console.log("Player ID:", playerId);

        console.log(playerId, typeof playerId, Number(playerId), "klkkk");
        // Call logout API with playerId

        const logoutApiUrl = `https://smart.smartwingames.com/api/logout-from-node?user_id=${Number(
          playerId
        )}`;

        const response = await axios.get(logoutApiUrl);

        console.log("Logout API Response:", response.data);
      }
    } catch (error) {
      console.log(error.message);
    }
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
