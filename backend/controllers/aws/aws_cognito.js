const AmazonCognitoIdentity = require('amazon-cognito-identity-js');
const AWS = require('aws-sdk');
const request = require('request');
const {generateErrorJSON, generateSuccessJSON} = require('../aws/common');
const CognitoUserSession = require('amazon-cognito-identity-js').CognitoUserSession;
const CognitoUser = require('amazon-cognito-identity-js').CognitoUser;
const CognitoIdToken = require('amazon-cognito-identity-js').CognitoIdToken;
const CognitoAccessToken = require('amazon-cognito-identity-js').CognitoAccessToken;
const CognitoRefreshToken = require('amazon-cognito-identity-js').CognitoRefreshToken;
const CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const jwkToPem = require('jwk-to-pem');
const jwt = require('jsonwebtoken');
const fetch = require('isomorphic-fetch');
const userController = require('../userController');

/*const poolData = {
  UserPoolId: 'us-east-1_3zFrmeF6y',
  ClientId: '77s5hu3poe0ti9ljpvhialiqqd'
};*/

const poolData = {
  UserPoolId: 'us-west-2_32b06Mhcl',
  ClientId: '48oo3b2sun3gq0imr1051lm68p'
};
const pool_region = 'us-west-2';
//const pool_region = 'us-east-1';

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

exports.RegisterUser = (body, done) => {
  var attributeList = [];
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name: "gender", Value: body.gender}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({
    Name: "custom:role",
    Value: body['custom:role'] || 'user'
  }));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name: "address", Value: body.address}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name: "email", Value: body.email}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name: "phone_number", Value: body.phoneNo}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name: "family_name", Value: body.familyName}));
  // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"given name",Value:"pj"}));
  // attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"locale",Value:"1991-06-21"}));
  attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name: "middle_name", Value: ""}));
  //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name: "name", Value: body.firstname}));
  //attributeList.push(new AmazonCognitoIdentity.CognitoUserAttribute({Name:"updated at",Value:"2017-06-21"}));

  userPool.signUp(body.email, body.password, attributeList, null, function (err, result) {
    if (err) {
      console.log(err);
      done(generateErrorJSON(err.message, err));
    } else {
      cognitoUser = result.user;
      console.log('user name is ' + cognitoUser.getUsername());
      let data = {
        sub: result.userSub,
        email: cognitoUser.getUsername(),
        role: body['custom:role'] || 'user',
        firstName: body.familyName,
        middleName: "",
        phoneNumber: body.phoneNo,
        gender: body.gender,
        isConfirm: result.userConfirmed.toString(),
        address: body.address
      }
      userController.createuser(data, function (err, data) {
        if (err) {
          done(generateErrorJSON(err.message, err));
        } else {
          done(null, generateSuccessJSON(200, result));
        }
      })
    }
  });
}

exports.LoginUser = (body, done) => {
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: body.email,
    Password: body.password,
  });
  var userData = {
    Username: body.email,
    Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      done(null, generateSuccessJSON(200, result));
    },
    onFailure: function (err) {
      done(generateErrorJSON(err.message, err));
    },
  });
}

exports.confirmSignup = (body, done) => {
  var userData = {
    Username: body.email,
    Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.confirmRegistration(body.confirmationCode, true, function (err, result) {
    if (err) {
      done(generateErrorJSON(err.message, err));
    }

    done(null, generateSuccessJSON(200, result));
  });
}

exports.resendCode = (body, done) => {
  var userData = {
    Username: body.email,
    Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.resendConfirmationCode(function (err, result) {
    if (err) {
      done(generateErrorJSON(err.message, err));
    }
    done(null, generateSuccessJSON(200, result));
  });
}

exports.ValidateToken = () => {
  return function (req, res, next) {
    request({
      url: `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
      json: true
    }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        pems = {};
        var keys = body['keys'];
        for (var i = 0; i < keys.length; i++) {
          //Convert each key to PEM
          var key_id = keys[i].kid;
          var modulus = keys[i].n;
          var exponent = keys[i].e;
          var key_type = keys[i].kty;
          var jwk = {kty: key_type, n: modulus, e: exponent};
          var pem = jwkToPem(jwk);
          pems[key_id] = pem;
        }
        let token = req.headers['authorization'];
        //validate the token
        var decodedJwt = jwt.decode(token, {complete: true});
        if (!decodedJwt) {
          return res.status(401).json(generateErrorJSON("Not a valid JWT token", 'err'))
        }
        var kid = decodedJwt.header.kid;
        var pem = pems[kid];
        if (!pem) {
          return res.status(401).json(generateErrorJSON("Invalid token", 'err'))
        }
        jwt.verify(token, pem, function (err, payload) {
          if (err) {
            return res.status(401).json(generateErrorJSON(err.message, err))

          } else {
            return next();

          }
        });
      } else {
        return res.status(401).json(generateErrorJSON('Error! Unable to download JWKs', 'err'))
      }
    });
  }
}
exports.ForgotPassword = (body, done) => {
  var userData = {
    Username: body.email,
    Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.forgotPassword({
    onSuccess: function (result) {
      done(null, generateSuccessJSON(200, result));
    },
    onFailure: function (err) {
      done(generateErrorJSON(err.message, err));
    },
//Optional automatic callback
//     inputVerificationCode: function (data) {
//       console.log('Code sent to: ' + data);
//       var verificationCode = prompt('Please input verification code ', '');
//       var newPassword = prompt('Enter new password ', '');
//       cognitoUser.confirmPassword(verificationCode, newPassword, {
//         onSuccess() {
//           console.log('Password confirmed!');
//         },
//         onFailure(err) {
//           console.log('Password not confirmed!');
//         }
//       });
//     }
  });
}

exports.confirmPassword = (body, done) => {
  var userData = {
    Username: body.email,
    Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
   cognitoUser.confirmPassword(body.code, body.password, {
    onSuccess: function (result) {
      done(null, generateSuccessJSON(200, result));
    },
    onFailure: function (err) {
      done(generateErrorJSON(err.message, err));
    }
  });
}

exports.deleteUser = (username, password, done) => {
  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
    Username: username,
    Password: password,
  });

  var userData = {
    Username: username,
    Pool: userPool
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  cognitoUser.authenticateUser(authenticationDetails, {
    onSuccess: function (result) {
      cognitoUser.deleteUser((err, result) => {
        if (err) {
          done(generateErrorJSON(err.message, err));
        } else {
          console.log("Successfully deleted the user.");
          console.log(result);
          done(null, generateSuccessJSON(200, result));

        }
      });
    },
    onFailure: function (err) {
      done(generateErrorJSON(err.message, err));
    },
  });
}
exports.isAdmin = () => {
  return function (req, res, next) {
    request({
      url: `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
      json: true
    }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        let token = req.headers['authorization'];
        //validate the token
        var decodedJwt = jwt.decode(token, {complete: true});
        if (!decodedJwt) {
          return res.status(401).json(generateErrorJSON("Not a valid JWT token", 'err'))
        }
        console.log("Jwt decoded data=====",decodedJwt.payload)
        var role = decodedJwt.payload['custom:role'];

        if ((role.toLowerCase()) === "admin") {
          return next()
        } else {
          return res.status(401).json(generateErrorJSON("You are not Authorized", 'err'))
        }
      } else {
        return res.status(401).json(generateErrorJSON('Error! Unable to download JWKs', 'err'))
      }
    });
  }
}

exports.updateProfile = (body, done) => {
  const AccessToken = new CognitoAccessToken({AccessToken: body.idToken});
  const IdToken = new CognitoIdToken({IdToken: body.accessToken});
  const RefreshToken = new CognitoRefreshToken({RefreshToken: body.refreshToken});
  const sessionData = {
    IdToken: IdToken,
    AccessToken: AccessToken,
    RefreshToken: RefreshToken
  };
  const userSession = new CognitoUserSession(sessionData);
  var userData = {
    Username: body.email,
    Pool: userPool
  };


  const cognitoUser = new CognitoUser(userData);
  cognitoUser.setSignInUserSession(userSession);


  //var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  var attributeList = [
    new AmazonCognitoIdentity.CognitoUserAttribute({Name: "email", Value: body.email}),
    new AmazonCognitoIdentity.CognitoUserAttribute({Name: "custom:role", Value: body['custom:role'] || 'user'}),
    new AmazonCognitoIdentity.CognitoUserAttribute({Name: "family_name", Value: body.familyName}),
    new AmazonCognitoIdentity.CognitoUserAttribute({Name: "phone_number", Value: body.phoneNo}),
    new AmazonCognitoIdentity.CognitoUserAttribute({Name: "gender", Value: body.gender}),
    new AmazonCognitoIdentity.CognitoUserAttribute({Name: "address", Value: body.address}),
  ];

  cognitoUser.updateAttributes(attributeList, function (err, result) {
    if (err) {
      done(generateErrorJSON(err.message, err), null);
    } else {
      done(null, generateSuccessJSON(200, result));
    }
  });

}


exports.isReviewer = () => {
  return function (req, res, next) {
    request({
      url: `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
      json: true
    }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        let token = req.headers['authorization'];
        //validate the token
        var decodedJwt = jwt.decode(token, {complete: true});
        if (!decodedJwt) {
          return res.status(401).json(generateErrorJSON("Not a valid JWT token", 'err'))

        }
        var role = decodedJwt.payload['custom:role'];
        console.log('role', role);
        if (role === "reviewver") {
          return next()
        } else {
          return res.status(401).json(generateErrorJSON("You are not Authorized Reviewer", 'err'))
        }
      } else {
        return res.status(401).json(generateErrorJSON('Error! Unable to download JWKs', 'err'))
      }
    });
  }
}

exports.isUser = () => {
  return function (req, res, next) {
    request({
      url: `https://cognito-idp.${pool_region}.amazonaws.com/${poolData.UserPoolId}/.well-known/jwks.json`,
      json: true
    }, function (error, response, body) {

      if (!error && response.statusCode === 200) {
        let token = req.headers['authorization'];
        //validate the token
        var decodedJwt = jwt.decode(token, {complete: true});
        if (!decodedJwt) {
          return res.status(401).json(generateErrorJSON("Not a valid JWT token", 'err'))
        }
        var role = decodedJwt.payload['custom:role'];
        console.log('role', role)
        if ((role.toLowerCase()) === "user") {
          return next()
        } else {
          return res.status(401).json(generateErrorJSON("You are not Authorized User", 'err'))
        }
      } else {
        return res.status(401).json(generateErrorJSON('Error! Unable to download JWKs', 'err'))
      }
    });
  }
}


// exports.authenticateUser=(id, done) =>{
//     var authenticationData = {
//         Username : 'anjnaharsora@gmail.com',
//         Password : 'SamplePassword@123'
//     };
//     var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
//
//     cognitoUser.authenticateUser(authenticationDetails, {
//         onSuccess: function (result) {
//             var accessToken = result.getAccessToken().getJwtToken();
//
//             AWS.config.region = 'us-east-1';
//
//             AWS.config.credentials = new AWS.CognitoIdentityCredentials({
//                 IdentityPoolId : '', // your identity pool id here
//                 Logins : {
//                     'cognito-idp.us-east-1.amazonaws.com/us-west-2_9jXU9UbYR' : result.getIdToken().getJwtToken()
//                 }
//             });
//
//             AWS.config.credentials.refresh((err,result) => {
//                 if (err) {
//                     done(generateErrorJSON(err.message, err));
//                 } else {
//                     done(null,generateSuccessJSON(200, result));
//                 }
//             });
//         },
//         onFailure: function(err) {
//             done(generateErrorJSON(err.message, err));
//         }
//     });
// }
