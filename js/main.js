'use strict';

var notify = {
    opts: {
        anchors: []
    },
    notifications: {},
    markup: {
        notifyListItem: '<li class="notify-item"></li>',
        bubble: '<span class="counter">0</span>'
    },

    init: function(opts) {
        var localNotifications = this.readStore(),
            anchorsLength = 0;

        // Set local notifications if any
        if (localNotifications) {
            this.notifications = localNotifications;
            for (var key in localNotifications) {
                this.opts.anchors.push(key);
            }
            // merging the local and config anchors
            $.merge(this.opts.anchors, opts.anchors);
        } else {
            this.opts.anchors = opts.anchors;
        }

        // Set bubble counters in each category anchors
        anchorsLength = this.opts.anchors.length;
        if (anchorsLength) {
            for (var i=0; i<anchorsLength; i++) {
                this.setBubble(opts.anchors[i]);
            }
        }

        this.bindEvents();
    },

    // Send notification
    sendMsg: function(category, icon, msg) {
        console.log('msg sent to: '+ category);
        // Create the category if it doesn't exist
        if(!this.notifications[category]) {
            this.createCategory(category);
        }

        var bubble = $('#' + category).find('.counter'),
            count = this.notifications[category]['unread'].count,
            item = {
                msg: msg,
                icon: icon
            };

        this.notifications[category]['unread'].count = ++count;
        bubble.html(count);
        this.notifications[category]['unread'].msgs.push(item);

        if ($('#notify-wrapper:visible').length) {
            this.renderMsg(item, 'unread');
        }

        this.writeStore();
    },

    clearAll: function(category) {

    },

    // Read local storage
    readStore: function () {
        console.log('Reading local store');
        var notifications = JSON.parse(localStorage.getItem('notifications'));
        return notifications;
    },

    // Write local storage
    writeStore: function () {
        console.log('Writing to local store');
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    },

    setBubble: function (category) {
        var _this = this;
        $('#'+ category).append($(_this.markup.bubble));
        $('#'+ category +' .counter').bind('click', _this.bubbleClickHandler.bind(null, category));
    },

    bubbleClickHandler: function (category) {
        var read = notify.notifications[category]['read'].msgs,
            unread = notify.notifications[category]['unread'].msgs;

        if ($('#notify-wrapper .notify-list').hasClass(category)) {
            $('#notify-wrapper').toggle();
        } else {
            $('#notify-wrapper').show();
        }
        $('#notify-wrapper .header').html(category + ' <span class="counter">'+ unread.length +'</span>');
        notify.populate(category);

        $('#'+ category +' .counter').html('0');
        read = read.concat(unread);
        console.log(read);
        console.log(unread);
        notify.notifications[category]['unread'].msgs = [];
        notify.notifications[category]['unread'].count = 0;
        notify.notifications[category]['read'].msgs = read;
        notify.notifications[category]['read'].count = read.length;

        notify.writeStore();
    },

    populate: function (category) {
        var notifyList = $('.notify-list');

        // Remove previously added category classes
        notifyList.removeClass(this.opts.anchors.join(' '));

        notifyList.addClass(category);
        notifyList.html('');

        // Loop through all the category specific notifications and render them
        var unread = this.notifications[category]['unread'].msgs,
            read = this.notifications[category]['read'].msgs;

        for (var i=0, len=read.length; i<len; i++) {
            this.renderMsg(read[i], 'read');
        }
        for (var i=0, len=unread.length; i<len; i++) {
            this.renderMsg(unread[i], 'unread');
        }
    },

    bindEvents: function () {
        // Bind close notification container
        $('#notify-wrapper .close').bind('click', function () {
            $('#notify-wrapper').toggle();
        });
    },

    renderMsg: function (item, css) {
        console.log(item);
        var tmpl = '<li id="'+ new Date() +'" class="'+ css +'">'
                + '<img class="icon" src="'+ item.icon +'"/>'
                + '<span class="msg">'+ item.msg +'</span>'
                // + '<span class="close">x</span>'
            '</li>';
        $('.notify-list').prepend(tmpl);
    },

    // Create notification categories
    createCategory: function (category) {
        this.notifications[category] = {
            unread: {},
            read: {}
        };
        this.notifications[category]['unread'].count = 0;
        this.notifications[category]['unread'].msgs = [];
        this.notifications[category]['read'].count = 0;
        this.notifications[category]['read'].msgs = [];
    }
};

notify.init({
    anchors: ['projects', 'tasks', 'messages']
});

notify.sendMsg('projects', 'images/avatar.jpg', 'Abhi commented on your photo');
notify.sendMsg('projects', 'images/avatar.jpg', 'Ashu commented on your photo');
notify.sendMsg('projects', 'images/avatar.jpg', 'Joe commented on your photo');
notify.sendMsg('projects', 'images/avatar.jpg', 'Jim commented on your photo');
notify.sendMsg('tasks', 'images/avatar.jpg', 'Abhi assigned a task');
notify.sendMsg('messages', 'images/avatar.jpg', 'Abhi sent a msg to you');