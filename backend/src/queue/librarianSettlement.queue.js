"use strict";

const { Queue } = require("bullmq");

const {redisConnection,} = require("../config/redis");

const librarianSettlementQueue = new Queue(    //Yahan actual me BullMQ Queue ka object create ho raha hai.
  "librarian-settlement",  
  {
    connection: redisConnection,
  }
);

module.exports = {
  librarianSettlementQueue,
};