import cloudinary,{} from "cloudinary"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
async function processUpload() {
 //let upload=new cloudinary.UploadStream()
 cloudinary.v2.image()
}
  export default function getCloudinary() {
    return cloudinary
  }