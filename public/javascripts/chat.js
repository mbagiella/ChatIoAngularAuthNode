var app = angular.module('my-chat',[]);
var socket = io();
app.controller('MainController',function($scope){
    this.messages = [];
    this.message = "";
    var self = this;

    this.onSubmit= function(){
        socket.emit('chat',this.message);
        this.message = "";
    };
    socket.on('chat', function (msg) {
        $scope.$apply(function(){
            self.messages.push(msg);
        });
        self.goToBottom();
    });

    this.goToBottom = function(){
        var wtf    = $('#list');
        var height = wtf[0].scrollHeight;
        console.log(height);
        wtf.scrollTop(height+1000);
    }
});