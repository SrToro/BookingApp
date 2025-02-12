const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const mongoose = require('mongoose');

const graphqlSchema = require('./graphql/schema/index');
const graphqlResolvers = require('./graphql/resolvers/index');
const isAuth = require('./middleware/is-auth');

const app = express();

app.use(bodyParser.json());

app.use(isAuth);

app.use('/graphql', graphqlHttp({
    schema: graphqlSchema,
    rootValue: graphqlResolvers,


    graphiql: true
}));


mongoose.connect('mongodb://127.0.0.1/booking_app')
    .then(() => {
    app.listen(8000);
    console.log('db conected')
}).catch(err => {
    console.log(err);
    console.log('db not connected')
});


//connection to a online database

// mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.y8brk.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0`).then(() => {
//     app.listen(3000);
// }).catch(err => {
//     console.log(err);
// });

