var TestSuite = function() {
    var userCreate = function testUserCreate() {
        // fill values
        $("#signupName")[0].value = "beonit";
        $("#signupEmail")[0].value = "test@gmail.com";
        $("#signupPassword")[0].value = "dmldyr";
        $("#signupConfirm")[0].value = "dmldyr";
        // trigger event
        $("#menuSignup").trigger( "click" );
        $("#btnSignup").trigger( "click" );
    };

    var validateSignup = function testUserCreate() {
        // fill values
        $("#signupName")[0].value = "";
        $("#signupEmail")[0].value = "test@gmail.com";
        $("#signupPassword")[0].value = "dmldyr";
        $("#signupConfirm")[0].value = "dmldyr";
        // trigger event
        $("#menuSignup").trigger( "click" );
        $("#btnSignup").trigger( "click" );
    };

    return {
        userCreate : userCreate,
        validateSignup : validateSignup,
    }
}

var testTrigger = function() {
    // var tests = TestSuite();
    // tests.validateSignup();
    // tests.userCreate();
}

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', testTrigger, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', testTrigger);
}