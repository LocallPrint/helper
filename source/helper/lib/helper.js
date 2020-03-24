'use strict';

let AWS = require('aws-sdk');
const Logger = require('../utils/logger/logger.common');

/**
 * Helper function to interact with Cognito for cfn custom resource.
 *
 * @class helper
 */
class helper {

	updateUserPoolClient(props) {
		const {ServiceToken, AwsCredentials, ...params} = props;
		params.AllowedOAuthFlowsUserPoolClient = Boolean(params.AllowedOAuthFlowsUserPoolClient);
		const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({region: 'us-east-1'});
		Logger.log(
			Logger.levels.ROBUST,
			`Cognito User Pool Client Initiated: params: ${JSON.stringify(params)}.`
		);
		cognitoIdentityServiceProvider.updateUserPoolClient(params, (err, data) => {
			if (err) {
				Logger.error(
					Logger.levels.INFO,
					`Error occurred while attempting to save item ${JSON.stringify(err)}.`
				);
			} else {
				Logger.log(
					Logger.levels.ROBUST,
					`Cognito User Pool Client Updated: ${JSON.stringify(data)}.`
				);
				return data;
			}
		});
		return {result: "Cognito User Pool Client Updated Successfully"};
	}

}

module.exports = helper;
