const {RegisterUser, LoginUser, confirmSignup, resendCode,ForgotPassword,confirmPassword, authenticateUser,updateProfile, ValidateToken,deleteUser} = require('../aws/aws_cognito');
const userController = require('../userController');
const {generateHash} = require('./common')
const {Router} = require('express');
const router = Router();

router.post('/register', (req, res) => {
    return RegisterUser(req.body, (err, result) => {
        if (err) {
            return res.status(400).json(err);
        } else {
            return res.json(result).status(200);
        }
    });
});

router.post('/deleteUser', (req, res) => {
  return deleteUser(req.body.userName,req.body.password, (err, result) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.json(result).status(200);
    }
  });
});

router.post('/login', (req, res) => {
    return LoginUser(req.body, (err, result) => {
        if (err) {
            return res.status(400).json(err);
        } else {
            let data = {
                sub: result.data.idToken.payload.sub,
                email: result.data.idToken.payload.email,
            }
            userController.UpdateUserIsConfirmQuery(data, function (err, data) {
                if (err) {
                    return res.status(400).json(err);
                } else {
                    result['userid'] = data;
                    result['role'] = result.data.idToken.payload['custom:role'];
                    return res.json(result).status(200);
                }
            })
        }
    });
});

router.post('/confirmation', (req, res) => {
    return confirmSignup(req.body, (err, result) => {
        if (err) {
            return res.status(400).json(err);
        } else {
            return res.json(result).status(200);
        }
    });
});

router.post('/updateProfile', (req, res) => {
  return updateProfile(req.body, (err, result) => {
    if (err) {
      return res.status(400).json(err);
    } else {

      userController.UpdateUserProfile(req.body, function (err, data) {
        if (err) {
          return res.status(400).json(err);
        } else {
          return res.json(data).status(200);
        }
      })


    }
  });
});

router.post('/forgotPassword', (req, res) => {
  return ForgotPassword(req.body, (err, result) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.json(result).status(200);
    }
  });
});

router.post('/confirmPassword', (req, res) => {
  return confirmPassword(req.body, (err, result) => {
    if (err) {
      return res.status(400).json(err);
    } else {
      return res.json(result).status(200);
    }
  });
});

// router.post('/authenticate', (req, res) => {
//     return authenticateUser(req.body,(err, result) => {
//         if (err) {
//             return res.status(400).json(err);
//         }
//         else {
//             return res.json(result).status(200);
//         }
//     });
// });

router.post('/validatetoken', (req, res) => {
    return ValidateToken(req.body, (err, result) => {
        if (err) {
            return res.status(400).json(err);
        } else {
            return res.json(result).status(200);
        }
    });
});

router.post('/resend-code', (req, res) => {
    return resendCode(req.body, (err, result) => {
        if (err) {
            return res.status(400).json(err);
        } else {
            return res.json(result).status(200);
        }
    });
});

module.exports = router;
