import mongoose from "mongoose";

const postSchema = mongoose.Schema({
    caption:String,
    user:String,
    image:String,
});

export default mongoose.model("posts",postSchema);