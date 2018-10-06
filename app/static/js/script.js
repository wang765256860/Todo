$(document).ready(function () {
    var ENTER_KEY = 13;
    var ESC_KEY = 27;

    $(window).bind("hashchange", function () {
        var hash = window.location.hash.replace('#', '');
        var url = null;
        if (hash === 'login') {
            url = login_page_url
        } else if (hash === 'app'){
            url = app_page_url
        } else {
            url = intro_page_url
        }

        $.ajax({
            type: 'GET',
            url: url,
            success: function (data) {
                $('#main').hide().html(data).fadeIn(800);
                activeM();
            }
        })
    })

    if (window.location.hash === '') {
        window.location.hash = '#intro'; // home page, show the default view
    } else {
        $(window).trigger('hashchange'); // user refreshed the browser, fire the appropriate function
    }

    $.ajaxSetup({
        beforeSend: function (xhr, settings) {
            if (!/^(GET|HEAD|OPTIONS|TRACE)$/i.test(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader('X-CSRFToken', csrf_token);
            }
        }
    });

    function display_dashboard() {
        var all_count = $('.item').length;
        if (all_count === 0) {
            $('#dashboard').hide();
        } else {
            $('#dashboard').show();
            $('ul.tabs').tabs();
        }
    }

    function activeM() {
        $('.sidenav').sidenav();
        $('ul.tabs').tabs();
        $('.modal').modal();
        $('.tooltipped').tooltip();
        $('.dropdown-trigger').dropdown({
                constrainWidth: false,
                coverTrigger: false
            }
        );
        display_dashboard();
    }

    function refresh_count() {
        var $items = $('.item');
        display_dashboard();
        var all_count = $items.length;
        var active_count = $items.filter(function () {
            return $(this).data('done') === false;
        }).length;
        var completed_count = $items.filter(function () {
            return $(this).data('done') === true;
        }).length;
        $('#all-count').html(all_count);
        $('#active-count').html(active_count);
        $('#completed-count').html(completed_count);
    }

    function register() {
        $.ajax({
            type: 'GET',
            url: register_url,
            success: function (data) {
                $('#username-input').val(data.username)
                $('#password-input').val(data.password)
                M.toast({html: data.message})
            }
        })
    }
    $(document).on('click', '#register-btn', register)

    function toggle_password() {
        var password_input = document.getElementById('password-input');
        if (password_input.type === 'password') {
            password_input.type = 'text';
        } else {
            password_input.type = 'password';
        }
    }

    $(document).on('click', '#toggle-password', toggle_password);

    function login_user() {
        var username = $('#username-input').val();
        var password = $('#password-input').val();
        if (!username || !password) {
            M.toast({html: login_error_message});
            return;
        }

        var data = {
            'username': username,
            'password': password
        };
        $.ajax({
            type: 'POST',
            url: login_url,
            data: JSON.stringify(data),
            contentType: 'application/json;charset=UTF-8',
            success: function (data) {
                if (window.location.hash === '#app' || window.location.hash === 'app') {
                    $(window).trigger('hashchange');
                } else {
                    window.location.hash = '#app';
                }
                activeM();
                M.toast({html: data.message});
            }
        });
    };

    $('.login-input').on('keyup', function (e) {
        if (e.which === ENTER_KEY) {
            login_user();
        }
    })
    $(document).on('click', '#login-btn', login_user)

    $(document).on('click', '#logout-btn', function () {
        $.ajax({
            type: 'GET',
            url: logout_url,
            success: function (data) {
                window.location.hash = "#intro";
                activeM();
                M.toast({html: data.message})
            }
        })
    })

    function new_item(e) {
        var $input = $('#item-input');
        var value = $input.val().trim();
        if (e.which !== ENTER_KEY || !value) {
            return;
        }
        $input.focus().val('');
        $.ajax({
            type: 'POST',
            url: new_item_url,
            data: JSON.stringify({'body': value}),
            contentType: 'application/json;charset=utf-8',
            success: function (data) {
                M.toast({html: data.message, classes: 'rounded'});
                $('.items').append(data.html);
                activeM();
                refresh_count();
            }
        })
    }

    $(document).on('keyup', '#item-input', new_item.bind(this));

    $(document).on('mouseenter', '.item', function () {
        $(this).find('.edit-btns').removeClass('hide');
    }).on('mouseleave', '.item', function () {
        $(this).find('.edit-btns').addClass('hide');
    })

    $(document).on('click', '#active-item', function () {
        var $items = $('.item');
        var $input = $('#item-input');

        $input.focus();
        $items.show();
        $items.filter(function () {
            return $(this).data('done');
        }).hide();
    })

    $(document).on('click', '#completed-item', function () {
        var $items = $('.item');
        var $input = $('#item-input');

        $input.focus();
        $items.show();
        $items.filter(function () {
            return !$(this).data('done');
        }).hide();
    })

    $(document).on('click', '#all-item', function () {
        var $items = $('.item');
        var $input = $('#item-input');

        $input.focus();
        $items.show();
    })

    $(document).on('click', '#clear-btn', function () {
        var $input = $('#item-input');
        var $items = $('.item');

        $input.focus();
        $.ajax({
            type: 'DELETE',
            url: clear_item_url,
            success: function (data) {
                $items.filter(function () {
                    return $(this).data('done');
                }).remove();
                M.toast({html: data.message, classes: 'rounded'});
                refresh_count();
            }
        })
    })

    $(document).on('click', '.done-btn', function () {
        var $input = $('#item-input');

        $input.focus();
        var $item = $(this).parent().parent();
        var $this = $(this);

        if ($item.data('done')) {
            $.ajax({
                type: 'PATCH',
                url: $this.data('href'),
                success: function (data) {
                    $this.next().removeClass('inactive-item');
                    $this.next().addClass('active-item');
                    $this.find('i').text('check_box_outline_blank');
                    $item.data('done', false);
                    M.toast({html: data.message});
                    refresh_count();
                }
            })
        } else {
            $.ajax({
                type: 'PATCH',
                url: $this.data('href'),
                success: function (data) {
                    $this.next().removeClass('active-item');
                    $this.next().addClass('inactive-item');
                    $this.find('i').text('check_box');
                    $item.data('done', true);
                    M.toast({html: data.message});
                    refresh_count();
                }
            })
        }
    })

    function remove_edit_input() {
        var $edit_input = $('#edit-item-input');
        var $input = $('#item-input');
        $edit_input.parent().prev().show();
        $edit_input.parent().remove();
        $input.focus();
    }

    $(document).on('click', '.edit-btn', function () {
        var $item = $(this).parent().parent();
        var item_id = $item.data('id');
        var item_body = $('#body' + item_id).text();
        $item.hide();
        $item.after('\
                <div class="row card-panel hoverable">\
                <input class="validate" id="edit-item-input" type="text" value="' + item_body + '"\
                autocomplete="off" autofocus required> \
                </div> \
            ');
        var $edit_input = $('#edit-item-input');
        var strLength = $edit_input.val().length * 2;
        $edit_input.focus();
        $edit_input[0].setSelectionRange(strLength, strLength);

        $(document).on('keydown', function (e) {
            if (e.which === ESC_KEY) {
                remove_edit_input();
            }
        })

        $edit_input.on('focusout', function () {
            remove_edit_input();
        })
    })

    function edit_item(e) {
        var $edit_input = $('#edit-item-input');
        var value = $edit_input.val().trim();
        if (e.which !== ENTER_KEY || !value) {
            return;
        }
        $edit_input.val('');

        if (!value) {
            M.toast({html: empty_body_error_message});
            return;
        }
        var url = $edit_input.parent().prev().data('href');
        var id = $edit_input.parent().prev().data('id');

        $.ajax({
            type: 'PUT',
            url: url,
            data: JSON.stringify({'body': value}),
            contentType: 'application/json;charset=utf-8',
            success: function (data) {
                $('#body' + id).html(value);
                $edit_input.parent().prev().data('body', value);
                remove_edit_input();
                M.toast({html: data.message});
            }
        })
    }

    $(document).on('keyup', '#edit-item-input', edit_item.bind(this));

    $(document).on('click', '.delete-btn', function () {
        var $input = $('#item-input');
        var $item = $(this).parent().parent();

        $input.focus();
        $.ajax({
            type: 'DELETE',
            url: $(this).data('href'),
            success: function (data) {
                $item.remove();
                activeM();
                refresh_count();
                M.toast({html: data.message});
            }
        })
    })

    activeM();
})