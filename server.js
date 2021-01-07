const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const jwksClient = require('jwks-rsa');

const app = express();
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))

mongoose.connect("mongodb://localhost/test-db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
}).then(() => console.log("DB connected"));
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  token: String,
  apple_id: String,
});

const User = mongoose.model("User", userSchema);

const client = jwksClient({
  strictSsl: true, // Default value
  jwksUri: 'https://appleid.apple.com/auth/keys'
});

function getAppleSigninKey(kid) {

  return client.getSigningKeyAsync(kid).then(key => { 
    const signingKey = key.getPublicKey();

    return signingKey;
  });

}

function verifyJWT(token, publicKey) {
  return new Promise((resolve) => {

  jwt.verify(token, publicKey, (err, payLoad) => {
    if(err) {
      console.error(err);
      return resolve(null)
      
    }

    resolve(payLoad);
  })
})
}

app.post("/apple-login", async(req, res) => {
  const {token, email, apple_id, user} = req.body;
  try {
    
  } catch (error) {
    
  }
  const foundUser = await User.findOne({apple_id:apple_id});
  if(!foundUser) {
   
    const json = jwt.decode(token, {complete:true});
    const kid = json.header.kid;
    const appleKey= await getAppleSigninKey(kid);

    if(!appleKey) {
      return res.status(400).json("something went wrong!");
    }

    const payLoad = await verifyJWT(token, appleKey)
    if(!payLoad) {
      console.log("something went wrong!");
      console.log("check")
     return res.status(400).json({success: false, message: "something went wrong"})
    }

    if(payLoad.sub ===user) {
      const user = await User.create(email, apple_id);
     return res.send("successfully login");
    } else {
      res.send("wrong wrong wrong!");
    }

    


    





  } 

  // res.status(201).json({
  //   success: true,
  //   data: user,
  // });

})
app.listen(3000, () => console.log("server is running on port 3000"));
