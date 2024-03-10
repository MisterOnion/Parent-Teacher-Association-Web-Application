var firebaseConfig = {
  apiKey: "AIzaSyCKqvYg-2DRnsn5phvpujXl4anpo0Gqud4",
  authDomain: "pta-webapp.firebaseapp.com",
  databaseURL: "https://pta-webapp-default-rtdb.firebaseio.com",
  projectId: "pta-webapp",
  storageBucket: "pta-webapp.appspot.com",
  messagingSenderId: "489016784631",
  appId: "1:489016784631:web:677206f8a16f86262585f2"
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
      .then(snapshot => {
        return snapshot.ref.getDownloadURL();  
      })
      .then(imgUrl => {
        console.log(imgUrl);
        location.reload();
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