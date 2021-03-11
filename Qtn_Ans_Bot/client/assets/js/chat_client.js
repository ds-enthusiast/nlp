var websocket;
var websocket_url = "ws://localhost:8765";
var current_connection_id = 0;

function verifyConnection() {
  if (websocket.readyState == 1) {
    $('.connection_message').remove();
  } else {
    if ($('.connection_message').length == 0)
      $('.chatbot_client_container').append('<div class="connection_message">Waiting for server connection...</div>');
    if (websocket.readyState == 3)
      initWebSocket();
  }
}

function initWebSocket() {
   websocket = new WebSocket(websocket_url);
   websocket.onmessage = function (event) {
       data = JSON.parse(event.data);
       $('#bot_waiting').remove();
       if (data.type == "connection_id") {
         if (current_connection_id == 0) {
           current_connection_id = data.connection_id;
           websocket.send(JSON.stringify({
             type: 'connection_id',
             connection_id: current_connection_id
           }));
         } else {
           websocket.send(JSON.stringify({
             type: 'connection_id',
             connection_id: current_connection_id
           }));
           current_connection_id = data.connection_id;
         }
       }
       else if (data.type == "first_message") {
         $('.bot_message').remove();
         $('.user_message').remove();
         $('.chatbot_client_container').append('<div class="bot_message"><div>'+data.message+'</div></div>');
       }
       else if (data.type == "list_options") {
         $('.chatbot_client_container').append('<div class="bot_message"><div>'+data.message+'</div></div>');
         options_html = "";
         for (var i=0; i<data.options.length; i++) {
           options_html += '<div class="food_option">'
            +'<h2>'+data.options[i]['name']+' <span>'+data.options[i]['price']+'$</span></h2>'
            +'<img src="assets/images/food_images/'+data.options[i]['id']+'.jpg" />'
            +'</div>';
         }
         $('.chatbot_client_container').append('<div class="bot_message"><div>'+options_html+'</div></div>');
         scrollContainer();
       } else {
        //  alert('else')
         $('.chatbot_client_container').append('<div class="bot_message"><div>'+data.message+'</div></div>');
         scrollContainer();
       }

   };
}

function scrollContainer() {
  var s = $('.chatbot_client_container')[0].scrollHeight;
  $('.chatbot_client_container').animate({scrollTop:s}, '1000');
}

function initChat() {
  $('#chatbot_client').html(
    '<div class="chatbot_client_header">Question Answer Bot</div>'
    +'<div class="chatbot_client_container">'
    +'</div>'
    +'<div class="chatbot_client_input">'
    +  '<input type="text" name="chatbot_client_input" placeholder="Type your question..." id="chatbot_client_input_text" />'
    +  '<button id="chatbot_client_input_button"></button>'
    +'</div>'
  );
  $('#chatbot_client_input_button').click(onSendMessage);
  $('#chatbot_client_input_text').keyup(onInputKeyUp);
}

function onInputKeyUp(e) {
  if (e.keyCode == 13) {
    onSendMessage();
  }
}

function onSendMessage() {
  var text = $('#chatbot_client_input_text').val();
  // alert(text)
  $('#chatbot_client_input_text').val('');
  if (websocket.readyState == 1) {
    websocket.send(JSON.stringify({
      type: 'text',
      message: text
    }));
    $('.chatbot_client_container').append('<div class="user_message"><div>'+text+'</div></div>');
    $('.chatbot_client_container').append('<div class="bot_message" id="bot_waiting"><div>...</div></div>');
    scrollContainer();
  }
}

window.onload = function() {
  initChat();
  initWebSocket();
  window.setInterval(verifyConnection, 1000);
}
