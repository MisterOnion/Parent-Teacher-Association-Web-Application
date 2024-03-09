import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase ,ref , push ,set, onValue,onChildAdded,get,remove,update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
    getAuth, 
    signOut, 
    onAuthStateChanged,
  } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";
  import {getStorage, ref as storageRef, uploadBytes } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);


function setupProfile() {
    onAuthStateChanged(auth, (user) => {
        if(user) {
            const userId = user.uid;
            const email = user.email;
            document.getElementById('userId').textContent = userId;
            document.getElementById('email').textContent = email;

            const userRef = ref(database, 'User Profiles/' + userId);
            onValue(userRef, (snapshot) => {
                const profileData = snapshot.val();
                if(profileData) {
                    const role = profileData.role;
                    const displayName = profileData.displayName;
                    const contactNumber = profileData.contactNumber;
                    const numChildren = profileData.numChildren;
                    const childrenNames = profileData.childrenNames || [];
                    const spouseName = profileData.spouseName || '';
                    const address = profileData.address || '';


                    document.getElementById('role').textContent = role;
                    document.getElementById('displayName').textContent = displayName;
                    document.getElementById('contactNumber').textContent = contactNumber;
                    document.getElementById('numChildren').textContent = numChildren; 
                    document.getElementById('childrenNames').textContent = childrenNames;
                    document.getElementById('spouseName').textContent = spouseName;
                    document.getElementById('address').textContent = address;
                    
                }else{
                    alert.error('Please input profile data');
                }
            });
        }else{
            window.location.href = '../index.html';
        }
    });
}
setupProfile();

// Update profile function
const profileForm = document.getElementById('profileForm');
profileForm.addEventListener('submit', updateProfile);

function updateProfile(event) {
    event.preventDefault(); // prevent submitting blanks

    const newDisplayName = document.getElementById('inputDisplayName').value;
    const newRole = document.getElementById('inputRole').value;
    const newContactNumber = document.getElementById('inputContactNumber').value;
    const numChildren = parseInt(document.getElementById('inputNumChildren').value, 10) || 0;
    const newChildrenNames = document.getElementById('inputChildrenNames').value;
    const newinputSpouseName = document.getElementById('inputSpouseName').value;
    const newAddress = document.getElementById('inputAddress').value;

 

    // Push Profile data to Firebase
    onAuthStateChanged(auth, (user) => {
        if(user){
            const userId = user.uid;
            const profileData ={
                displayName: newDisplayName || undefined,
                role: newRole || undefined,
                contactNumber: newContactNumber || undefined,
                numChildren: numChildren,
                childrenNames: newChildrenNames || undefined,
                spouseName: newinputSpouseName || undefined,
                address: newAddress || undefined,
            };
            // null values cannot be accepted, retaining old data
            Object.keys(profileData).forEach(key => profileData[key] === undefined && delete profileData[key]);
            update(ref(database, 'User Profiles/' + userId), profileData)
            .then(() => {
                alert('Profile updated successfully');
            })
            .catch((error) => {
                console.error('Error updating profile:', error);
                alert('Error updating profile. Please try again.');
            });
        }
    });
}



window.logout = function (){
    signOut(auth) 
    .then(function () {
        alert("Logout successfully!");
        window.location.href = '../index.html';
    })
    .catch(function (err){
        alert("Logout Error: " + err)
        console.log(err)
    })
}

// Display adminContent for admin and teacher only 
// admin@gmail.com 
// uid = MwdLYJG5j9X60Y8OKL7HEILLRxF2
// teacher@gmail.com
// uid = Fer5nc96JCWIljQ8NZY42CcSCTN2

function checkAuthentication() {
    onAuthStateChanged(auth, function(user){
        if (user) {
            const uid = user.uid;
            const allowedUID_1= 'ETxtwxKyToNep7qliyeKjJAzHhl1';
            const allowedUID_2 = 'Fer5nc96JCWIljQ8NZY42CcSCTN2';
            console.log(uid);
            if (uid == allowedUID_1 || uid == allowedUID_2){
               adminContent.style.display = "block";
            }else{
               adminContent.style.display = "none";
            }
        }else{
            window.location.href = '../index.html';
            console.log("trouble staying auth while using website");
        }
    });
}

checkAuthentication();
