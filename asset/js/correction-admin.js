// Kept as long as pull request #1260 is not passed.
Omeka.correctionManageSelectedActions = function() {
    var selectedOptions = $('[value="update-selected"], [value="delete-selected"], #batch-form .batch-inputs .batch-selected');
    if ($('.batch-edit td input[type="checkbox"]:checked').length > 0) {
        selectedOptions.removeAttr('disabled');
    } else {
        selectedOptions.attr('disabled', true);
        $('.batch-actions-select').val('default');
        $('.batch-actions .active').removeClass('active');
        $('.batch-actions .default').addClass('active');
    }
};

(function($, window, document) {
    // Browse batch actions.
    $(function() {

        var batchSelect = $('#batch-form .batch-actions-select');
        batchSelect.append(
            $('<option class="batch-selected" disabled></option>').val('correction-selected').html(Omeka.jsTranslate('Prepare tokens to correct selected'))
        );
        batchSelect.append(
            $('<option></option>').val('correction-all').html(Omeka.jsTranslate('Prepare tokens to correct all'))
        );
        var batchActions = $('#batch-form .batch-actions');
        batchActions.append(
            $('<input type="submit" class="correction-selected" formaction="correction/create-token">').val(Omeka.jsTranslate('Go'))
        );
        batchActions.append(
            $('<input type="submit" class="correction-all" formaction="correction/create-token">').val(Omeka.jsTranslate('Go'))
        );
        var resourceType = window.location.pathname.split("/").pop();
        batchActions.append(
            $('<input type="hidden" name="resource_type">').val(resourceType)
        );

        // Kept as long as pull request #1260 is not passed.
        $('.select-all').change(function() {
            Omeka.correctionManageSelectedActions();
        });
        $('.batch-edit td input[type="checkbox"]').change(function() {
            Omeka.correctionManageSelectedActions();
        });

    });

}(window.jQuery, window, document));

$(document).ready(function() {

    var correctionInfo = function() {
        return `
            <div class="field">
                <h3>` + Omeka.jsTranslate('Correction options') + `</h3>
                <div class="option">
                    <label for="is-corrigible">
                        ` + Omeka.jsTranslate('Corrigible') + `
                        <input id="is-corrigible" type="checkbox">
                    </label>
                </div>
                <div class="option">
                    <label for="is-fillable">
                        ` + Omeka.jsTranslate('Fillable') + `
                        <input id="is-corrigible" type="checkbox">
                    </label>
                </div>
            </div>
        `;
    }
    $('#edit-sidebar .confirm-main').append(correctionInfo());

    // Manage the modal to create the token.
    // Get the modal.
    var modal = document.getElementById('create_correction_token_dialog');
    // Get the button that opens the modal.
    var btn = document.getElementById('create_correction_token_dialog_go');
    // Get the <span> element that closes the modal.
    var span = document.getElementById('create_correction_token_dialog_close');

    // When the user clicks the button, open the modal.
    if (btn) {
        btn.onclick = function() {
            var href = $('#create_correction_token a').attr('href');
            var email = $('#create_correction_token_dialog_email').val();
            if (email !== '' && !validateEmail(email)) {
                $('#create_correction_token_dialog_email').css('color', 'red');
                return;
            }
            href = href + '&email=' + email;
            location.href = href;
            modal.style.display = 'none';
        }
    }

    // When the user clicks on <span> (x), close the modal.
    if (span) {
        span.onclick = function() {
            modal.style.display = 'none';
        }
    }

    // TODO When the user clicks anywhere outside of the modal, close it.
    // window.onclick = function(event) {
    //     if (event.target == modal) {
    //         modal.style.display = 'none';
    //     }
    // }

    $('#create_correction_token').on('click', function(ev){
        modal.style.display = 'block';
        ev.preventDefault();
    })

    // Mark a correction reviewed/unreviewed.
    $('#content').on('click', '.correction a.status-toggle', function(e) {
        e.preventDefault();

        var button = $(this);
        var url = button.data('status-toggle-url');
        var status = button.data('status');
        $.ajax({
            url: url,
            beforeSend: function() {
                button.removeClass('o-icon-' + status).addClass('o-icon-transmit');
            }
        })
        .done(function(data) {
            if (!data.content) {
                alert(Omeka.jsTranslate('Something went wrong'));
            } else {
                var content = data.content;
                status = content.status;
                button.data('status', status);
                button.attr('title', content.statusLabel);
                button.attr('aria-label', content.statusLabel);
            }
        })
        .fail(function(jqXHR, textStatus) {
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                alert(jqXHR.responseJSON.message);
            } else {
                alert(Omeka.jsTranslate('Something went wrong'));
            }
        })
        .always(function () {
            button.removeClass('o-icon-transmit').addClass('o-icon-' + status);
        });
    });

    // Expire a token
    $('#content').on('click', '.correction a.expire-token', function(e) {
        e.preventDefault();

        var button = $(this);
        var url = button.data('expire-token-url');
        var status = 'expire';
        $.ajax({
            url: url,
            beforeSend: function() {
                button.removeClass('o-icon-expire-token').addClass('o-icon-transmit');
            }
        })
        .done(function(data) {
            if (!data.content) {
                alert(Omeka.jsTranslate('Something went wrong'));
            } else {
                var content = data.content;
                status = 'expired';
                button.attr('title', content.statusLabel);
                button.attr('aria-label', content.statusLabel);
            }
        })
        .fail(function(jqXHR, textStatus) {
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                alert(jqXHR.responseJSON.message);
            } else {
                alert(Omeka.jsTranslate('Something went wrong'));
            }
        })
        .always(function () {
            button.removeClass('o-icon-transmit').addClass('o-icon-' + status + '-token');
        });
    });

    // Validate all values of a correction.
    $('#content').on('click', '.correction a.validate', function(e) {
        e.preventDefault();

        var button = $(this);
        var url = button.data('validate-url');
        var status = button.data('status');
        $.ajax({
            url: url,
            beforeSend: function() {
                button.removeClass('o-icon-' + status).addClass('o-icon-transmit');
            }
        })
        .done(function(data) {
            if (!data.content) {
                alert(Omeka.jsTranslate('Something went wrong'));
            } else {
                // Set the correction reviewed in all cases.
                var content = data.content.reviewed;
                status = content.status;
                buttonReviewed = button.closest('th').find('a.status-toggle');
                buttonReviewed.data('status', status);
                buttonReviewed.addClass('o-icon-' + status);

                // Update the validate button.
                content = data.content;
                status = content.status;
                // button.attr('title', statusLabel);
                // button.attr('aria-label', statusLabel);

                // Reload the page to update the default show view.
                // TODO Dynamically update default show view after correction.
                location.reload();
            }
        })
        .fail(function(jqXHR, textStatus) {
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                alert(jqXHR.responseJSON.message);
            } else {
                alert(Omeka.jsTranslate('Something went wrong'));
            }
        })
        .always(function () {
            button.removeClass('o-icon-transmit').addClass('o-icon-' + status);
        });
    });

    // Validate a specific value of a correction.
    $('#content').on('click', '.correction a.validate-value', function(e) {
        e.preventDefault();

        var button = $(this);
        var url = button.data('validate-value-url');
        var status = button.data('status');
        $.ajax({
            url: url,
            beforeSend: function() {
                button.removeClass('o-icon-' + status).addClass('o-icon-transmit');
            }
        })
        .done(function(data) {
            if (!data.content) {
                alert(Omeka.jsTranslate('Something went wrong'));
            } else {
                // Update the validate button.
                var content = data.content;
                status = content.status;
                button.attr('title', content.statusLabel);
                button.attr('aria-label', content.statusLabel);
                // TODO Update the value in the main metadata tab.
            }
        })
        .fail(function(jqXHR, textStatus) {
            if (jqXHR.responseJSON && jqXHR.responseJSON.message) {
                alert(jqXHR.responseJSON.message);
            } else {
                alert(Omeka.jsTranslate('Something went wrong'));
            }
        })
        .always(function () {
            button.removeClass('o-icon-transmit').addClass('o-icon-' + status);
        });
    });

    // https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
    function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
    }
});
