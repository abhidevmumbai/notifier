'use strict';

var notify = {
    opts: {},
    notifications: {},
    markup: {
        notifyListItem: '<li class="notify-item"></li>',
        bubble: '<span class="counter">0</span>'
    },

    init: function(opts) {
        this.opts = opts;
        var localNotifications = JSON.parse(localStorage.getItem('notifications'));

        if (localNotifications) {
            for (var key in localNotifications) {
                this.opts.anchors.push(key);
            }
        } else {
            var anchorsLength = opts.anchors.length;
            if (anchorsLength) {
                for (var i=0; i<anchorsLength; i++) {
                    this.setBubble(opts.anchors[i]);
                }
            }
        }


        this.bindEvents();
    },

    sendMsg: function(category, icon, msg) {
        console.log('msg sent to: '+ category);
        var bubble = $('#' + category).find('.counter'),
            count = parseInt(bubble.html()),
            item = {
                msg: msg,
                icon: icon
            };

        if(!this.notifications[category]) {
            this.createCategory(category);
        }
        this.notifications[category].count = ++count;
        bubble.html(count);
        this.notifications[category].msgs.push(item);

        if ($('#notify-wrapper:visible').length) {
            this.renderMsg(item);
        }

        this.updateStore();
    },

    clearAll: function(category) {

    },

    updateStore: function () {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    },

    setBubble: function (category) {
        var _this = this;
        $('#'+ category).append($(_this.markup.bubble));
        $('#'+ category +' .counter').bind('click', _this.bubbleClickHandler.bind(null, category));
    },

    bubbleClickHandler: function (category) {
        console.log('bubble clicked on '+ category);
        if ($('#notify-wrapper .notify-list').hasClass(category)) {
            $('#notify-wrapper').toggle();
        } else {
            $('#notify-wrapper').show();
        }
        notify.populate(category);
    },

    populate: function (category) {
        var notifyList = $('.notify-list');

        // Remove previously added category classes
        notifyList.removeClass(this.opts.anchors.join(' '));

        notifyList.addClass(category);
        notifyList.html('');

        // Loop through all the category specific notifications and render them
        for (var i=0, len=this.notifications[category].msgs.length; i<len; i++) {
            this.renderMsg( this.notifications[category].msgs[i]);
        }
    },

    bindEvents: function () {
        // Bind close notification container
        $('#notify-wrapper .close').bind('click', function () {
            $('#notify-wrapper').toggle();
        });
    },

    renderMsg: function (item) {
        var tmpl = '<li id="'+ new Date() +'">'
                + '<img src="'+ item.icon +'"/>'
                + '<span class="msg">'+ item.msg +'</span>'
                + '<span class="close">x</span>'
            '</li>';
        $('.notify-list').prepend(tmpl);
    },

    // Create notification categories
    createCategory: function (category) {
        this.notifications[category] = {};
        this.notifications[category].count = 0;
        this.notifications[category].msgs = [];
    }
};

notify.init({
    anchors: ['projects', 'tasks', 'messages']
});

notify.sendMsg('projects', '', 'Abhi commented on your photo');
notify.sendMsg('projects', '', 'Ashu commented on your photo');
notify.sendMsg('projects', '', 'Joe commented on your photo');
notify.sendMsg('projects', '', 'Jim commented on your photo');
notify.sendMsg('tasks', '', 'Abhi assigned a task');
notify.sendMsg('messages', '', 'Abhi sent a msg to you');