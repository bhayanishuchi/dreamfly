const missingParams = function (data, cb) {
    let error = {
        status: "fail",
        message: data
    }
    cb(error)
}

const queryError = function (data, cb) {
    let error = {
        status: "query fail",
        message: data
    }
    cb(error)
}

const connectionError = function (data, cb) {
    let error = {
        status: "connection fail",
        message: data
    }
    cb(error)
}

module.exports = {
    missingParams,
    queryError,
    connectionError,
}
