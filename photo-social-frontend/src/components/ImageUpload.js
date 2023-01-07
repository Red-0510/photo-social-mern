import React ,{useState} from "react";
import "./ImageUpload.css";
import {ref, uploadBytesResumable,getDownloadURL} from "firebase/storage";
import {storage} from "../firebase";
import axios from "../axios";

function ImageUpload(props){
    const [url,setUrl] = useState("");
    const [image,setImage] = useState(null);
    const [progress, setProgress] = useState(0);
    const [caption, setCaption] = useState("");

    
    function handleChange(e){
        if(e.target.files[0]){
            setImage(e.target.files[0]);
        }
    }
    
    function handleUpload(){
        const storageRef = ref(storage,`images/${image.name}`)
        const uploadTask = uploadBytesResumable(storageRef, image)
        uploadTask.on(
            "state_changed",(snapshot)=>{
                const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes)*100);
                setProgress(progress);
            },
            (err)=>{
                console.log(err);
            },
            ()=>{
                getDownloadURL(uploadTask.snapshot.ref)
                    .then((url)=>{
                        setUrl(url);
                        axios.post("/upload",{
                            caption:caption,
                            user:props.username,
                            image:url
                        })
                        setProgress(0);
                        setCaption("");
                        setImage(null);
                    });
            }
        );
        
    }


    return (
        <div className="imageUpload">
            <progress className="imageUpload_progress" value={progress} max="100" />
            <input type="text"
                placeholder="Enter a caption ..."
                className="imageUpload_input"
                value={caption}
                onChange={e=>setCaption(e.target.value)}
            />
            <input className="imageUpload_file" type="file" onChange={handleChange} />
            <button className="imageUpload_button" onClick={handleUpload}>Upload</button>
        </div>
    );
}

export default ImageUpload;