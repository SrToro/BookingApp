const Event = require('../../models/event');
const User = require('../../models/user');

const {dateToString} = require('../../helpers/date');

const { transformEvent } = require('./merge');



module.exports= {

    //Events querys
    
    events: () => {

        return Event.find()
        .then(events => {
            return events.map(event => {
                return transformEvent(event);
            });
        }).catch(err => {
            throw err;
        });

    },

    //Events mutations

    createEvent: async (args, req) => {
        if (!req.isAuth){
            throw new Error('User does not logged in')
        }
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: req.userId
        });

        return event.save()
            .then(result => {
                createdEvent = transformEvent(result);
                return User.findById(req.userId);
            }).then(user =>{
                if (!user) {
                    throw new Error('This user doesnt Exist')
                }
                user.createdEvents.push(event);
                user.save();
                return createdEvent;
            })
            .catch(err => {
                console.log(err);
                throw err;
            });
    }
};