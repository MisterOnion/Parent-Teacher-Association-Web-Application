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

firebase.initializeApp(firebaseConfig);

const email = document.getElementById('email'),
pword = document.getElementById('pword'),
fileUploader = document.getElementById('fileUploader');

let file = {};

fileUploader.addEventListener('change', function (e) {
  file = e.target.files[0];
})

function updatePic() {
    const user = firebase.auth().currentUser;

    firebase
      .storage()
      .ref('users')
      .child(user.uid + "/profile.jpg")
      .put(file)
      .getDownloadURL()
      .then(imgUrl => {
        console.log(imgUrl);
      })
      .catch(error => {
        console.error('Error updating profile picture:', error.message);
    });

}

const img = document.getElementById('img');

firebase.auth().onAuthStateChanged(user => {
  if (user) {
    firebase
      .storage()
      .ref("users")
      .child(user.uid + "/profile.jpg")
      .getDownloadURL()
      .then(imgUrl => {
        img.src = imgUrl;
     
      });
    console.log(user)
  } 
})