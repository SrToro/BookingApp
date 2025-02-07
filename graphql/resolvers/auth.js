const bcrypt = require('bcryptjs');

const User = require('../../models/user');



module.exports= {

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
    }
};