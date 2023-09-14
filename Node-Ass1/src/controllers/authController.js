const userService = require('../services/userServices');
const tokenService = require('../services/tokenServices')


exports.registerUser = async (req, res, next) => {
   try{
      if(!(req.body.email == process.env.ADMIN_EMAIL)){
        res.status(400).send({status : false, msg : "email must admin email"})
        return
      }
  
      const users = await userService.registerUser(req.body);
      res.json({  status: "success", message : "user registered successfully", data: users});

    }
    catch (err) {
      next(err);
    }
}


  exports.loginUserWithEmailAndPassword = async (req, res, next) => {
    try {
     const user = await userService.getUserByEmail(req.body.email);
     if(!req.body.email) {
      return res.status(400).send({ status : 'failure', message : 'email is required'})
     }

     if(!req.body.password) {
      return res.status(400).send({ status : 'failure', message : 'password is required'})
     }
     if (!user || !(await user.isPasswordMatch(req.body.password))) {
       return res.status(403).send({ status : 'failure', message : 'Invalid password or email'})
     }
     const token = await tokenService.generateToken(user._id, user.role)
     res.setHeader("x-access-token", token);
     const saveToken = await tokenService.saveToken(user._id, user.role, token)
     const password = req.body.password
     return res.status(200).send({ status : 'success', message : 'login successfully', data : saveToken, password : password})
    }
    catch (err) {
     next(err);
    }
   };