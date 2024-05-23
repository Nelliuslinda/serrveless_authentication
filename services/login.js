const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
})

/*Libraries & Packages*/
const util = require('../utils/util.js')
const bycrypt = require('bycrypt.js')
const auth = require('../utils/auth.js')

const dynamodb = new AWS.DynamoDB.DocumentClient();
const userTable = 'eventsasa-users';

async function login(user) {
    const username = user.username;
    const password = user.password;
    if (!user || !username || !password){
        return util.buildResponse(401, {
            message: 'Username and Password is required'
        })
    }

    const dynamoUser = await getUser(username);
    if(!dynamoUser || !dynamoUser.username){
        return util.buildResponse(403,{
            message: 'Username does not exist'
        });
    }

    if (!bycrypt.compareSync(password, dynamoUser.password)){
        return util.buildResponse(403, {
            message:'Passowrd is incorrect'
        });
    }

    const userInfo = {
        username: dynamoUser.username,
        name: dynamoUser.name
    }

    const token = auth.generateToken(userInfo)
    const response = {
        user: userInfo,
        token: token
    }

    return ustil.buildResponse(200, response);
}
/*Get User Func*/
async function getUser(username){
    const param = {
        TableName: userTable,
        Key: {
            username: username
        }
    }

    return await dynamodb.get(params).promise().then(response =>{
        return response.Item;
    }, error =>{
        console.error('There is a error getting user: ', error);
    })
}

module.exports.login = login;