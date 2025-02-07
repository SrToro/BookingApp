const Event = require('../../models/event');

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

    createEvent: args => {

        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: +args.eventInput.price,
            date: dateToString(args.eventInput.date),
            creator: '67a2578d03ce2f8de7cfcaae'
        });

        return event.save()
            .then(result => {
                createdEvent = transformEvent(result);
                return User.findById('67a2578d03ce2f8de7cfcaae');
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