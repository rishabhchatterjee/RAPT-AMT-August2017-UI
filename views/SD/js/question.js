firebase.initializeApp(config);

var currId;
var loggedIn = firebase.database().ref(strategyName + '/loggedIn');
var isLoggedIn = false;
var section;

$(document).ready(function() {

    var a = location.href;
    //currId = a.substring(a.indexOf("?")+1);
    currId = a.substring(a.lastIndexOf("?")+1, a.lastIndexOf("~"));
    section  = a.substring(a.lastIndexOf("~")+1);

    loggedIn.once("value").then(function(snapshot) {
        snapshot.forEach(function(child) {
            if (child.val() == currId) {
                isLoggedIn = true;
            }
        });

        if (isLoggedIn == false) {
            console.log("Not logged in");
            window.open("http://localhost:8000/" + strategyName, "_self");
        }
    });
});


var pressedSubmit = false;


window.onbeforeunload = function(){
    loggedIn.once("value").then(function(snapshot) {
        snapshot.forEach(function(child) {
            if (child.val() == currId) {
                if (pressedSubmit == false) {
                    child.ref.remove();
                }
            }
        });
    });
    return null;
};

function submit() {
    if (isLoggedIn == false) {
        Materialize.toast('You have not logged in through the main page', 4000);
        return;
    }

    firebase.database().ref(strategyName + '/correctAns').once('value').then(function(snapshot) {

        var points = 0;
        var arrayAns = snapshot.val();
        var answers = []

        for (var i = 0; i < arrayAns.length; i++) {

            var selfD = $('input[id="test' + ((i*2) + 1).toString() + '"]:checked').val();
            var nonSelfD = $('input[id="test' + ((i*2)+2).toString() + '"]:checked').val();
            if (selfD == null && nonSelfD == null) {
                Materialize.toast('Fill out all problems', 4000);
                return;
            }
            var ans = arrayAns[i];
            if ((ans == 1 && selfD == null) || (ans == 0 && nonSelfD == null)) {
                points++;
                answers.push('1');
            } else{
                answers.push('0');
            }
        }

        //passed
        if (points > arrayAns.length - 4) {
            var obj = {id: currId, blackListed: false, passed: true, numAttemptedHits: 1, numAttemptsQuiz: 1, score: points, answers: answers};
            firebase.database().ref('ids/' + currId).set(obj);
            pressedSubmit = true;
            if (points == 10) {
                window.open("http://" + hostName + ":8000/" + strategyName + "/start.html?" + currId + "~" + section, "_self");
            } else {
                window.open("http://" + hostName + ":8000/" + strategyName + "/quiz_corrections.html?" + currId + "~" + section, "_self");
            }
        } else {
            firebase.database().ref('ids/' + currId).once('value').then(function(snapshot) {
                var x = snapshot.val();
                var numQuizAtt;
                if (x == null) {
                    numQuizAtt = 1;
                } else {
                    numQuizAtt = 2;
                }
                if (numQuizAtt == 2) {
                    //Can't take the quiz anymore
                    if (x.numAttemptedHits == 2) {
                        //Blacklisted
                        x.blackListed = true;
                        firebase.database().ref(strategyName + '/ids/' + currId).set(x);
                    }
                    else {
                        x.numAttemptedHits = 2;
                        firebase.database().ref(strategyName + '/ids/' + currId).set(x);
                    }
                    loggedIn.once("value").then(function(snapshot) {
                        snapshot.forEach(function(child) {
                            if (child.val() == currId) {
                                child.ref.remove();
                                window.open("http://" + hostName + ":8000/" + strategyName, "_self");
                            }
                        });
                    });
                }
                else {
                    //First time taking quiz
                    var obj = {id: currId, blackListed: false, passed: false, numAttemptedHits: 1, numAttemptsQuiz: 2, score: points};
                    firebase.database().ref('ids/' + currId).set(obj);
                    Materialize.toast('You did not pass the quiz. You must get 7/10 or above', 4000);
                    Materialize.toast('You received ' + points + '/10', 4000);
                    //window.open("http://localhost:8000/question?" + currId, "_self");
                }
            });
        }
    });
}
