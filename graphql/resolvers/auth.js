const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
    },

    login: async({email, password} ) =>{
        const user = await User.findOne({email: email});
        if(!user){
            throw new Error('User does not exist');
        }
        const isEqual = await bcrypt.compare(password, user.password);
        if(!isEqual){
            throw new Error('Password incorrect');
        }

        const token = jwt.sign({userId: user.id, email: user.email}, 'somesupersecretkey',{
            expiresIn: '1h'
        });
        return { userId: user.id, token: token, tokenExpiration: 1};
    }
};