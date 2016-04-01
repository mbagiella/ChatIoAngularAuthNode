var app = angular.module('myChat',[]);
var socket = io();

app.controller('MainController',function($scope,$http,$window){
    this.messages = [];
    this.message = "";
    this.username = "";
    this.user = {name:"anonymous"};
    var self = this;

    init = function(){
        $http.get('api/message')
            .success(function(data){
                angular.forEach(data.msg, function(value) {
                    self.messages.push({msg:value.msg,type:value.type});
                });
            })
    };

    init();

    this.login = function(){
        $http.post('login/',{username:this.username},{headers: {'Content-Type': 'application/json'}})
            .success(function(data){
                $window.sessionStorage.accessToken = data.token;
                self.user = data.user;
            })
            .error(function(err){
                console.log({error:err})
            });
    };

    this.onSubmit= function(){
        socket.emit('chat',{msg:this.message,user_id:this.user._id});
        self.messages.push({msg:this.message,type:2});
        this.message = "";
    };
    socket.on('chat', function (msg) {
        $scope.$apply(function(){
            self.messages.push(msg);
        });
        self.goToBottom();
    });

    this.logout = function(){
        self.user = {name:"anonymous"};
    };

    this.goToBottom = function(){
        var wtf    = $('#list');
        var height = wtf[0].scrollHeight;
        console.log(height);
        wtf.scrollTop(height+1000);
    };

    this.getChatClass = function(type){
        return type == 0 ? 'text-center' : type == 1 ? '' : 'text-right' ;
    }
});