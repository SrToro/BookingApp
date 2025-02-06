const bcrypt = require('bcryptjs');

const Event = require('../../models/event');
const User = require('../../models/user');
const Booking = require('../../models/booking');

const transformEvent = event =>{
    return {
        ...event._doc, 
        _id: event.id,
        date: new Date(event._doc.date).toISOString(), 
        creator: user.bind(this, event.creator)}
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
                return { 
                    ...event._doc, 
                    _id: event._id,
                    date: new Date(event._doc.date).toISOString(),
                    creator: user.bind(this,event._doc.creator)
                    };
            });
        }).catch(err => {
            throw err;
        });

    },

    bookings: () => {

        return Booking.find()
        .then(bookings => {
            return bookings.map(booking =>{
                return{
                    ...booking._doc,
                    _id: booking._id,
                    user: user.bind(this,booking._doc.user),
                    event: singleEvent.bind(this, booking._doc.event),
                    createdAt: new Date(booking._doc.createdAt).toISOString(),
                    updateddAt: new Date(booking._doc.updatedAt).toISOString()
                }
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
            date: new Date(args.eventInput.date),
            creator: '67a2578d03ce2f8de7cfcaae'
        });

        return event.save()
            .then(result => {
                createdEvent = { 
                    ...result._doc, 
                    _id: result._doc._id.toString(),
                    date: new Date(result._doc.date).toISOString(),
                    creator: user.bind(this, result._doc.creator)    
                };
                return User.findById('67a2578d03ce2f8de7cfcaae');
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
    },
    bookEvent: async args =>{

        const fetchedEvent = await Event.findOne({_id: args.eventId});
        const booking = new Booking({
            user: '67a2578d03ce2f8de7cfcaae',
            event: fetchedEvent
        })
        const result = await booking.save();
        return {...result._doc,
            _id: result.id,
            user: user.bind(this,booking._doc.user),
            event: singleEvent.bind(this, booking._doc.event),
            createdAt: new Date(result._doc.createdAt).toISOString(),
            updateddAt: new Date(result._doc.updatedAt).toISOString()
        };
    },
    
    cancelBooking: async args =>{
        const booking = await Booking.findById(args.bookingId).populate('event')
        const event = {
            ...booking.event._doc, 
            _id: booking.event.id,
            creator: user.bind(this, booking.event._doc.creator)
        }
        await Booking .deleteOne({_id: args.bookingId});
        return event
    }
};