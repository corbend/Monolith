define('root/projects/Materials', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette'
], function($, _, Backbone, Marionette
) {"use strict";
		
	var ContentRegion = Marionette.Region.extend({
		el: '#project-content-region'
	});

	var FileUploader = Marionette.ItemView.extend({
		template: '#file-block-template'
	});

	var TextBlock = Marionette.ItemView.extend({
		template: '#text-block-template'
	});

	var TextEditor = Marionette.ItemView.extend({
		template: '#text-editor-template'
	});

	var Layout = Marionette.LayoutView.extend({
		template: '#project-content-template',
		className: 'content-materials',
		ui: {
			saveTextButton: '.save-text-button',
			editTextButton: '.edit-text-button'
		},
		triggers: {
			'click .save-text-button': 'project:text:save',
			'click .edit-text-button': 'project:text:edit'
		},
		regions: {
			fileBlockRegion: '#project-file-block-region',
			textEditorRegion: '#project-text-editor-region'
		},
		onRender: function() {
			this.fileBlockRegion.show(new FileUploader());
			this.textEditorRegion.show(new TextEditor());
		}
	});

	var Controller = Marionette.Controller.extend({
		initialize: function() {
			this.setProject(null);
		},
		setProject: function(p) {
			this.project = p;
		},
		getProject: function() {
			return this.project;
		},
		showLayout: function() {
			var region = new ContentRegion();
			var layout = new Layout();
			this.layout = layout;
			region.show(layout);
			this.showTextEditor(layout);
			this.listenTo(layout, 'project:text:save', this.saveProjectText, this);
			this.listenTo(layout, 'project:text:edit', this.editProjectText, this);
		},
		showTextEditor: function(mainLayout) {

			var preloadedText = '';
			var selectedProject = this.getProject();

			if (mainLayout) {

				this.editor = new EpicEditor({
					container: 'project-text-editor-region',
					button: {
						fullscreen: false
					}
				}).load();

				if (selectedProject) {
					preloadedText = selectedProject.get('projectText');
					this.editor.importFile('project' + selectedProject.id, preloadedText);
				} else {
					this.editor.importFile('unselected', '');
				}

				this.editor.on('edit', function() {
					if (mainLayout) {
						mainLayout.ui.saveTextButton.css('display', 'block');
						mainLayout.ui.editTextButton.css('display', 'none');
					}
				}, this);

				this.editor.on('preview', function() {
					if (mainLayout) {
						mainLayout.ui.saveTextButton.css('display', 'none');
						mainLayout.ui.editTextButton.css('display', 'block');
					}
				}, this);

			}

			this.editor.preview();

		}, 
		editProjectText: function() {
			if (this.editor) {
				this.editor.edit();
			}
		},
		saveProjectText: function(options) {

			var project = this.getProject();
			var text = this.editor.exportFile();

			if (project) {
				project.set('projectText', text);
				project.save();
			}
		}
	})

	var controller = new Controller();

	return {
		Controller: controller
	}
})