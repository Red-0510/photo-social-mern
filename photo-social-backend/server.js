import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Cors from "cors";
import Posts from "./postModel.js";
import Pusher from "pusher";
dotenv.config();

//App Config
const app=express();
const port= process.env.PORT || 9000;
const connectionURL = process.env.CONNECTION_URL || "mongodb://localhost:27017/photoDB";


// MiddleWare
app.use(express.json())
app.use(Cors());

const pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true
});
//Db Config
mongoose.set("strictQuery",false);
mongoose.connect(connectionURL,{
    useNewUrlParser:true,
});

mongoose.connection.once("open",()=>{
    console.log("DB Connected")
    const changeStream = mongoose.connection.collection("posts").watch();
    changeStream.on("change",(change)=>{
        console.log(change);
        if(change.operationType==="insert"){
            console.log("Trigerring Pusher");
            pusher.trigger('posts',"inserted",change.fullDocument);
            console.log("trigerred all");
        }
        else{
            console.log("Error triggering pusher");
        }
    });
});
//API endpoints
//GET requests

app.get("/",(req,res)=>res.status(200).send("Nope you aint getting high here"));
app.get("/sync",(req,res)=>{
    Posts.find({},(err,data)=>{
        if(err) res.status(500).send(err);
        else res.status(200).send(data);
    });
})

//POST requests

app.post("/upload",(req,res)=>{
    const dbPost=req.body;
    Posts.create(dbPost,(err,data)=>{
        if(err) res.status(500).send(err);
        else res.status(201).send(data);
    });
})

//Listener

app.listen(port,()=>console.log(`Server is listening at localhost:${port}`));