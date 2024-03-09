import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
  } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  const firebaseConfig = {
    apiKey: "AIzaSyCoh4L_LEJipxyH8qToXwPnKMdTrH8ti84",
    authDomain: "pta-management-system.firebaseapp.com",
    databaseURL:
    "https://pta-management-system-default-rtdb.firebaseio.com",
    projectId: "pta-management-system",
    storageBucket: "pta-management-system.appspot.com",
    messagingSenderId: "1027180154630",
    appId: "1:1027180154630:web:6abcd486ac75387cf79887", 
    measurementId: "G-E3T30H2NEZ",
  };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth()

  var email = document.getElementById("email");
  var password = document.getElementById("password");
  var con_password = document.getElementById("con_password");

  window.signup = function (e) {
    if (password){
        if(email.value == "" || password.value ==""){ 
            alert("All fields are required")
        }
        if(password.value == con_password.value){

        }else{
            alert("Password confirmation is wrong")
            return false
        }
    }

    e.preventDefault();
    var obj = {
        email: email.value,
        password: password.value,
    };

    createUserWithEmailAndPassword(auth, obj.email, obj.password)
    .then(function(success){
      window.location.replace('../index.html')
      alert("Email signed up successfully")
    })
    .catch(function(err){
      alert("Error in " + err)
    });
    console.log()
    console.log(obj);
};

 


