define('root/navmenu/NavMenu', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette'
], function($, _, Backbone, Marionette) {"use strict";

	var ItemModel = Backbone.Model.extend({
		defaults: {
			name: 'Пункт меню',
			position: 0,
			showCounter: false,
			count: 0
		}
	});

	var MenuItems = Backbone.Collection.extend({
		model: ItemModel,
		comparator: 'position'
	});

	var items = new MenuItems([
		{name: 'Проекты', position: 1, showCounter: true},
		{name: 'Задачи', position: 2, showCounter: true},
		{name: 'Сообщения', position: 3, showCounter: true},
		{name: 'Пользователи', position: 4, showCounter: true},
		{name: 'Журнал', position: 5},
		{name: 'Статистика', position: 6},
		{name: 'Фильтрация', position: 7}
	]);

	var MenuItem = Marionette.ItemView.extend({
		template: '#menu-item-template',
		tagName: 'li',
		triggers: {
			'click a': 'menu:select'
		}
	});

	var View = Marionette.CollectionView.extend({
		tagName: 'ul',
		className: 'nav nav-pills',
		childView: MenuItem
	})

	return {
		View: View,
		Collection: items
	}
});