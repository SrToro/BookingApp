const Booking = require('../../models/booking');
const Event = require('../../models/event');

const { transformEvent, transformBooking} = require('./merge')



module.exports= {

    //booking querys
    
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


    // booking mutations

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