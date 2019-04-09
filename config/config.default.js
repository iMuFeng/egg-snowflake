exports.snowflake = {
  client: {
    // max 16 workers
    workerIdBitLength: 4,
    // max 64 machines
    machineIdBitLength: 6,
    serialIdBitLength: 12,
    // machine number
    machineId: 0,
    // timestamp start date
    startDate: null
  }
}
