const { verify } = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const accessToken = req.get("accessToken");
  //get accessToken from the header in frontend

  if (!req.header("accessToken")) {
    return res.json({ error: "User not logged in!" });
    //if there are no user, response with a json error: "user not logged in"
  }
  try {
    const validToken = verify(accessToken, "important");
    req.user = validToken;
    if (validToken) {
      return next();
      //if user is logged in (req.user exists) then continue
    }
  } catch (err) {
    return res.json({ error: err });
    //catch any error
  };
}



module.exports = { validateToken };