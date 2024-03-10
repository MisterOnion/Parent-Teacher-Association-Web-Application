import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-analytics.js";
import { getDatabase, ref, child, push, set, onValue, onChildAdded, get, remove, update, onChildChanged, onChildRemoved } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";
import {
    getAuth,
    signOut,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    EmailAuthProvider, 
    reauthenticateWithCredential,
    updatePassword,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCKqvYg-2DRnsn5phvpujXl4anpo0Gqud4",
  authDomain: "pta-webapp.firebaseapp.com",
  databaseURL: "https://pta-webapp-default-rtdb.firebaseio.com",
  projectId: "pta-webapp",
  storageBucket: "pta-webapp.appspot.com",
  messagingSenderId: "489016784631",
  appId: "1:489016784631:web:677206f8a16f86262585f2"
};

// Initialize Firebase
// Unread variables for future use
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getDatabase(app);

let user = null;

export async function setUser(user_id) { 
    const dbref = ref(db); 

    await get(child(dbref, "Users/" + user_id))
        .then((snapshot) => {
            user = {
                type: snapshot.val().Type
            };
        })
        .catch((error) => {
            alert(error);
        });
}

export async function getUser(user_id) {
    const dbref = ref(db);
  
    await get(child(dbref, "Users/" + user_id))
      .then((snapshot) => {
        user = {
          name: snapshot.val().Name,
          phoneNum: snapshot.val().PhoneNum,
          email: snapshot.val().Email,
          PTAEmail: snapshot.val().PTAEmail,
          passw: snapshot.val().Passw,
          spouses: snapshot.val().Spouses,
          children: snapshot.val().Children,
          type: snapshot.val().Type
        };
      })
      .catch((error) => {
        alert(error);
      }); 
    
      return user;
  }




let updateBtn = null;
let addChildrenBtn = null;
let removeChildrenBtn = null;
let addSpouseBtn = null;
let removeSpouseBtn = null;

let email_input = null;
let phoneNum_input = null;
let passw_input = null;
let spouses_input = null;
let children_input = null;

let spouse_display = null;
let children_display = null;

let children_label = null;
let spouses_label = null;

let spouses = [];
let children = [];


export async function hideSpouseChildrenInput(user_id) {
    let str_type = await getUserType(user_id);

    if (str_type !== "Parent") {
        spouse_display.innerHTML = "";
        children_display.innerHTML = "";

        spouses_input.value = "";
        children_input.value = "";

        //make all spouse children input, buttons, labels, display invisible
        spouses_input.style.display = "none";
        children_input.style.display = "none";

        addChildrenBtn.style.display = "none";
        removeChildrenBtn.style.display = "none";
        addSpouseBtn.style.display = "none";
        removeSpouseBtn.style.display = "none";

        spouse_display.style.display = "none";
        children_display.style.display = "none";

        children_label.style.display = "none";
        spouses_label.style.display = "none";
    }
}

export function setUpdateBtnId(htmlElementId, user_id) {
    updateBtn = document.querySelector("#".concat(htmlElementId));
    updateBtn.addEventListener("click", () => updateProfile(user_id));
}

export function setAddChildrenBtn(htmlElementId) {
    addChildrenBtn = document.querySelector("#".concat(htmlElementId));
    addChildrenBtn.addEventListener("click", () => addChildren());
}

export function setRemoveChildrenBtn(htmlElementId) {
    removeChildrenBtn = document.querySelector("#".concat(htmlElementId));
    removeChildrenBtn.addEventListener("click", () => removeChildren());
}

export function setAddSpouseBtn(htmlElementId) {
    addSpouseBtn = document.querySelector("#".concat(htmlElementId));
    addSpouseBtn.addEventListener("click", () => addSpouse());
}

export function setRemoveSpouseBtn(htmlElementId) {
    removeSpouseBtn = document.querySelector("#".concat(htmlElementId));
    removeSpouseBtn.addEventListener("click", () => removeSpouse());
}

export function setSpouses_display(htmlElementId) {
    spouse_display = document.getElementById(htmlElementId);
}

export function setChildren_display(htmlElementId) {
    children_display = document.getElementById(htmlElementId);
}

export async function insertDefaultUserDataToInput(user_id) {
    const dbref = ref(db);

    try {
        const snapshot = await get(child(dbref, "Users/" + user_id));
        if (snapshot.exists()) {
            email_input.defaultValue = snapshot.val().Email;
            phoneNum_input.defaultValue = snapshot.val().PhoneNum;
            passw_input.defaultValue = snapshot.val().Passw;

            // turn spouses from string to array and display them
            if (await getUserType(user_id) === "Parent") {
                spouses = snapshot.val().Spouses;
                children = snapshot.val().Children;

                spouses = spouses.split(", ");
                spouse_display.innerHTML = spouses.toString().replaceAll(/,/g, ", ");

                children = children.split(", ");
                children_display.innerHTML = children.toString().replaceAll(/,/g, ", ");
            }

        } else {
            alert("User doesen't exists.")
        }
    }
    catch (error) {
        alert(error);
    }
}

export function setSpouses_label(htmlElementId) {
    spouses_label = document.querySelector("#".concat(htmlElementId));
}

export function setChildren_label(htmlElementId) {
    children_label = document.querySelector("#".concat(htmlElementId));
}

export function setSpouses_inputId(htmlElementId) {
    spouses_input = document.querySelector("#".concat(htmlElementId));
}

export function setChildren_inputId(htmlElementId) {
    children_input = document.querySelector("#".concat(htmlElementId));
}

export function setEmail_inputId(htmlElementId) {
    email_input = document.querySelector("#".concat(htmlElementId));
}

export function setPhoneNum_inputId(htmlElementId) {
    phoneNum_input = document.querySelector("#".concat(htmlElementId));
}

export function setPassw_inputId(htmlElementId) {
    passw_input = document.querySelector("#".concat(htmlElementId));
}

export async function getUserType(user_id) {
    const dbref = ref(db);
    let user_type = null;

    try {
        const snapshot = await get(child(dbref, "Users/" + user_id));
        if (snapshot.exists()) {
            user_type = snapshot.val().Type;
        }
    } catch (error) {
        alert(error);
    }
    return user_type;
}

async function getPTAEmail(user_id) {
    const dbref = ref(db);
    let email = null;

    try {
        const snapshot = await get(child(dbref, "Users/" + user_id));
        if (snapshot.exists()) {
            email = snapshot.val().PTAEmail;
        }
    } catch (error) {
        alert(error);
    }
    return email;
}

async function getPassword(user_id) {
    const dbref = ref(db);
    let passw = null;

    try {
        const snapshot = await get(child(dbref, "Users/" + user_id));
        if (snapshot.exists()) {
            passw = snapshot.val().Passw;
        }
    } catch (error) {
        alert(error);
    }
    return passw;
}

async function updateProfile(user_id) {
    // convert to string
    let str_email = email_input.value;
    let str_phoneNum = phoneNum_input.value;
    let str_passw = passw_input.value;

    //filter string
    let check_phoneNum = str_phoneNum.replaceAll(/-/g, "");

    // check validity
    if (str_email !== "" && str_phoneNum !== "" && str_passw !== "" &&
        str_passw.length > 5 && // valid  passw lenght or firebase auth rejects it
        /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/.test(str_email) && //valid email
        /^[0-9]*$/.test(check_phoneNum) && (str_phoneNum.split("-").length - 1) == 2) { //valid phone num

        let initial_passw = await getPassword(user_id);
        let PTA_auth_email = await getPTAEmail(user_id);
        console.log(initial_passw);
        console.log(PTA_auth_email);

        if (initial_passw !== str_passw) {
            await signInWithEmailAndPassword(auth, PTA_auth_email, initial_passw)
                .then(async function () {
                    const user = auth.currentUser;

                    await updatePassword(user, str_passw)
                        .then(() => {

                        })
                        .catch((error) => {
                            alert(error);
                        });

                    await update(ref(db, "Users/" + user_id), {
                        Email: str_email,
                        PhoneNum: str_phoneNum,
                        Passw: str_passw,
                    })
                        .then(() => {
                            updateSpouseChildren(user_id);
                            alert("Account details updated successfully");
                        })
                        .catch((error) => {
                            alert(error);
                        });
                    // refresh page
                    window.location.reload();
                })
                .catch((error) => {
                    alert(error);
                });
        } else {
            await update(ref(db, "Users/" + user_id), {
                Email: str_email,
                PhoneNum: str_phoneNum,
            })
                .then(() => {
                    updateSpouseChildren(user_id);
                    alert("Account details updated successfully");
                })
                .catch((error) => {
                    alert(error);
                });
            // refresh page
            window.location.reload();
        }
    }
    else {
        alert("Account contains invalid data." +
            "\nPlease ensure account details entered properly." +
            "\nThere should be at least 6 characters in your password.")
    }
}

async function updateSpouseChildren(user_id) {
    let user_type = await getUserType(user_id);
    if (user_type === "Parent") {
        children = children.toString().replaceAll(/,/g, ", ");
        spouses = spouses.toString().replaceAll(/,/g, ", ");

        await update(ref(db, "Users/" + user_id), {
            Spouses: spouses,
            Children: children,
        })
            .then(() => {

            })
            .catch((error) => {
                alert(error);
            });
    }
}

function addChildren() {
    let check_children = children_input.value.replaceAll(/ /g, "");
    let str_children = children_input.value.trimEnd();
    if (/^[a-zA-Z]+$/.test(check_children)) {
        if (children[0] === "" || spouses.length < 1) { // no children
            children[0] = str_children;
            children_display.innerHTML = children.toString();
        }
        else if (!children.includes(str_children)) {
            children.push(str_children);
            children_display.innerHTML = children.toString().replaceAll(/,/g, ", ");
        }
    }
    else {
        alert("Invalid children name input.\nPlease ensure there are only letters.")
    }
}

function removeChildren() {
    let check_children = children_input.value.replaceAll(/ /g, "");
    let str_children = children_input.value.trimEnd();
    if (/^[a-zA-Z]+$/.test(check_children)) {
        for (let i = children.length - 1; i >= 0; i--) {
            if (children[i] === str_children) {
                children.splice(i, 1);
                children_display.innerHTML = children.toString().replaceAll(/,/g, ", ");
            }
        }
    } else {
        alert("Invalid children name input.\nPlease ensure there are only letters.")
    }
}

function addSpouse() {
    let check_spouses = spouses_input.value.replaceAll(/ /g, "");
    let str_spouse = spouses_input.value.trimEnd();
    if (/^[a-zA-Z]+$/.test(check_spouses)) {
        if (spouses[0] === "" || spouses.length < 1) { // no spouse
            spouses[0] = str_spouse;
            spouse_display.innerHTML = spouses.toString();
        }
        else if (!spouses.includes(str_spouse)) {
            spouses.push(str_spouse);
            spouse_display.innerHTML = spouses.toString().replaceAll(/,/g, ", ");
        }
    } else {
        alert("Invalid spouse name input.\nPlease ensure there are only letters.")
    }
}

function removeSpouse() {
    let check_spouses = spouses_input.value.replaceAll(/ /g, "");
    let str_spouse = spouses_input.value.trimEnd();
    if (/^[a-zA-Z]+$/.test(check_spouses)) {
        for (let i = spouses.length; i >= 0; i--) {
            if (spouses[i] === str_spouse) {
                spouses.splice(i, 1);
                spouse_display.innerHTML = spouses.toString().replaceAll(/,/g, ", ");
            }
        }
    } else {
        alert("Invalid spouse name input.\nPlease ensure there are only letters.")
    }
}

