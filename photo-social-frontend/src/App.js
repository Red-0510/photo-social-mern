import React,{useState,useEffect} from 'react';
import logo from './logo.svg';
import './App.css';
import {auth,createUserWithEmailAndPassword, updateProfile, signInWithEmailAndPassword} from "./firebase";
import Pusher from "pusher-js";

import Post from "./components/Post";
import ImageUpload from "./components/ImageUpload";
import axios from "./axios";

import Modal from "@mui/material/Modal";
import {Button,Input} from "@mui/material";
import dotenv from "dotenv";
dotenv.config();

const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY,{cluster:process.env.REACT_APP_PUSHER_CLUSTER});

function App() {

  const style={
    paper:{
      position:"absolute",
      top:`50%`,
      left:`50%`,
      transform:'translate(-50%,-50%)',
      width:400,
      backgroundColor :`white`,
      borderRadius:10,
      border: `2px solid transparent`,
      boxShadow: `inset 0px 0px 0px 2px black`,
      padding:25,
    },
  };

  const [user,setUser] = useState(null);
  const [username,setUsername] = useState("");
  const [password,setPassword] = useState("");
  const [email,setEmail] = useState("");

  const [openSignIn,setOpenSignIn] = useState(false);
  const [open, setOpen] = useState(false)

  const [posts,setPosts] = useState([]);


  async function fetchPosts(){
    await axios.get("/sync")
      .then(response=>setPosts(response.data))
  }

  function signUp(event){
    // console.log("Sign up");
    event.preventDefault();
    createUserWithEmailAndPassword(auth,email,password)
      .then(authUser=>{
        updateProfile(authUser.user,{displayName:username}) 
      })
      .catch(error=>alert(error.message))

    setOpen(false);
  }

  function signIn(event){
    event.preventDefault();
    signInWithEmailAndPassword(auth,email,password)
      .then(authUser=>console.log(authUser.user))
      .catch(error=>alert(error.message))
    setOpenSignIn(false);
  }

  useEffect(()=>{
    // console.log("UseEffect");
    const unsubscribe = auth.onAuthStateChanged(authUser =>{
      if(authUser){
        setUser(authUser)
      } else{
        setUser(null);
      }
    })
    return ()=>{
      // console.log("unsubscribe");
      unsubscribe();
    }
  },[user,username]);

  useEffect(()=>{
    fetchPosts();
  },[]);

  useEffect(()=>{
    const channel = pusher.subscribe("posts");
    channel.bind("inserted",(data)=>{
      console.log(data);
      setPosts([...posts,data]);
    });

    return ()=>{
      channel.unbind_all();
      channel.unsubscribe();
    }
  },[posts]);

  return (
    <div className='app'>
      <Modal open={open} onClose={()=>setOpen(false)}>
        <div style={style.paper}>
          <form className='app_signup'>
            <center>
              <img className='app_headerImage' src="logo192.png" alt="header" />
            </center>
            <Input type="text" placeholder="username" value={username} onChange={(e)=>setUsername(e.target.value)} />
            <Input type="email" placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input type="password" placeholder="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <Button type="submit" onClick={signUp}>Sign Up</Button>
          </form>
        </div>
      </Modal>
      <Modal open={openSignIn} onClose={()=>setOpenSignIn(false)}>
        <div style={style.paper}>
        <form className='app_signup'>
            <center>
              <img className='app_headerImage' src="logo192.png" alt="header" />
            </center>
            <Input type="email" placeholder="email" value={email} onChange={(e)=>setEmail(e.target.value)} />
            <Input type="password" placeholder="password" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <Button type="submit" onClick={signIn}>Sign In</Button>
          </form>
        </div>
      </Modal>

      <div className="app_header">
        <img className='app_headerImage' src="logo192.png" alt="Header" />
        { user? <Button onClick={()=>auth.signOut()}>Logout</Button>:(
            <div className='app_loginContainer'>
              <Button onClick={()=>setOpen(true)}>Sign Up</Button>
              <Button onClick={()=>setOpenSignIn(true)}>Sign In</Button>
            </div>
        )}
      </div>
      <div className="app_posts">
        {posts.map((post,index)=>(
          <Post key={post._id} username={post.user} caption={post.caption} imageURL={post.image} />
        ))}
        </div>
        {user? <ImageUpload username={user.displayName} /> :
          <h3 className='app_notLogin'>Need to Login to upload</h3>}
      </div>
  );
}

export default App;
