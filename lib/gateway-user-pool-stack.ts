import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

// Define the custom interface that includes the 'stage' property.
// It extends cdk.StackProps so you can still pass all standard stack properties.
export interface GatewayUserPoolStackProps extends cdk.StackProps {
  stage: string;
}

export class GatewayUserPoolStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: GatewayUserPoolStackProps) {
    super(scope, id, props);

    const stage: string = props.stage;
    const userPoolNamePrefix: string = `${stage}-nova-api-gateway`;
    const resourceServerId: string = `${stage}.novagateway.co.nz`;

    // 1. Defining the Cognito User Pool
    const userPool = new cognito.UserPool(this, 'CognitoUserPool', {
      userPoolName: `${userPoolNamePrefix}-userpool`,
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
    });

    // 2. Defining resource server for cognito user pool. This should be used to group the scopes
    const resourceServer = new cognito.UserPoolResourceServer(this, 'CognitoResourceServer', {
      userPool,
      identifier: resourceServerId,
      userPoolResourceServerName: `${userPoolNamePrefix}-resourceserver`,
      scopes: [
        {
          scopeName: 'mobile-external-2degrees-changemsisdn.post',
          scopeDescription: 'Change 2 degrees MSISDN',
        },
      ],
    });

    // 3. Defining the User Pool client. This should be used to separate access across group of users (eg: teams).
    // Use user group name as a postfix for naming convention.
    // Only necessary scope from resource servers needs to be specified.
    new cognito.UserPoolClient(this, 'CognitoUserPoolClientTelco', {
      userPool,
      userPoolClientName: `${userPoolNamePrefix}-userpoolclient-telco`,
      generateSecret: true,
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.PROFILE,
          cognito.OAuthScope.resourceServer(resourceServer, {
            scopeName: 'mobile-external-2degrees-changemsisdn.post',
            scopeDescription: 'Change 2 degrees MSISDN',
          },),

        ],
        callbackUrls: ['https://oauth.pstmn.io/v1/callback'],
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
      ],

    });

    // 4. Assign a domain URL for the user pool to get signup and signin UI pages.
    const userPoolDomain = userPool.addDomain('CognitoUserPoolDomain', {
      cognitoDomain: {
        domainPrefix: `${userPoolNamePrefix}-${cdk.Aws.REGION}`
      }
    })

    // 5. Printing the user pool domain URL at the end of the deployment.
    new cdk.CfnOutput(this, 'UserPoolDomainUrl', {
      value: userPoolDomain.baseUrl(),
    });

  }
}
