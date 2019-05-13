const assert = require('assert')
const {Big} = require('big.js')

class Snowflake {
  constructor (app, {
    // 6 bit machineId which supports 64 machines/instances of a single service.
    machineIdBitLength = 6,
    // 4 bit worker id which supports 16(2 ** workerIdBitLength) egg workers
    workerIdBitLength = 4,
    // 12 bit serial no which could handle max
    // 4096(`2 ** serialIdBitLength`) requests per millisecond
    serialIdBitLength = 12,
    machineId,
    startDate
  }) {
    this._index = 1
    this._count = 0
    this._startTime = startDate ? new Date(startDate).getTime() : 0
    this._resetTime = Date.now()

    let o1, o2, o3

    o1 = 2 ** machineIdBitLength * (
      o2 = 2 ** workerIdBitLength * (
        o3 = 2 ** serialIdBitLength
      )
    )

    this._offset = [o1, o3]

    this._machineId = o1 !== o2 && machineId
      ? machineId * o2
      // If `machineIdBitLength` equals to `0`, which means no support for machineId
      : 0
  }

  index () {
    return this._index
  }

  uuid () {
    return this._uuid(this._index)
  }

  _getCount (now) {
    if (now - this._resetTime > 1000) {
      this._resetTime = now
      return this._count = 0
    }

    return this._count ++
  }

  _uuid (index) {
    const now = Date.now()
    const count = this._getCount(now)
    const [o1, o3] = this._offset

    // now << 22(default),
    // but in JavaScript we should use big.js,
    // because JavaScript could not handle numbers larger than
    //   `Number.MAX_SAFE_INTEGER`
    let uuid = new Big(now).minus(this._startTime).times(o1)
    .plus(count)

    if (this._machineId) {
      uuid = uuid.plus(this._machineId)
    }

    if (o3) {
      uuid = uuid.plus(index * o3)
    }

    return uuid.toString()
  }
}

function create (config = {}, app) {
  return new Snowflake(app, config)
}

exports.app = app => {
  app.addSingleton('snowflake', create)
}
