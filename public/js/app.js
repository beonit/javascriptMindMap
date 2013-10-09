var appOnload = function() {
    var alertDelay = 2000;
    var confirmInputPassword = "#signupConfirm";

    var trim1 = function(str) {
        return str.replace(/^\s+/, '').replace(/\s+$/, '');
    };

    var validate = function(id, errMessage, validator) {
        var element = $(id);
        if(validator(element[0].value)) {
            element.popover("hide");
            return true;
        } else {
            var _popover;
            _popover = element.popover({
                trigger: "manual",
                placement: "bottom",
                content: errMessage,
                template: "<div class=\"popover\"><div class=\"arrow\"></div><div class=\"popover-inner\"><div class=\"popover-content\"><p></p></div></div></div>"
            });
            _popover.data("bs.popover").options.content = errMessage;
            element.popover("show");
            return false;
        }
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

    var errorMessage = function(str) {
        $(".alert").alert();
    };

    var successMessage = function(str) {
        $(".alert").alert();
    };

    $("#btnSignin").click(function(e) {
        $("#signinEmail")[0].value = trim1($("#signupEmail")[0].value);
        if(!validate("#signinEmail", "Email must be filled out"
                , validateEmpty) ||
            !validate("#signinPassword", "Password must be filled out"
                , validateEmpty)) {
            return;
        }

        // send message
        $.ajax( {
            url: '/users',
            data: $("#formSignin").serialize(),
            type: 'POST',
            success: function(resp) {
                if(resp.status) {
                    successMessage("id creation success");
                } else {
                    for(var i in resp.errors) {
                        errorMessage(resp.errors[i]);
                    }
                }
            }
        });
        $("#signinModal").modal('hide');
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
            !validate("#signupEmail", "Not a valid e-mail address"
                , validateEmail) ||
            !validate("#signupPassword", "Password must be same"
                , validateConfirm)) {
            return;
        }

        // send message
        $.ajax( {
            url: '/users',
            data: $("#formSignup").serialize(),
            type: 'POST',
            success: function(resp) {
                if(resp.status) {
                    successMessage("id creation success");
                    $("#signupModal").modal('hide');
                } else {
                    var msg = "";
                    for(var i in resp.errors) {
                        msg += resp.errors[i];
                    }
                    errorMessage(msg);
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