$(function () {
    var loading = $('#loadbar').hide();
    $(document)
        .ajaxStart(function () {
            loading.show();
        }).ajaxStop(function () {
            loading.hide();
        });

    // $("label.btn").on('click', function () {
    //     var choice = $(this).find('input:radio').val();
    //     $('#loadbar').show();
    //     $('#quiz').fadeOut();
    //     setTimeout(function () {
    //         $("#answer").html($(this).checking(choice));
    //         $('#quiz').show();
    //         $('#loadbar').fadeOut();
    //         /* something else */
    //     }, 1500);
    // });

    // $("#idQuestion1").on('click', function () {
    //     var iVariable = $('#iVariable').val();
    //     iVariable = parseInt(iVariable, 10);
    //     iVariable++;
    //     var questionSet = $('#questionSet').val();
    //     questionSet = parseInt(questionSet, 10);
    //     $('#loadbar').show();
    //     $('#quiz').fadeOut();
    //     setTimeout(function () {
    //         $("#iVariable").val(iVariable);
    //         // $('#id1').empty();
    //         // $('#id1').
    //         $.ajax({
    //             type: 'GET',
    //             url: 'http://localhost:3000/' + questionSet + '/' + iVariable,
    //             success: function (response) {
    //                 console.log(response.body);
    //             },
    //             error: function (xhr, status, err) {
    //                 console.log(xhr.responseText);
    //             }
    //         });
    //         $('#quiz').show();
    //         $('#loadbar').fadeOut();
    //         /* something else */
    //     }, 1500);
    // });

    $ans = 3;

    $.fn.checking = function (ck) {
        if (ck != $ans)
            return 'INCORRECT';
        else
            return 'CORRECT';
    };
});	
