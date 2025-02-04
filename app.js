const express = require('express');
const bodyParser = require('body-parser');
const graphqlHttp = require('express-graphql').graphqlHTTP;
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

const events = eventIds =>{
    return Event.find({_id: {$in: eventIds}})
    .then(events =>{
        return events.map(event=>{
            return{...event._doc, 
                _id: event.id, 
                creator: user.bind(this, event.creator)}
        })
    })
    .catch(err =>{
        throw err
    })
}

const user = userId =>{
    return User.findById(userId)
    .then(user =>{
        return{...user._doc, _id: user.id, createdEvents: events.bind(this, user._doc.createdEvents)};
    })
    .catch(err =>{
        throw err;
    });
};

app.use('/graphql', graphqlHttp({
    schema: buildSchema(`


        type Event {
            _id: ID!
            title: String! 
            description: String!
            price: Int!
            date: String!
            creator: User!
        }

        type User{
            _id: ID!
            email: String!
            password: String
            createdEvents: [Event!]
        }


        input EventInput {
            title: String!
            description: String!
            price: Int!
            date: String!
        }

        input UserInput {
            email: String!
            password: String!
        }


        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
            createUser(userInput: UserInput): User
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
        
        `),
    rootValue: {
        events: () => {

            return Event.find()
            .then(events => {
                return events.map(event => {
                    return { 
                        ...event._doc, 
                        _id: event._id,
                        creator: user.bind(this,event._doc.creator)
                        };
                });
            }).catch(err => {
                throw err;
            });

        },


        createEvent: args => {

            const event = new Event({
                title: args.eventInput.title,
                description: args.eventInput.description,
                price: +args.eventInput.price,
                date: new Date(args.eventInput.date),
                creator: '679d4689114ad3b061232d4d'
            });

            return event.save()
                .then(result => {
                    createdEvent = { ...result._doc, _id: result._doc._id.toString() };
                    return User.findById('679d4689114ad3b061232d4d');
                }).then(user =>{
                    if (!user) {
                        throw new Error('This user doesnt Exist')
                    }
                    user.createdEvents.push(event);
                    return user.save();
                }).then(result =>{
                    return createdEvent;
                })
                .catch(err => {
                    console.log(err);
                    throw err;
                });
        },

        createUser: args => {
            return User.findOne({ email: args.userInput.email })
                .then(user => {
                    if (user) {
                        throw new Error('This user exist already')
                    }

                    return bcrypt.hash(args.userInput.password, 12)

                }).then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    });
                    return user.save();
                }).then(result => {
                    return { ...result._doc, password: null, _id: result._doc._id.toString() };
                })
                .catch(err => {
                    throw err
                });
        }


    },


    graphiql: true
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.y8brk.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority&appName=Cluster0`).then(() => {
    app.listen(3000);
}).catch(err => {
    console.log(err);
});

