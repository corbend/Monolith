
$(function() {
    var theme = 'darkblue';
    var login_form = $("#login_form");

    login_form.jqxValidator({
        rules: [
            {
                input: "#username_field", action: 'keyup, blur', rule: 'required',
                message: "Требуется ввести имя пользователя!"},
            {
                input: "#password_field", action: 'keyup, blur', rule: 'required',
                message: "Требуется ввести пароль!"}
        ]
    });
    var un_field = $("#username_field");

    un_field.jqxInput({
        theme: theme, height: '30px'
    });
    un_field.val("");

    var ps_field = $("#password_field");
    ps_field.jqxInput({
        theme: theme, height: '30px'
    });
    ps_field.val("");

    var login_button = $("#login_submit");
    login_button.jqxButton({
        theme: theme, width: '100%', height: '40px'
    });

    login_button.on('click', function(e) {
        if (login_form.jqxValidator('validate')) {
            login_form.submit();
        }
    })
});