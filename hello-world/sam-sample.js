const AWS = require('aws-sdk');
AWS.config.update({ region: 'ap-northeast-1' });

const dynamoDBEndpoint = 'http://host.docker.internal:4569';
const dynamoDB = new AWS.DynamoDB({ endpoint: dynamoDBEndpoint });
const docClient = new AWS.DynamoDB.DocumentClient({ service: dynamoDB });

const tableName = 'tb-sam-sample';

exports.handler = async (event, context) => {
    try {
        switch (event.httpMethod) {
            case 'POST': {
                const payload = JSON.parse(event.body);

                await docClient.put({
                    Item: {
                        Id: payload.id,
                        Data: payload.data
                    },
                    TableName: tableName
                }).promise();

                return {
                    statusCode: 200,
                    body: {}
                }
            }

            case 'GET': {
                if (event.pathParameters && event.pathParameters.id) {
                    const id = event.pathParameters.id;

                    const res = await docClient.get({
                        Key: { Id: id },
                        TableName: tableName
                    }).promise();

                    return {
                        statusCode: 200,
                        body: JSON.stringify(res.Item)
                    }
                } else {
                    const res = await docClient.scan({
                        TableName: tableName
                    }).promise();

                    return {
                        statusCode: 200,
                        body: JSON.stringify(res.Items)
                    }
                }
            }

            default: {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        message: 'invalid input'
                    })
                }
            }
        }
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'internal server error'
            })
        }
    }

};
