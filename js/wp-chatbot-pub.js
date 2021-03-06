(function($) {
/*
  $('.wp-chatbot-button').on('click', function() {

    var input = $('#wp-chatbot-input');
    var message = input.val();
    input.val('');

    $('.wp-chatbot-text').append('<span class="wp-chatbot-say-user">'+message+'</span>');

  	jQuery.ajax({
  		url : wp_chatbot.ajax_url,
  		type : 'post',
  		data : {
  			action : 'wp_chatbot_converse',
        message : message
  		},
  		success : function( response ) {
        response = JSON.parse(response);
  			$('.wp-chatbot-text').append('<span class="wp-chatbot-say-bot">'+response['response']+'</span>');;
  		}
  	});
  }) */

})( jQuery );


'use strict';
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError('Cannot call a class as a function');
    }
}

/**
 * Messenger
 *
 * Will hold the messenger functionality
 * On wrapper functions for private properties http://arjanvandergaag.nl/blog/javascript-class-pattern.html
 */
var Messenger = function () {

    function Messenger(element) {
        _classCallCheck(this, Messenger); // only create instance of class
        this.element = typeof element !== 'undefined' ? element : '#wp-chatbot-content'; // default content element

        // Private properties
        this.messageList = [];
        this.deletedList = [];
        this.me = 1;
        this.bot = 2;


        // Functions that will be replaced by other functions to e.g. add/delete in DOM.
        // http://stackoverflow.com/questions/21243790/is-it-possible-to-redefine-a-javascript-classs-method
        this.onRecieve = function (message) {
            return console.log('Recieved: ' + message.text);
        };
        this.onSend = function (message) {
            return console.log('Sent: ' + message.text);
        };
        this.onDelete = function (message) {
            return console.log('Deleted: ' + message.text);
        };

    }


    Messenger.prototype.send = function send() {
        var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        text = this.filter(text);
        if (this.validate(text)) {
            var message = {
                user: this.me,
                text: text,
                time: new Date().getTime()
            };
            this.messageList.push(message);
            this.onSend(message);
        }
    };
    Messenger.prototype.recieve = function recieve() {
        var text = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        text = this.filter(text);
        if (this.validate(text)) {
            var message = {
                user: this.bot,
                text: text,
                time: new Date().getTime()
            };
            this.messageList.push(message);
            this.onRecieve(message);
        }
    };
    Messenger.prototype.delete = function _delete(index) {
        index = index || this.messageLength - 1;
        var deleted = this.messageLength.pop();
        this.deletedList.push(deleted);
        this.onDelete(deleted);
    };
    Messenger.prototype.filter = function filter(input) {
        var output = input.replace('bad input', 'good output');
        return output;
    };
    Messenger.prototype.validate = function validate(input) {
        return !!input.length;
    };

    Messenger.prototype.buildMessage = function buildMessage(text, who) {
      return '<div class="message-wrapper ' + who + '">\n<div class="circle-wrapper animated bounceIn"></div>\n<div class="text-wrapper">'+ text + '</div>\n</div>';
    }

    return Messenger;
}();

jQuery(document).ready(function ( $ ) {
    var messenger = new Messenger();

    var $content = $('#wp-chatbot-content')
    var $input = $('#input');
    var $send = $('#send');

    function safeText(text) {
        //$content.find('.message-wrapper').last().find('.text-wrapper').text(text);
        return;
    }
    function animateText() {
        setTimeout(function () {
            $content.find('.message-wrapper').last().find('.text-wrapper').addClass('animated fadeIn');
        }, 350);
    }
    function scrollBottom() {
        $content.animate({ scrollTop: $($content).offset().top + $($content).outerHeight(true) }, {
            queue: false,
            duration: 'ease'
        });
    }
    function buildSent(message) {
        console.log('sending: ', message.text);
        $content.append(messenger.buildMessage(message.text, 'me'));
        safeText(message.text);
        animateText();
        scrollBottom();
    }
    function buildRecieved(message) {
        console.log('recieving: ', message.text);
        $content.append(messenger.buildMessage(message.text, 'bot'));
        safeText(message.text);
        animateText();
        scrollBottom();
    }
    function sendMessage() {
        var text = $input.val();

        // Only send it there is actual input
        if ( text == '' ) {
          console.log('No message');
          return;
        }

        messenger.send(text);
        $input.val('');

        jQuery.ajax({
          url : wp_chatbot.ajax_url,
          type : 'post',
          data : {
            action : 'wp_chatbot_converse',
            message : text
          },
          success : function( response ) {
            response = JSON.parse(response);
            for ( var i in response['response'] ) {
                messenger.recieve( response['response'][i] );
            }

          }
        });

        $input.focus();
    }

    // Callbacks
    messenger.onSend = buildSent;
    messenger.onRecieve = buildRecieved;

    $send.on('click', function (e) {
        sendMessage();
    });

    $input.on('keydown', function (e) {
        var key = e.which || e.keyCode;
        if (key === 13) {
            e.preventDefault();
            sendMessage();
        }
    });
});
