const express = require('express');
const router = express.Router();

const busStops = [
    { id: 1, name: "woah Stop A", location: "Location A", code: "A001" },
    { id: 2, name: "Bus Stop B", location: "Location B", code: "B002" },
    { id: 3, name: "Bus Stop C", location: "Location C", code: "C003" },
    { id: 4, name: "Bus lol D", location: "Location D", code: "D004" },
];

router.get('/paxed/getAllBusStops', (req, res) => {
    res.json({
      status: "success",
      message: "List of all bus stops",
      data: busStops
    });
  });



  module.exports = router;