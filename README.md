# Gateway Cognito User Store

This AWS CDK project deploys and manages an Amazon Cognito User Pool, which serves as the user store and authorization server for the Gateway product. It provides a secure, scalable, and standardized identity solution for different environments (dev, uat, prod).

### Prerequisites

*   An AWS account with configured credentials.
*   The AWS CDK CLI installed and bootstrapped in your target AWS accounts.
*   Node.js and a package manager like `npm` or `yarn`.

### Getting Started

1.  **Install dependencies**:
    ```sh
    npm install
    ```
2.  **Build the project**:
    ```sh
    npm run build
    ```
3.  **Run tests**:
    ```sh
    npm run test
    ```

### Deployment

The project is configured for multi-environment deployment using dedicated shell scripts. This ensures consistent and repeatable deployments across your development, user acceptance testing (UAT), and production environments.

#### Deploying to an environment

Use the following commands to deploy the stack to a specific environment. The shell script handles setting the correct environment context for the CDK deployment.

*   **Development environment**
    ```sh
    npm run deploy:dev
    ```
*   **UAT environment**
    ```sh
    npm run deploy:uat
    ```
*   **Production environment**
    ```sh
    npm run deploy:prod
    ```

### Extending the Implementation

The user store is designed to be extensible to accommodate new use cases and user groups without modifying the core infrastructure.

#### Defining resource servers and scopes

Resource servers are used to logically group sets of API scopes. These scopes represent different permissions that can be granted to users.

*   **Scopes convention**: `{api-resource-path-concatenated-by-hyphen}.{api-resource-method}`.
    *   **Example**: The Gateway resource `/mobile/external/2degrees/changemsisdn` would correspond to a scope named `mobile-external-2degrees-changemsisdn.post`.
*   **How to extend**: Add new resource servers and custom scopes to the Cognito User Pool definition in the CDK code. For detailed steps, refer to the AWS Cognito documentation.

#### Defining new user pool clients

User Pool clients are used to manage access for different groups of users, such as different teams or applications.

*   **Naming convention**: New clients should use the user group name as a postfix for clarity.
*   **Permissions**: When defining a new client, specify only the necessary scopes from the available resource servers to adhere to the principle of least privilege.
*   **How to extend**: Add a new `UserPoolClient` resource in the CDK stack with the appropriate name and select the required OAuth scopes from your defined resource servers.

### Integration with Gateway

The deployed Cognito User Pool can be used to secure your Gateway APIs via a `COGNITO_USER_POOLS` authorizer.

#### Sample configuration
The following shows a sample integration in a Serverless Framework or similar configuration for a specific API endpoint.

```yaml
http: {
    path: 'path/to/resource',
    method: 'post',
    authorizer: {
        type: 'COGNITO_USER_POOLS',
        authorizerId: {
            Ref: 'CognitoAuthorizer',
        },
        scopes: [
            'scope1',
            'scope2',
        ]
    }
}
```
### Cognito domain and login URL
The final URL for the hosted UI of the User Pool will have the following syntax:
`https://<userPoolNamePrefix>-<region>.auth.<region>.amazoncognito.com`

Example: 
`https://dev-my-api-gateway-ap-southeast-2.auth.ap-southeast-2.amazoncognito.com`

**Login and Signup:** Visit the AWS Management Console, navigate to the Cognito service, select the correct User Pool, and find the App integration tab. From there, select your App Client to find the hosted UI and generate the login URL.
**Redirect URI:** Currently, Postman desktop client URL is used as the callback URI during development. This must be updated to a production-ready URI for live deployments.