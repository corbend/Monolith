define('root/base/SearchField', [

	'jquery', 'underscore', 'backbone', 'backbone.marionette'

], function($, _, Backbone, Marionette) {

	return Marionette.ItemView.extend({

		template: '#search-field-template',
		ui: {
			searchField: 'input',
			searchButton: 'button'
		},
		options: {
			//TODO - расширить для нескольких аттрибутов
			label: '',
			placeholderText: '',
			searchAttribute: 'name',
			searchCollection: null,
			minChars: 2,
			remote: false
		},
		events: {
			'change input': 'onSearchInput',
			'keypress input': 'onKeyPressed',
			'click button': 'onSearchButton'
		},
		templateHelpers: function() {
			var scope = this;
			return {
				placeholderText: scope.options.placeholderText,
				label: scope.options.label
			}
		},
		getCollection: function() {
			return _.result(this.options, 'searchCollection');
		},

		__localFilter: function(collection, searchValue) {
			var scope = this;

			var filterFunction = function(m) {
				return new RegExp(searchValue).test(
					m.get(scope.options.searchAttribute));
			}

			if (_.isFunction(collection.filterBy)) {

				collection.filterBy(
					this.options.searchAttribute,
					filterFunction(m));
			} else {
				var filtered = collection.filter(filterFunction);
				collection.reset(filtered);
			}
		},
		performSearch: function(searchValue) {

			var scope = this;
			var collection = _.result(this.options, 'searchCollection');

			if (collection) {
				collection.fetch({
					reset: true,
					success: function() {
						scope.__localFilter(collection, searchValue);
					}
				});
			}

		},
		clearSearch: function() {
			var collection = this.getCollection();

			collection.fetch({reset: true});
		},
		__clearOrSearch: function(value) {

			if (typeof value == "undefined") {
				value = this.ui.searchField.val();
			}

			if (!value) {
				this.clearSearch();
			} else {
				this.performSearch(this.ui.searchField.val());
			}
		},
		onSearchInput: function(event) {
			event.preventDefault();
			this.__clearOrSearch();
		},
		onSearchButton: function(event) {
			event.preventDefault();
			this.__clearOrSearch();
		},
		onKeyPressed: function(event) {

			var target = $(event.target);
			var prevValue = this.ui.searchField.val();	
			var lastChar = (event.which == 13 || event.key == "Backspace") ? '': event.key;
			var searchValue = this.ui.searchField.val() + lastChar;

			if (event.key == "Backspace") {
				searchValue = searchValue.slice(0, searchValue.length - 1);
			}

			if (prevValue && this.options.minChars <= prevValue.length) {
				var throttledSearch = _.throttle(this.performSearch, 200);
				throttledSearch.call(this, searchValue);
			} 

			if (!prevValue && event.key != "Backspace") {
				var throttledClear = _.throttle(this.clearSearch, 200);
				throttledClear.call(this);
			}
		}

	});
});