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
    firebase
      .storage()
      .ref('fundraise')
      .child("/promote.jpg")
      .put(file)
      .getDownloadURL()
      .then(imgUrl => {
        console.log(imgUrl);
      })
      .catch(error => {
        console.error('Error updating promote picture:', error.message);
    });

}

const img = document.getElementById('img');

firebase
  .storage()
  .ref("fundraise")
  .child("/promote.jpg")
  .getDownloadURL()
  .then(imgUrl => {
    img.src = imgUrl;
  })
  .catch(error => {
    console.error('Error retrieving promote picture:', error.message);
  });