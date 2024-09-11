const express = require('express');
const router = express.Router();
const firebaseService = require('../services/firebaseServices'); // Import firebaseServices

// Predefined bus stops data
const busStops = [
    { id: 1, name: "Opp Hall 11", code: "opphall11" },
    { id: 2, name: "Nanyang Heights", code: "nanyangheights" },
    { id: 3, name: "Hall 6", code: "hall6" },
    { id: 4, name: "Opp Hall 4", code: "opphall4" },
    { id: 5, name: "Opp Yunnan Garden", code: "oppyunnangarden" },
    { id: 6, name: "Opp SPMS", code: "oppspms" },
    { id: 7, name: "Opp WKWSCI", code: "oppwkwsci" },
    { id: 8, name: "Opp CEE", code: "oppcee" },
    { id: 9, name: "NIE Blk 2", code: "nieblk2" },
    { id: 10, name: "Opp Hall 16", code: "opphall16" },
    { id: 11, name: "Opp Hall 14", code: "opphall14" },
    { id: 12, name: "Opp NY Cres Halls", code: "oppnycreshalls" },
];

// Helper function to get the latest message from Firebase for each bus stop
const getBusStopMessages = async () => {
  const busStopMessages = {};

  for (const busStop of busStops) {
    const latestMessage = await firebaseService.getLatestMessage(busStop.code); // Call the service method
    busStopMessages[busStop.name] = latestMessage;
  }

  return busStopMessages;
};

// Route to fetch all predefined bus stops
router.get('/paxed/getAllBusStops', (req, res) => {
  res.json({
    status: "success",
    message: "List of all bus stops",
    data: busStops
  });
});

// Route to get the latest message counts from Firebase for each bus stop
router.get('/paxed/blue/busstops/count', async (req, res) => {
  try {
    const latestBusStopMessages = await getBusStopMessages();
    res.json({
      status: "success",
      message: "Latest messages from bus stops",
      data: latestBusStopMessages
    });
  } catch (error) {
    console.error('Error fetching bus stop messages:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch bus stop messages"
    });
  }
});

module.exports = router;
