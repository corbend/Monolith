define('root/tasks/Materials', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette'
	// 'root/tasks/Comments'
], function($, _, Backbone, Marionette
	// Comments
) {"use strict";
	
	var TextEditView = Marionette.ItemView.extend({
		template: '#task-text-edit-template',
		ui: {
			editButton: '.text-edit-button',
			saveButton: '.text-save-button',
			editorPlaceholder: '.text-editor-placeholder'
		},
		events: {
			'click .text-edit-button': 'editorOn',
			'click .text-save-button': 'saveText'
		},
		saveText: function() {
			var task = this.model;
			this.editor.save();
			var text = this.editor.exportFile('taskDescription_' + task.id);
			this.model.set('text', text);
		},
		onShow: function() {
			var task = this.model;
			var taskEditorId = 'taskTextEditor_' + task.id
			this.ui.editorPlaceholder.attr('id', taskEditorId);
			var editor = new EpicEditor({
				container: taskEditorId
			}).load();
			editor.importFile('taskDescription_' + task.id, task.get('text'));
			this.editor = editor;
			editor.preview();
		},
		editorOn: function() {
			var task = this.model;
			var isEditing = new RegExp("active").test(this.ui.editButton.attr("class"));

			if (this.editor) {
				if (this.ui.editButton.attr('data-toggle') == "button"
					&& !isEditing) {
					this.editor.edit();
				} else {
					this.editor.preview();
				}
			}
		},
		editorOff: function() {
			if (this.editor) {
				this.editor.unload();
				this.editor = null;
			}
		}
	});

	var View = Marionette.LayoutView.extend({
		regions: {
			taskText: '.task-text-region',
			taskComments: '.task-comments-region'
		},
		template: '#task-description-template',
		onRender: function() {
			var scope = this;

			var textEdit = new TextEditView({
				model: this.model
			});

			this.taskText.show(textEdit);
			this.textEdit = textEdit;

			// this.taskComments.show(new Comments.View({
			// 	model: this.model
			// }));
		}
	})

	var Controller = Marionette.Controller.extend({
		initialize: function(App) {
			this.App = App;
		},
		workOn: function(taskView, task) {
			//переключение для работы над выбранным таском
			var layout = new View({
				el: '#task-content-' + task.id,
				model: task
			});

			layout.render();

			this.listenTo(task, 'change:text', function() {
				task.save({
					success: function() {
						layout.textEdit.editorOff();
					}
				});
			});

			task.once('destroy', function() {
				this.stopListening(task);
			}, this);

			task.once('remove', function() {
				this.stopListening(task);
			});
		}
	});

	return {
		Controller: Controller
	}
});