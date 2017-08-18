var config = {
    apiKey: "AIzaSyCUXswPNhS8Pele7XFA47n1eYPbLU-WNbI",
    authDomain: "mturk-firebase.firebaseapp.com",
    databaseURL: "https://mturk-firebase.firebaseio.com",
    projectId: "mturk-firebase",
    storageBucket: "mturk-firebase.appspot.com",
    messagingSenderId: "527291012254"
  };
firebase.initializeApp(config);

var currId;

var a = location.href;
var section;
if (a.indexOf("?") == -1) {
    section = "D5S1_1"
} else {
    section = a.substring(a.indexOf("?")+1);
}


function beginSession() {
    var id = $('#mTurkId').val();
    if (id == "") {
        return;
    }
    currId = id;

    firebase.database().ref('ids/' + id).once('value').then(function(snapshot) {
        var val = snapshot.val();
        if (val == null) {
            //Haven't completed the quiz
            firebase.database().ref('loggedIn').push(currId);
            window.open("http://localhost:8000/question?" + currId + "~" + section, "_self");
        } else {
            if (val.blackListed == true) {
                Materialize.toast('You have failed the quiz too many times.', 4000);
                return;
            } else {    
                firebase.database().ref('loggedIn').push(currId);
                if (val.passed == true) {
                    window.open("http://localhost:8000/start?" + currId + "~" + section, "_self");
                } else {
                    window.open("http://localhost:8000/question?" + currId + "~" + section, "_self");
                }
            }
        }

    });
}
