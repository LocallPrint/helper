/*********************************************************************************************************************
 *  Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.                                           *
 *                                                                                                                    *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance    *
 *  with the License. A copy of the License is located at                                                             *
 *                                                                                                                    *
 *      http://www.apache.org/licenses/LICENSE-2.0                                                                    *
 *                                                                                                                    *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES *
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions    *
 *  and limitations under the License.                                                                                *
 *********************************************************************************************************************/

'use strict';

console.log('Loading function');

const url = require('url');
const requestPromise = require('request-promise');
const cognitoHelper = require('./lib/helper');

/**
 * Request handler.
 */
exports.handler = async (event, context, callback) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  let responseData = {};
  let responseSent = false;

  const properties = event.ResourceProperties;

  // Handling Promise Rejection
  process.on('unhandledRejection', error => {
    throw error;
  });

  try {
    if ( event.ResourceType === 'Custom::UpdateUserPoolClientApp'
        || event.ResourceType === 'Custom::UpdateUserPoolMobileClient') {
      if (
        event.RequestType === 'Create'
        || event.RequestType === 'Delete'
        || event.RequestType === 'Update'
      ) {
        const _cognitoHelper = new cognitoHelper();
        try {
          if (!properties.ClientId || !properties.UserPoolId) {
            console.error(`${event.RequestType} User Pool Client App configuration not initiated, ClientId and UserPoolId must be provided.`, error);
            throw Error(`${event.RequestType} User Pool Client App not initiated.`);
          }
          responseData = _cognitoHelper.updateUserPoolClient(properties)
        } catch (error) {
          // Throws error when updateUserPoolClientApp fails.
          console.error(`${event.RequestType} User Pool Client App configuration for authentication providers failed.`, error);
          throw Error(`${event.RequestType} User Pool Client App failed.`);
        }
      }
    }
  } catch (err) {
    console.log(`Error occurred while ${event.RequestType} ${event.ResourceType}:\n`, err);
    responseData = {
      Error: err.message,
    };
    await sendResponse(event, callback, context.logStreamName, 'FAILED', responseData);
    responseSent = true;
  } finally {
    if (!responseSent) {
      await sendResponse(event, callback, context.logStreamName, 'SUCCESS', responseData);
    }
  }
}

/**
 * Sends a response to the pre-signed S3 URL
 */
let sendResponse = async function (event, callback, logStreamName, responseStatus, responseData) {
  const responseBody = JSON.stringify({
    Status: responseStatus,
    Reason: `${JSON.stringify(responseData)}`,
    PhysicalResourceId: logStreamName,
    StackId: event.StackId,
    RequestId: event.RequestId,
    LogicalResourceId: event.LogicalResourceId,
    Data: responseData,
  });

  console.log('RESPONSE BODY:\n', responseBody);
  const parsedUrl = url.parse(event.ResponseURL);
  const options = {
    uri: `https://${parsedUrl.hostname}${parsedUrl.path}`,
    port: 443,
    method: 'PUT',
    headers: {
      'Content-Type': '',
      'Content-Length': responseBody.length,
    },
    body: responseBody,
  };

  try {
    await requestPromise(options);
    console.log('Successfully sent stack response!');
    callback(null, 'Successfully sent stack response!');
  } catch (error) {
    console.log('sendResponse Error:', error);
    callback(error);
  }
};
