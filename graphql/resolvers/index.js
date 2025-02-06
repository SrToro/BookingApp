const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');
const {dateToString} = require('../../helpers/date')

const transformEvent = event =>{
    return {
        ...event._doc, 
        _id: event.id,
        date: dateToString(event._doc.date), 
        creator: user.bind(this, event.creator)}
}

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


//find events by id
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

const singleEvent = eventId =>{
    return Event.findById(eventId)
    .then(event =>{
        return{
            ...event._doc,
            _id: event.id,
            creator: user.bind(this, event.creator)
        };
    })
    .catch(err =>{
        throw err;
    });
}

//find user by id
const user = userId =>{
    return User.findById(userId)
    .then(user =>{
        return{
            ...user._doc, 
            _id: user.id, 
            createdEvents: events.bind(this, user._doc.createdEvents)};
    })
    .catch(err =>{
        throw err;
    });
};


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

    bookings: () => {

        return Booking.find()
        .then(bookings => {
            return bookings.map(booking =>{
                return transformBooking(booking);
            });
        })
        .catch(err =>{
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
    },
    bookEvent: async args =>{

        const fetchedEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: '67a2578d03ce2f8de7cfcaae',
            event: fetchedEvent
        })
        const result = await booking.save();
        return transformBooking(result);
    },
    
    cancelBooking: async args =>{
        const booking = await Booking.findById(args.bookingId).populate('event')
        const event = transformEvent(booking.event);
        await Booking.deleteOne({_id: args.bookingId});
        return event 
    }
};