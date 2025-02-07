const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>{
    const authHeader = req.get('Authorization');
    
    //if isnt autenticated can continue but blocked
    if(!authHeader){
        req.isAuth = false;
        return next();
    }


    const token = authHeader.split(' ') [1];//if i split them now i have the bearer and the token and we access to the token with the position 1

    //now verify the token

    //if its empty or wrong
    if(!token || token ==''){
        req.isAuth = false;
        return next();
    }

    //here decoded the token to verify
    let decodedToken;
    try{
        decodedToken = jwt.verify(token,'somesupersecretkey');
    }catch(err){
        req.isAuth = false;
        return next();
    }
    //test if it is
    if(!decodedToken){
        req.isAuth = false;
        return next();
    }

    //the token past succesfully
    req.isAuth = true;
    req.userId = decodedToken.userId;
    next();

}