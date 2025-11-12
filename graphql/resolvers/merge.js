const DataLoader = require('dataloader');
const Event = require('../../models/event');
const User = require('../../models/user');

const { dateToString } = require('../../helpers/date');

const eventLoader = new DataLoader((eventIds)  =>{
    return events(eventIds);
})

const userLoader = new DataLoader((userIds) =>{
    return User.find({_id: {$in: userIds}})
})

//find events by id for the user const
const events = eventIds =>{
    return Event.find({_id: {$in: eventIds}})
    .then(events =>{
        return events.map(event=>{
            return transformEvent(event)
        })
    })
    .catch(err =>{
        throw err
    })
};


// get single event by id
const singleEvent = eventId =>{
    return eventLoader.load(eventId.toString())  
    .then(event =>{
        return event
    })
    .catch(err =>{
        throw err;
    });
};

//find user by id
const user = userId =>{
    return userLoader.load(userId.toString())
    .then(user =>{
        return{
            ...user._doc, 
            _id: user.id, 
            createdEvents: eventLoader.loadMany.bind(this, user._doc.createdEvents)};
    })
    .catch(err =>{
        throw err;
    });
};

//get Event complete doc

const transformEvent = event =>{
    return {
        ...event._doc,
        _id: event.id,
        date: dateToString(event._doc.date),
        creator: user.bind(this, event.creator)}
};

//get booking complete doc
const transformBooking = booking =>{
    return {
        ...booking._doc,
        _id: booking._id,
        user: user.bind(this,booking._doc.user),
        event: singleEvent.bind(this, booking._doc.event),
        createdAt: dateToString(booking._doc.createdAt),
        updateddAt: dateToString(booking._doc.updatedAt)
    }
}

exports.transformBooking = transformBooking;
exports.transformEvent = transformEvent;

// exports.singleEvent = singleEvent;
// exports.user = user;
// exports.events = events;
