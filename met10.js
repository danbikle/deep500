Tasks = new Mongo.Collection("tasks");

if (Meteor.isClient) {
  // This code only runs on the client
  Template.body.helpers({
    tasks: function () {
      // this function depends on Session value for hideCompleted
      if(Session.get("hideCompleted")) {
        // If hide completed is checked, filter tasks
        return Tasks.find({checked: {$ne: true}}, {sort: {createdAt: -1}});
      } else { // Return all tasks
        return Tasks.find({}, {sort: {createdAt: -1}});
      }
    },
    hideCompleted: function () {
      return Session.get('hideCompleted');
    }
  });

  Template.header.events({
    "change .hide-completed input": function(event){
      Session.set('hideCompleted', 'event.target.checked')
    }
  });

  Template.body.events({
    "submit .new-task": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var text = event.target.text.value;

      // Insert a task into the collection
      Tasks.insert({
        text: text,
        createdAt: new Date() // current time
      });

      // Clear form
      event.target.text.value = "";
    }
  });

  Template.task.events({
    "click .toggle-checked": function () {
      // This should toggle value of checked-property:
      Tasks.update(this._id, {$set: {checked: ! this.checked}})
    },
    "click button.delete": function(){Tasks.remove(this._id)}
  });
}

