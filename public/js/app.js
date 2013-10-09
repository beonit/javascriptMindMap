var appOnload = function() {
    var alertDelay = 2000;
    var confirmInputPassword = "#signupConfirm";

    var trim1 = function(str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    };

    var validate = function(id, errMessage, validator) {
        var element = $(id);
        if(validator(element[0].value)) {
            element.popover("destroy");
            return true;
        } else {
            showPopover(element, errMessage);
            return false;
        }
    }

    var showPopover = function(element, errMessage) {
        var _popover;
        _popover = element.popover({
            trigger: 'manual',
            placement: 'auto',
            content: errMessage,
        });
        element.popover("show");
    }

    var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    };

    var validateConfirm = function(password) {
        return password == $(confirmInputPassword)[0].value;
    }

    var validateEmpty = function(str) {
        return str.length > 0;
    }

    var errorHandler = function(errors) {
        for(var i in errors) {
            if(errors[i] === "Email already exists") {
                showPopover($("#signupEmail"), errors[i]);
            } else {
                alerts(errors[i]);
            }
        }
    }

    var loginFail = function(httpObj, textStatus) {
        if(httpObj.status == 401) {
            var _popover = $("#signinEmail").popover({
                trigger: 'manual',
                placement: 'top',
                title: "Login fail",
                content: "Confirm your email or password",
            });
            $("#signinEmail").popover("show");
            console.log(httpObj);
            console.log(textStatus);
        } else {
            alerts("error : " + httpObj.status);
        }
    }

    $("#btnSignin").click(function(e) {
        $("#signinEmail")[0].value = trim1($("#signinEmail")[0].value);
        if(!validate("#signinEmail", "Email must be filled out"
                , validateEmpty) ||
            !validate("#signinPassword", "Password must be filled out"
                , validateEmpty) ||
            !validate("#signinEmail", "Not a valid e-mail address"
                , validateEmail)) {
            return;
        }

        // send message
        $.ajax( {
            url: '/users/session',
            data: $("#formSignin").serialize(),
            type: 'POST',
            success: function(resp) {
                if(resp.status) {
                    console.log("login success as " + resp.user);
                    $("#signinModal").modal('hide');
                } else {
                    errorHandler(resp.errors);
                }
            },
            error: function(httpObj, textStatus) {
                var popoverObj = {
                    trigger: 'manual',
                    placement: 'top',
                    title: "Login fail",
                    content: "Confirm your email or password",
                };
                if(httpObj.status == 401) {
                    popoverObj.content = "Confirm your email or password";
                } else {
                    popoverObj.content = "Error : " + httpObj.status;
                }
                var _popover = $("#signinEmail").popover(popoverObj);
                $("#signinEmail").popover("show");
            },
        });
    });

    $("#btnSignup").click(function(e) {
        // trim email & name
        $("#signupName")[0].value = trim1($("#signupName")[0].value);
        $("#signupEmail")[0].value = trim1($("#signupEmail")[0].value);

        if(!validate("#signupName", "Name must be filled out"
                , validateEmpty) ||
            !validate("#signupEmail", "Email must be filled out"
                , validateEmpty) ||
            !validate("#signupPassword", "Password must be filled out"
                , validateEmpty) ||
            !validate("#signupConfirm", "Password confirm must be filled out"
                , validateEmpty) ||
            !validate("#signupPassword", "Password must be same"
                , validateConfirm) ||
            !validate("#signupEmail", "Not a valid e-mail address"
                , validateEmail)
            ) {
            console.log("validate fail");
            return;
        }

        // send message
        $.ajax( {
            url: '/users',
            data: $("#formSignup").serialize(),
            type: 'POST',
            success: function(resp) {
                if(resp.status) {
                    $("#signupModal").modal('hide');
                    $('#welcomeModal').on('hide.bs.modal', function () {
                        $("#signinModal").modal('show');
                    });
                    $("#welcomeModal").modal('show');
                } else {
                    errorHandler(resp.errors);
                }
            }
        });
    });
};

if (window.addEventListener) { // Mozilla, Netscape, Firefox
    window.addEventListener('load', appOnload, false);
} else if (window.attachEvent) { // IE
    window.attachEvent('onload', appOnload);
}