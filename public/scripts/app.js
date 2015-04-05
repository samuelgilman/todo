window.App = {}; 

$(document).ready(function () {

  _.templateSettings = {
    evaluate: /\{\{([\s\S]+?)\}\}/g,
    interpolate: /\{\{=([\s\S]+?)\}\}/g,
    escape: /\{\{-([\s\S]+?)\}\}/g
  };

  //
  // Mixins 
  //

  _.mixin({
    time: function () {
      return new Date().getTime();
    }
  });

  _.mixin({
    toLocaleString: function (time) {
      return new Date(time).toLocaleString();
    }
  });

  _.mixin({
    checked: function (bool) {
      return bool ? 'checked' : '';
    }
  });

  _.mixin({
    render: function (params) {
      var $el = params.$el;
      var type = params.type;
      var view = params.view
      var html = view.render().el;
      $el[(type || 'html')](html);
      if (view.run) { view.run(); }
    }
  });

  App.Templates = {};
  App.Models = {};
  App.Collections= {};
  App.Views = {};

  //
  // Templates 
  //
  
  //
  // Models
  //
  
  //
  // Collections 
  //

  //
  // Views 
  //

});
