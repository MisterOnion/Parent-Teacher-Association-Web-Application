
// 🛑 Replace with your Firebase Config.  


// Firebase Config
var firebaseConfig = {
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
  firebase.initializeApp(firebaseConfig);
  
  
  
  // -------------------------------------
  // Upload Multiple Images
  // -------------------------------------
  
  function uploadMultipleImages(e) {
    let files = e.target.files;
  
    for (const file of files) {
      firebase
        .app()
        .storage()
        .ref('images')
        .child(file.name)
        .put(file);
    }
  }
  
  // -------------------------------------
  // Get All The Images
  // -------------------------------------
  function getAllImages() {
  
    firebase
      .storage()
      .ref('images')
      .listAll()
      .then(snap => {
        snap.items.forEach(itemRef => {
          itemRef.getDownloadURL().then(imgUrl => {
            console.log(imgUrl)
          });
        })
      })
  }
  // getAllImages()
  
  // -------------------------------------
  // Upload A Single Image
  // -------------------------------------
  
  function uploadImage(e) {
    let file = e.target.files[0];
  
    firebase
      .app()
      .storage()
      .ref('images')
      .child(file.name)
      .put(file);
  }
  
  
  // -------------------------------------
  // Get An Image
  // -------------------------------------
  function getAnImage() {
  
    firebase
      .storage()
      .ref('images')
      .child(yourimagefilename)
      .getDownloadURL()
      .then(imgUrl => {
        console.log(imgUrl);
      });
  }
  
  // -------------------------------------
  // Upload Profile Picture With Authentication
  // -------------------------------------
  
  // DOM Elements
  const email = document.getElementById('email'),
    pword = document.getElementById('pword'),
    fileUploader = document.getElementById('fileUploader'),
    img = document.getElementById('img')
  
  // Data
  let file = {};
  
  // File Uploaded Change Event
  fileUploader.addEventListener('change', function (e) {
    file = e.target.files[0];
  })
  
  
  // Signup User
  function signUpUser() {
    firebase.auth().createUserWithEmailAndPassword(email.value, pword.value).then(auth => {
  
      // Upload A Profile Image to the Cloud Storage
      firebase
        .storage()
        .ref("users")
        .child(auth.user.uid + "/profile.jpg")
        .put(file);
  
    }).catch(error => {
      console.log(error.message)
    })
  }
  
  // Check to see if a user is logged in or not
  firebase.auth().onAuthStateChanged(user => {
  
    if (user) {
  
      // Get A Profile Image from the Cloud Storage
      firebase
        .storage()
        .ref("users")
        .child(user.uid + "/profile.jpg")
        .getDownloadURL()
        .then(imgUrl => {
          img.src = imgUrl;
        });
    }
  })