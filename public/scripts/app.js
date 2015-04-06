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
  
  App.Templates.Lists = $('#t-lists').text();
  App.Templates.ListPreview = $('#t-list-preview').text();
  App.Templates.ItemPreview= $('#t-item-preview').text();
  App.Templates.List = $('#t-list').text();
  App.Templates.Item = $('#t-item').text();
  
  //
  // Models
  //
  
  App.Models.List = Backbone.Model.extend({
    idAttribute: 'uuid',
    urlRoot: '/lists',
    defaults: {
      updated: _.time(),
      title: '',
      description: '',
      items: []
    }
  });

  App.Models.Item = Backbone.Model.extend({
    defaults: {
      title: '',
      description: '',
      checked: false
    }
  });

  //
  // Collections 
  //

  App.Collections.List = Backbone.Collection.extend({
    url: '/lists',
    model: App.Models.List,
    comparator: function (model) {
      return model.get('created');
    }
  });

  App.Collections.Item = Backbone.Collection.extend({
    model: App.Models.Item,
    comparator: function (model) {
      return model.get('position');
    }
  });

  //
  // Views 
  //

  App.Views.Lists = Backbone.View.extend({
    className: 'lists',
    template: _.template(App.Templates.Lists),
    events: {},
    initialize: function () {
      var _this = this;
      var collection = new App.Collections.List();
      _this.collection = collection;
    },
    run: function () {
      var _this = this;
      _this.getLists();
    },
    getLists: function () {
      var _this = this;
      _this.collection.fetch({
        error: function () { console.log(false); },
        success: function () { _this.renderLists(); }
      });
    },
    renderLists: function () {
      var _this = this;
      _this.collection.each(function (model) {
        var items = model.get('items');
        var collection = new App.Collections.Item(items);
        var view = new App.Views.ListPreview({ model: model, collection: collection });
        _.render({ view: view, $el: _this.$el, type: 'append' });
      });
    },
    render: function () {
      var _this = this;
      var html = _this.template();
      _this.$el.html(html);
      return _this;
    },
  });

  App.Views.ListPreview = Backbone.View.extend({
    className: 'list-preview',
    template: _.template(App.Templates.ListPreview),
    initialize: function (params) {
      var _this = this;
      var collection = params.collection;
      if (collection) {
        _this.collection = collection;
        _this.collection.bind('change', function () {
          var items = _this.collection.toJSON();
          _this.model.set('items', items);
          _this.model.save();
        });
      }
      _this.model.on('change', function () {
        _this.render();
        _this.run();
      });
    },
    run: function () {
      var _this = this;
      _this.renderItems();
    },
    renderItems: function () {
      var _this = this;
      var $el = _this.$el;
      if (_this.collection) {
        _this.collection.each(function (model) {
          var view = new App.Views.ItemPreview({ model: model });
          _.render({ view: view, $el: $el, type: 'append' });
        });
      }
    },
    render: function () {
      var _this = this;
      var json = _this.model.toJSON();
      var html = _this.template(json);
      _this.$el.html(html);
      return _this;
    },
  });

  App.Views.ItemPreview = Backbone.View.extend({
    className: 'item-preview',
    template: _.template(App.Templates.ItemPreview),
    events: {
      'change input.item-checkbox' : 'changeChecked'
    },
    initialize: function (params) {
      var _this = this;
      _this.model.bind('change:title', _this.render, _this);
      _this.model.bind('change:description', _this.render, _this);
    },
    changeChecked: function () {
      var _this = this;
      var checked = _this.$('input.item-checkbox').is(':checked');
      _this.model.set('checked', checked);
    },
    render: function () {
      var _this = this;
      var json = _this.model.toJSON();
      var html = _this.template(json);
      _this.$el.html(html);
      return _this;
    },
  });

  App.Views.List = Backbone.View.extend({
    className: 'list',
    template: _.template(App.Templates.List),
    events: {
      'click a.add-item' : 'addItem',
      'click a.delete-list' : 'deleteList',
      'click button.submit' : 'manualSubmit',
      'keyup input.list-title' : 'changeTitle',
      'keyup textarea.list-description' : 'changeDescription',
    },
    initialize: function () {
      var _this = this;
      var items = _this.model.get('items');
      _this.submit = _.throttle(_this._submit, 500);
      _this.collection = new App.Collections.Item(items); 
      _this.model.on('change', function () {
        _this.submit();
      });
      _this.collection.bind('all', function (type) {
        if (type === 'render') { _this.renderItems(); }
        _this.submit();
      });
    },
    addItem: function (event) {
      event.preventDefault();
      var _this = this;
      var position = _this.collection.length;
      var model = new App.Models.Item({ position: position });
      _this.collection.add(model);
      _this.renderItems();
      $('input').last().focus();
      $('html, body').animate({ scrollTop: $(document).height() }, 1000);
    },
    deleteList: function (event) {
      event.preventDefault();
      var _this = this;
      _this.model.destroy({
        errror: function () { console.log(false); },
        success: function () { 
          window.location.href = '/';
        },
      })
    },
    changeTitle: function () {
      var _this = this;
      var text = _this.$('input.list-title').val();
      var time = _.time(); 
      _this.model.set('title', text);
      _this.model.set('updated', time);
    },
    changeDescription: function (event) {
      var _this = this;
      var text = _this.$('textarea.list-description').val();
      var time = _.time(); 
      _this.model.set('description', text);
      _this.model.set('updated', time);
    },
    manualSubmit: function () {
      var _this = this;
      var $btn = _this.$('button');
      $btn.text('Saving...');
      $btn.attr('disabled', true);
      _this._submit();
    },
    _submit: function () {
      var _this = this;
      var $btn = _this.$('button');
      var items = _this.collection.toJSON();
      _this.model.save({ items: items },{
        error: function () { console.log(false); },
        success: function () { 
          $btn.text('Save');
          $btn.removeAttr('disabled');
        }
      });
    },
    run: function () {
      var _this = this;
      _this.$('input').focus();
      _this.renderListPreview();
      _this.renderItems();
    },
    renderListPreview: function () {
      var _this = this;
      var $el = _this.$('.container-list-preview');
      var view = new App.Views.ListPreview({ model: _this.model });
      _.render({ view: view, $el: $el  });
    },
    renderItems: function () {
      var _this = this;
      var collection = _this.collection;
      var $el = _this.$('.container-items').html('');
      _this.collection.each(function (model) {
        var view = new App.Views.Item({ model: model, collection: collection });
        _.render({ view: view, $el: $el, type: 'append' });
      });
    },
    render: function () {
      var _this = this;
      var json = _this.model.toJSON();
      var html = _this.template(json);
      _this.$el.html(html);
      return _this;
    },
  });

  App.Views.Item = Backbone.View.extend({
    className: 'item',
    template: _.template(App.Templates.Item),
    events: {
      'click a.delete-item' : 'deleteItem',
      'keyup input.item-title' : 'changeTitle',
      'keyup textarea.item-description' : 'changeDescription',
      'change select.item-position' : 'changePosition'
    },
    initialize: function (params) {
      var _this = this;
      _this.collection = params.collection;
    },
    deleteItem: function (event) {
      event.preventDefault();
      var _this = this;
      _this.model.destroy();
      _this.collection.each(function (model, i) {
        model.set('position', i);
      });
      _this.$el.remove();
      _this.collection.trigger('render');
    },
    changeTitle: function () {
      var _this = this;
      var text = _this.$('input.item-title').val();
      _this.model.set('title', text);
    },
    changeDescription: function () {
      var _this = this;
      var text = _this.$('textarea.item-description').val();
      _this.model.set('description', text);
    },
    changePosition: function () {
      var _this = this;
      var adjust = 0;
      var models = [];
      var attr = 'position';
      var val = _this.$('select.item-position').val();
      val = Number(val);
      _this.model.set(attr, val);
      _this.collection.forEach(function (model, i) {
        if (model !== _this.model) { models.push(model); }
      });
      models.forEach(function (model, i) {
        if (i === val) { adjust += 1; }
        model.set(attr, i+adjust);
      });
      _this.collection.sort();
      _this.collection.trigger('render');
    },
    run: function () {
      var _this = this;
      _this.renderItemPreview();
      _this.renderItemSelect();
    },
    renderItemPreview: function () {
      var _this = this;
      var $el = _this.$('.container-item-preview');
      var view = new App.Views.ItemPreview({ model: _this.model });
      _.render({ view: view, $el: $el  });
    },
    renderItemSelect: function () {
      var _this = this; 
      var $el = _this.$('.item-position');
      var max = _this.collection.length;
      var position = _this.model.get('position');
      for (var i=0; i<max; i++) {
        if (i === position) {
          $el.append('<option value="'+i+'" selected >'+(i+1)+'</option>');
        } else {
          $el.append('<option value="'+i+'">'+(i+1)+'</option>'); 
        }
      }
    },
    render: function () {
      var _this = this;
      var json = _this.model.toJSON();
      var html = _this.template(json);
      _this.$el.html(html);
      return _this;
    },
  });

  //
  // Router
  //

  App.Router = Backbone.Router.extend({
    routes: {
      '' : 'root',
      'create' : 'create',
      'lists/:uuid': 'lists'
    },
    initialize: function () {
      var _this = this;
      _this.$el = $('#container');
    },
    root: function () {
      var _this = this;
      var view = new App.Views.Lists();
      _.render({ view: view, $el: _this.$el });
    },
    create: function () {
      var _this = this;
      var model = new App.Models.List();
      model.save({}, {
        error: function () { console.log(false); },
        success: function () {
          var uuid = model.get('uuid');
          var href = ['/lists', uuid].join('/');
          _this.navigate(href, { trigger: true });
        },
      });
    },
    lists: function (uuid) {
      var _this = this;
      var model = new App.Models.List({ uuid: uuid });
      model.fetch({
        error: function () { console.log(false); },
        success: function () { 
          var view = new App.Views.List({ model: model });
          _.render({ view: view, $el: _this.$el });
        }
      });
    }
  });

  new App.Router();
  Backbone.history.start();

});
