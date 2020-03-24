'use strict';

console.log('Loading function');

let AWS = require('aws-sdk');
const Logger = require('../utils/logger/logger.common');

/**
 * Request handler.
 */
exports.handler = (event, context) => {
  if (event.triggerSource === 'CustomMessage_UpdateUserAttribute')  {
    Logger.log(
        Logger.levels.ROBUST,
        `Cognito User Pool Client UpdateUserAttribute Initiated: params: ${JSON.stringify(params)}.`
    );
    const params = {
      UserAttributes: [
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
      UserPoolId: event.userPoolId,
      Username: event.userName,
    };
    var cognitoIdServiceProvider = new AWS.CognitoIdentityServiceProvider();
    cognitoIdServiceProvider.adminUpdateUserAttributes(params, function(err, data) {
      if (err) {
        Logger.log(
            Logger.levels.ROBUST,
            `Error occurred while attempting to update user: ${JSON.stringify(err)}.`
        );
        context.done(err, event);
      } else {
        Logger.log(
            Logger.levels.ROBUST,
            `User updated successfully: ${JSON.stringify(data)}.`
        );
        context.done(null, event);
      }
    });
  } else {
    context.done(null, event);
  }
};
