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
    sendMsg: function(category, msg) {
        console.log('msg sent to: '+ category);
        // Create the category if it doesn't exist
        if(!this.notifications[category]) {
            this.createCategory(category);
        }

        var bubble = $('#' + category).find('.counter'),
            count = this.notifications[category]['unread'].count;

        this.notifications[category]['unread'].count = ++count;
        bubble.html(count);
        bubble.fadeIn('slow');
        this.notifications[category]['unread'].msgs.push(msg);

        if ($('#notify-wrapper:visible').length) {
            this.renderMsg(category, msg, 'unread');
        }

        this.writeStore();
    },

    // Mark unread msgs to read
    markRead: function (category) {
        var read = notify.notifications[category]['read'].msgs,
            unread = notify.notifications[category]['unread'].msgs;

        read = read.concat(unread);
        $('#'+ category +' .counter').html('0').hide();
        this.notifications[category]['unread'].msgs = [];
        this.notifications[category]['unread'].count = 0;
        this.notifications[category]['read'].msgs = read;
        this.notifications[category]['read'].count = read.length;
    },

    // Clear all msgs
    clearAll: function(category) {
        if (category) {
            this.notifications[category]['read'].msgs = [];
            this.notifications[category]['read'].count = 0;
            this.notifications[category]['unread'].msgs = [];
            this.notifications[category]['unread'].count = 0;
        } else {
            this.notifications = {};
        }
        this.writeStore();
        $('.counter').html('0').hide();
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
        var unread = notify.notifications[category]['unread'].msgs;

        if ($('#notify-wrapper:visible').length > 0 && $('#notify-wrapper .notify-list').hasClass(category)) {
            $('#notify-wrapper').fadeOut('slow', 'linear');
            notify.markRead(category);
        } else {
            $('#notify-wrapper').fadeIn('slow', 'linear');
        }
        
        $('#notify-wrapper .header').html(category + ' <span class="counter">'+ unread.length +'</span>');
        notify.populate(category);
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
        console.log(unread);
        console.log(read);
        for (var i=0, len=read.length; i<len; i++) {
            this.renderMsg(category, read[i], 'read');
        }
        for (var i=0, len=unread.length; i<len; i++) {
            this.renderMsg(category, unread[i], 'unread');
        }
    },

    bindEvents: function () {
        // Bind close notification container
        $('#notify-wrapper .close').bind('click', function () {
            $('#notify-wrapper').toggle();
        });

        $('#notify-wrapper #unread-menu-item').bind('click', function () {
            $('#notify-wrapper .notify-list li').hide();
            $('#notify-wrapper .notify-list .unread').show();
        })

        $('#notify-wrapper #all-menu-item').bind('click', function () {
            $('#notify-wrapper .notify-list li').show();
        })
    },

    renderMsg: function (category, msg, css) {
        var text = '<span class="actor">'+ msg.actor +'</span> '+ msg.action +' '+ msg.target,
            tmpl = '<li id="'+ new Date() +'" class="'+ css +'">'
                + '<img class="icon" src="'+ msg.avatar +'"/>'
                + '<span class="msg">'+ text +'.</span>'
                // + '<span class="close">x</span>'
            '</li>';

        $('.notify-list.'+ category).prepend(tmpl);
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

function generator () {
    var actors = ['Joe', 'Mary', 'Harry', 'Jessica', 'Tim', 'Chloe'];

    notify.init({
        anchors: ['social', 'projects', 'messages']
    });

    setInterval(function () {
        notify.sendMsg('social', {
            avatar: 'images/avatar.jpg',
            actor: actors[Math.floor(Math.random()*actors.length)],
            action: 'commented',
            target: 'on your photo'
        });
    }, 3000);

    setInterval(function () {

        notify.sendMsg('projects', {
            avatar: 'images/avatar.jpg',
            actor: actors[Math.floor(Math.random()*actors.length)],
            action: 'assigned',
            target: 'you a task'
        });
    }, 5000);

    setInterval(function () {
        notify.sendMsg('messages', {
            avatar: 'images/avatar.jpg',
            actor: actors[Math.floor(Math.random()*actors.length)],
            action: 'sent',
            target: 'you a message'
        });
    }, 7000);
}

generator();