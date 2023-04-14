import AWS from "aws-sdk";
AWS.config.getCredentials((err, cred) => {
  if (err) console.log(err.stack);
  console.log(cred)
});
let s3=new AWS.S3()

export {}