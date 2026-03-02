const mongoose=require("mongoose")
const connectDB=()=>{

    mongoose
  .connect(process.env.MONGO_URL)
    .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));
 
};
module.exports={connectDB}