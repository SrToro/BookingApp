const Booking = require('../../models/booking');
const {dateToString} = require('../../helpers/date');

const { user, singleEvent } = require('./merge')



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


module.exports= {

    //querys
    
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