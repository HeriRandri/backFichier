const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"]; // get the authorization header from request

    if (!authHeader) return res.sendStatus(401);
    console.log(!authHeader); // if there is no authorization header, send an unauthorized response.
    const token = authHeader.split(" ")[1]; // Split the 'Bearer <token>' string to get the actual jwt

    if (!token) return res.sendStatus(401);

    // Verify using jwt to see if token has been tampered with or if it has expired.
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        // if token has been altered or has expired, return an unauthorized error
        return res
          .status(401)
          .json({ message: "This session has expired. Please login" });
      }

      req.user = decoded; // put the decoded data object into req.user
      next();
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      code: 500,
      data: [],
      message: "Internal Server Error",
    });
  }
};

module.exports = { authenticateToken };
