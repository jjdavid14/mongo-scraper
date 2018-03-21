$(document).ready(function(){

  // Nav Bar Mobile Slider
  $(".button-collapse").sideNav();

  // Click Listener for FORM SUBMISSION to ADD a comment
  $('.add-comment-button').on('click', function(event){
    event.preventDefault();
   
    // Get _id of comment to be deleted
    var articleId = $(this).data("id");
    // Get Form Data by Id
    var form = $('#form-add-' + articleId);

    // POST request to add Comment
    $.post("/add/comment/" + articleId, form.serialize(), function() {
      console.log("Adding comment to article id #" + articleId);
    })
    .done(function() {
      // Refresh the Window after the call is done
      location.reload();
    });
  });


  // Click Listener for FORM SUBMISSION to DELETE a comment
  $('.delete-comment-button').on('click', function(){
    event.preventDefault();
    // Get _id of comment to be deleted
    var commentId = $(this).data("id");

    // POST request to delete Comment
    $.post("/remove/comment/" + commentId, function() {
      console.log("Deleting comment with id #" + commentId);
    })
    .done(function() {
      // Refresh the Window after the call is done
      location.reload();
    });
  });
  
});