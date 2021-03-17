import './App.css';
import firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebaseConfig';
import { useState } from 'react';

// firebase.initializeApp(firebaseConfig);

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}else {
  firebase.app(); // if already initialized, use that one
}

function App() {
  const googleProvider = new firebase.auth.GoogleAuthProvider();
  const facebookProvider= new firebase.auth.FacebookAuthProvider();
  const [newUser,setNewUser]=useState(false);
  const [user,setUser]=useState({
    isSignedIn:false,
    name:'',
    email:'',
    password:'',
    photo:'',
    error:'',
    success: false,
  })

  const handleSubmit=(e)=>{
      if(newUser && user.email && user.password){
        firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
        .then((res) => {
          const newUserInfo={...user};
          newUserInfo.error="";
          newUserInfo.success=true;
          setUser(newUserInfo);
          updateUser(user.name);
          console.log("success");
          // ...
        })
        .catch((error) => {
          const newUserInfo={...user};
          newUserInfo.error=error.message;
          newUserInfo.success=false;
          setUser(newUserInfo);
          console.log("failed");
          // ..
        });
      }else{
        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
        .then(res => {
          const newUserInfo={...user};
          newUserInfo.error="";
          newUserInfo.success=true;
          setUser(newUserInfo);
          console.log(res);
        })
        .catch((error) => {
          const newUserInfo={...user};
          newUserInfo.error=error.message;
          newUserInfo.success=false;
          setUser(newUserInfo);
          console.log("failed");
        });
      }
      e.preventDefault();
  }
  const handleBlur=(event)=>{
      let isFieldValid=true;
      if(event.target.name==='email'){
         isFieldValid=/\S+@\S+\.\S+/.test(event.target.value);
      }
      if(event.target.name==='password'){
        isFieldValid= /^(?=.*\d)(?=.*[a-zA-Z])[a-zA-Z0-9]{8,}$/.test(event.target.value);
      }
      if(isFieldValid){
        const newUserInfo={...user};
        newUserInfo[event.target.name]=event.target.value;
        setUser(newUserInfo);
      }
      console.log(user);
      
  }

  const handleSignIn=()=>{
    firebase.auth()
  .signInWithPopup(googleProvider)
  .then(result=>{
    const {displayName,email,photoURL}=result.user;
    const signedInUser={
      isSignedIn: true,
      name: displayName,
      email: email,
      photo: photoURL
    }
    setUser(signedInUser);
  })
  .catch(err=>{
    console.log(err);
    console.log(err.message);
  })
  }

  const handleSignOut=()=>{
    
    firebase.auth().signOut().then(() => {
      const signedOutUser={
        isSignedIn:false,
        name:'',
        email:'',
        photo:''
      }
      setUser(signedOutUser);
    }).catch((error) => {
      console.log(error)
    });
  }

  const updateUser=(name)=>{
    var user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name
    }).then(function() {
      console.log("User name updated successfully")
    }).catch(function(error) {
      console.log(error);
    });
  }

  const handleFbSignIn=()=>{
    firebase
  .auth()
  .signInWithPopup(facebookProvider)
  .then((result) => {
    /** @type {firebase.auth.OAuthCredential} */
    var credential = result.credential;

    // The signed-in user info.
    var user = result.user;
    console.log(result);
    // This gives you a Facebook Access Token. You can use it to access the Facebook API.
    var accessToken = credential.accessToken;

    // ...
  })
  .catch((error) => {
    // Handle Errors here.
    var errorCode = error.code;
    var errorMessage = error.message;
    // The email of the user's account used.
    var email = error.email;
    // The firebase.auth.AuthCredential type that was used.
    var credential = error.credential;

    // ...
  });
  }
  return (
    <div>
      <h1>Hello,World!</h1>
      {
        user.isSignedIn ?
        <button onClick={handleSignOut}>Sign Out</button> :
        <button onClick={handleSignIn}>Sign In</button>
      }
      <br/>
      <button onClick={handleFbSignIn}>Log in using facebook</button>
      {
        user.isSignedIn && 
        <div>
          <p>Welcome, {user.name}</p>
          <p>Email: {user.email}</p>
          <img src={user.photo} alt=""/>
        </div>
      }

      <h1>Our Authentication</h1>
      <input type="checkbox" onChange={()=>setNewUser(!newUser)} name="newUser" id=""/>
      <label htmlFor="newUser">New User For Sign Up</label>
      <form onSubmit={handleSubmit}>
      {
        newUser && <input name="name" type="text" onBlur={handleBlur} placeholder="Name"/> 
      }<br/>
      <input type="text" name="email" onBlur={handleBlur} placeholder="Email" required/> <br/>
      <input type="password" name="password" onBlur={handleBlur} placeholder="Password" required/> <br/>
      <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
      </form>
      {
        user.success ? <p style={{color:'green'}}>User {newUser ? 'created' : 'logged in'} successfully </p> : <p style={{color:'red'}}>{user.error}</p>
      }
      
    </div>
  );
}

export default App;
