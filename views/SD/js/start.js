firebase.initializeApp(config);

var currId;

var a = location.href;
//document.write(a);

var section;
if (a.indexOf("?") == -1) {
    section = strategyName + "_1";
} else {
    section = a.substring(a.indexOf("?")+1);
}

//document.write(section);

function beginSession() {
    var id = $('#mTurkId').val();
    if (id == "") {
        return;
    }
    currId = id;

    firebase.database().ref(strategyName + '/ids/' + id).once('value').then(function(snapshot) {
        var val = snapshot.val();
        if (val == null) {
            //Haven't completed the quiz
            firebase.database().ref(strategyName + '/loggedIn').push(currId);
            window.open("http://" + hostName + ":8000/" + strategyName + "/question.html?" + currId + "~" + section, "_self");
        } else {
            if (val.blackListed == true) {
                Materialize.toast('You have failed the quiz too many times.', 4000);
                return;
            } else {
                firebase.database().ref(strategyName + '/loggedIn').push(currId);
                if (val.passed == true) {
                    window.open("http://" + hostName + ":8000/" + strategyName + "/start.html?" + currId + "~" + section, "_self");
                } else {
                    window.open("http://" + hostName + ":8000/" + strategyName + "/question.html?" + currId + "~" + section, "_self");
                }
            }
        }

    });
}
