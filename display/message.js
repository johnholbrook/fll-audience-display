module.exports = {
    set_message_text : set_message_text,
    show_on_other_screens : show_on_other_screens
};

var scores = require('./scores.js');
var schedule = require('./schedule.js');
var intro = require('./match-intro.js');
var other_events = require('./other_events.js');

function set_message_text(new_text){
    document.querySelector("#message-text").innerHTML = new_text;

    document.querySelectorAll(".sm-message-area").forEach(area => {
        area.innerHTML = new_text;
    });

    update_table_headers();
}

function update_table_headers(){    
    //move any table headers on other screens (scores, schedule, etc)
    //to the correct height after showing, hiding, or updating a message
    scores.update_table_header();
    schedule.update_table_header();
    intro.update_table_position();
    other_events.update_table_position();
}

function show_on_other_screens(show){
    document.querySelectorAll(".sm-message-area").forEach(area => {
        area.style.display = show ? "block" : "none";
    });

    update_table_headers();
}