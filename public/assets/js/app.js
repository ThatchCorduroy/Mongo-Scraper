$(document).on("click", ".commentsubmit", function() {
    event.preventDefault();
    var thisId = $(this).attr("data-id");
    console.log("#" + thisId + "_input");
    console.log($("#" + thisId).val());
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/headlines/" + thisId,
      data: {
        // Value taken from title input
        //_id: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#" + thisId).val()
      }
    })
      // With that done
      .then(function(data) {

        $inputbox = $(".inputbox").attr("data-id", thisId)
        $commentbox = $(".comments").attr("data-id", thisId)

        // Log the response
        //console.log(data);
        // Empty the notes section
        $commentbox.append("<p>" + $("#" + thisId).val() + "</p>");
        $inputbox.val("");
      });
  
    // Also, remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });
