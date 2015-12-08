Tasks = new Mongo.Collection("tasks");
Mmodels = new Mongo.Collection("mmodels");

if (Meteor.isServer) {
  // This code only runs on the server
  // Only publish mmodels that are public or belong to the current user
  Meteor.publish("mmodels", function () {
    return Mmodels.find({
      $or: [
        { private: {$ne: true} },
        { owner: this.userId }
      ]
    });
  });
}

if (Meteor.isClient) {
  // This code only runs on the client
  Meteor.subscribe("mmodels");

  Template.body.helpers({
    mmodels: function () {
      return Mmodels.find({}, {sort: {createdAt: -1}});
    },
    mmodelCount: function () {
      return Mmodels.find({}).count();
    }
  });

  Template.body.events({
    "click #button_newmodel": function (event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form element
      var model_name = event.target.form.children.model_name.value;
      var num_days  = event.target.form.children.num_days.value;
      var num_folds  = event.target.form.children.num_folds.value;
      var num_epochs  = event.target.form.children.num_epochs.value;
      var num_ensembles  = event.target.form.children.num_ensembles.value;

      // Insert a mmodel into the collection
      Meteor.call("addMmodel", model_name,num_days,num_folds,num_epochs,num_ensembles,);

      // Clear form
      event.target.form.children.model_name.value = "";
      event.target.form.children.num_days.value  = "";
      event.target.form.children.num_folds.value  = "";
      event.target.form.children.num_epochs.value  = "";
      event.target.form.children.num_ensembles.value  = "";

    }
  });

  Template.mmodel.helpers({
    isOwner: function () {
      return this.owner === Meteor.userId();
    }
  });

  Template.mmodel.events({
    "click .toggle-checked": function () {
      // Set the checked property to the opposite of its current value
      Meteor.call("setChecked", this._id, ! this.checked);
    },
    "click .delete": function () {
      Meteor.call("deleteMmodel", this._id);
    },
    "click .toggle-private": function () {
      Meteor.call("setPrivate", this._id, ! this.private);
    }
  });

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });
}

Meteor.methods({
  addMmodel: function (model_name,num_days,num_folds,num_epochs,num_ensembles) {
    // Make sure the user is logged in before inserting a mmodel
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Mmodels.insert({
      model_name:     model_name
      ,num_days:      num_days
      ,num_folds:     num_folds
      ,num_epochs:    num_epochs
      ,num_ensembles: num_ensembles
      ,createdAt:     new Date()
      ,owner:         Meteor.userId()
      ,username:      Meteor.user().username
    });
  },
  deleteMmodel: function (mmodelId) {
    var mmodel = Mmodels.findOne(mmodelId);
    if (mmodel.private && mmodel.owner !== Meteor.userId()) {
      // If the mmodel is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }

    Mmodels.remove(mmodelId);
  },
  setChecked: function (mmodelId, setChecked) {
    var mmodel = Mmodels.findOne(mmodelId);
    if (mmodel.private && mmodel.owner !== Meteor.userId()) {
      // If the mmodel is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }

    Mmodels.update(mmodelId, { $set: { checked: setChecked} });
  },
  setPrivate: function (mmodelId, setToPrivate) {
    var mmodel = Mmodels.findOne(mmodelId);

    // Make sure only the mmodel owner can make a mmodel private
    if (mmodel.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Mmodels.update(mmodelId, { $set: { private: setToPrivate } });
  }
});
