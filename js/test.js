var TestSuite = function() {
    var userCreate = function() {
        // fill values
        $("#signupName")[0].value = "beonit";
        $("#signupEmail")[0].value = "boenit@gmail.com";
        $("#signupPassword")[0].value = "password";
        $("#signupConfirm")[0].value = "password";
        // trigger event
        $("#menuSignup").trigger( "click" );
        $("#btnSignup").trigger( "click" );
    };

    var validateSignup = function() {
        // fill values
        $("#signupName")[0].value = "";
        $("#signupEmail")[0].value = "beonit@gmail.com";
        $("#signupPassword")[0].value = "password";
        $("#signupConfirm")[0].value = "password";
        // trigger event
        $("#menuSignup").trigger( "click" );
        $("#btnSignup").trigger( "click" );
    };

    var validateSignin = function() {
        // fill values
        $("#signinEmail")[0].value = "beonit@gmail";
        $("#signinPassword")[0].value = "password";
        // trigger event
        $("#menuSignin").trigger("click");
        $("#btnSignin").trigger("click");
    };

    var userSignin = function() {
        // fill values
        $("#signinEmail")[0].value = "beonit@gmail.com";
        $("#signinPassword")[0].value = "password";
        // trigger event
        $("#menuSignin").trigger("click");
        $("#btnSignin").trigger("click");
    };

    var unknownUserSignin = function() {
        // fill values
        $("#signinEmail")[0].value = "unknown@unknown.com";
        $("#signinPassword")[0].value = "password";
        // trigger event
        $("#menuSignin").trigger("click");
        $("#btnSignin").trigger("click");
    }

    var wrongPasswordSignin = function() {
        // fill values
        $("#signinEmail")[0].value = "beonit@gmail.com";
        $("#signinPassword")[0].value = "wrongpassword";
        // trigger event
        $("#menuSignin").trigger("click");
        $("#btnSignin").trigger("click");
    }

    var saveMapTest = function() {
        $("#btnMenuSave").trigger("click");
    }

    var loadMapTest = function() {
    }

    var loadListTest = function() {
        $("#btnMenuLoad").trigger("click");
    }

    return {
        userCreate : userCreate,
        validateSignup : validateSignup,
        validateSignin : validateSignin,
        userSignin : userSignin,
        unknownUserSignin : unknownUserSignin,
        wrongPasswordSignin : wrongPasswordSignin,
        saveMapTest : saveMapTest,
        loadMapTest : loadMapTest,
        loadListTest : loadListTest,
    }
}

var testTrigger = function() {
    var tests = TestSuite();
    // tests.validateSignup();
    // tests.userCreate();

    // signin
    // tests.validateSignin();
    // tests.userSignin();
    // tests.unknownUserSignin();
    // tests.wrongPasswordSignin();

    // test save load
    // tests.saveMapTest();
    // tests.loadListTest();
}

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', testTrigger, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', testTrigger);
}