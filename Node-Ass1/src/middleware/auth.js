const jwt = require('jsonwebtoken');


const isAuthenticated = async (req, res, next) => {
  const token = req.headers['x-access-token']
  if(!token) {
    return res.status(401).send({status : 'failure', message : "token must be present"})
  }
  try {
    const decoded = jwt.verify(token, "secretKey");
    console.log(decoded, "decoded")
    req.userId = decoded.userId;
    req.role = decoded.role;
    next()
  }
  catch (err) {
    return res.status(500).send({status : 'failure', message : "Server Error", err : err.message})
  }
}

const isAuthorizedRole = async (req, res, next) => {
  const roleFromToken = req.headers["role"]
  if (req.role != roleFromToken) {
    return res
      .status(400)
      .send({ status: false, message: "Unauthorized Access role must be have access" });
  }
  next()
}

const isAuthorizedUser = async (req, res, next) => {
  // const userFromToken = req.params.id
  const userFromToken = req.userId
  
  console.log(req.params.id)
  console.log(req.body.userId)
  console.log(userFromToken)
  if((req.params.id || req.params.userId || req.body.userId)!= userFromToken) {
    return res
      .status(400)
      .send({ status : false, message: "Unauthorized Access user must be authorized "})
  }
  next()
}

module.exports = {
  isAuthenticated,
  isAuthorizedRole,
  isAuthorizedUser
}