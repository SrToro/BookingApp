const Event = require('../../models/event');
const {dateToString} = require('../../helpers/date');
const { user } = require('./merge');


const transformEvent = event =>{
    return {
        ...event._doc, 
        _id: event.id,
        date: dateToString(event._doc.date), 
        creator: user.bind(this, event.creator)}
}

module.exports= {

    //querys
    
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

    //mutations

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