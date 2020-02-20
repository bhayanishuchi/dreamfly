const {isNullOrUndefined} = require('util');

const userCreate = function (data, cb) {
    if (Object.keys(data).length === 0 && data.constructor === Object) {
        cb("Body Parameter is missing", null)
    } else {
        if (data.username) {
            if (data.password) {
                cb(null, data)
            } else {
                cb("Passowrd(password) Parameter is missing", null)
            }
        } else {
            cb("Username(name) Parameter is missing", null)
        }
    }
}

const userGetdata = function (data, cb) {
    if (data.userId) {
        if (data.formType) {
            cb(null, data)
        } else {
            cb("FormType(formType) Parameter is missing from param", null)
        }
    } else {
        cb("User(user) Parameter is missing from param", null)
    }
}

const getQustion = function (data, cb) {
    if (!(isNullOrUndefined(data))) {
        if (data.formType) {
            cb(null, data)
        } else {
            cb("FormType(formType) Parameter is missing from param", null)
        }
    } else {
        cb("QueryParameter is missing from request", null)
    }
}

const reviewApp = function (data, cb) {
    if (!(isNullOrUndefined(data))) {
        if (data.applicationid) {
            if (data.subForm) {
                if (data.acceptableresult) {
                    if (data.description) {
                        cb(null, data)
                    } else {
                        cb("Description(description) parameter is missing from body", null)
                    }
                } else {
                    cb("Acceptable Result(acceptableresult) parameter is missing from body", null)
                }
            } else {
                cb("Sub Form(subForm) parameter is missing from body", null)
            }
        } else {
            cb("Application Id(applicationid) parameter is missing from body", null)
        }

    } else {
        cb("Body is missing from request", null)
    }
}

const uploadAttachment = function (data, cb) {
    cb(null,data)
}

module.exports = {
    userCreate,
    userGetdata,
    getQustion,
    reviewApp,
    uploadAttachment,
}
