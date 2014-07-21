define('root/projects/Files', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'backbone.syphon'
], function($, _, Backbone, Marionette, Syphon) {"use strict";
		
	var Region = Marionette.Region.extend({
		el: '#js-project-files'
	})

	var FilesUploader = Marionette.ItemView.extend({
		template: '#file-upload-template',
		className: 'file-upload',
		ui: {
			uploadForm: 'form',
			uploadButton: 'button'
		},
		triggers: {
			'click button': 'file:add'
		},
	});

	var FileListItem = Marionette.ItemView.extend({
		template: '#file-item-template',
		tagName: 'li',
		className: 'list-group-item',
		events: {
			'click a': 'onLinkClick'
		},
		onLinkClick: function(event) {

			event.preventDefault();
			
			window.open($(event.target).attr("href")); 
		}
	});

	var FileListView = Marionette.CollectionView.extend({
		tagName: 'ul',
		className: 'list-group file-list',
		childView: FileListItem
	});

	var Layout = Marionette.LayoutView.extend({
		template: '#files-layout-template',
		regions: {
			fileUploadRegion: '#file-upload-region',
			fileListRegion: '#file-list-region'
		}
	});

	var ProjectFile = Backbone.Model.extend({
		urlRoot: 'files',
		defaults: {
			name: '',
			href: '',
			added: 0
		}
	});

	var ProjectFiles = Backbone.Collection.extend({
		model: ProjectFile
	});

	var Controller = Marionette.Controller.extend({
		showFiles: function(projectModel) {
			var scope = this;
			var region = new Region();
			var layout = new Layout();
			region.show(layout);

			var Files = ProjectFiles.extend({
				url: function() {
					var ProjectModel = projectModel.constructor.prototype;
					return [ProjectModel.urlRoot, projectModel.id, ProjectFile.prototype.urlRoot].join("/");
				}
			})

			var files = new Files();

			files.fetch({
				success: function() {

					var fileUploader = new FilesUploader();
					layout.fileUploadRegion.show(fileUploader);

					layout.fileListRegion.show(new FileListView({
						collection: files
					}));

					scope.listenTo(fileUploader, 'file:add', function(itemView) {

						var fileField = fileUploader.ui.uploadForm.find('input');
						scope.saveForm(
							fileUploader.ui.uploadForm[0], 
							fileField.val(), fileField[0].files, projectModel);

					}, scope);
				}
			});
				
		},
		saveForm: function(form, fileName, appendedFiles, projectModel) {

			var scope = this, formdata, len, 
				readFiles, file, loadedFile, fileType, reader;

			if (FormData) {

                formdata = new FormData(form);
                len = appendedFiles.length;
                readFiles = [];

                for (var i=0; i < len; i++) {
                    file = appendedFiles[i];

                    fileType = file.type.match(/image.*/);

                    if (!!fileType && FileReader) {
                        reader = new FileReader();
                        reader.onloadend = function(e) {
                            loadedFile = e.target.result;
                            readFiles.push(loadedFile);
                        };
                        reader.readAsDataURL(file);

                        if (formdata) {
                        	console.log(file);
                            formdata.append("file", file);
                            formdata.append("id", projectModel.id);
                            formdata.append("name", fileName);
                        }
                    }
                }

                if (formdata) {
                    $.ajax({
                        url: 'projects/' + projectModel.id + '/files',
                        data: formdata,
                        dataType: 'json',
                        type: 'POST',
                        processData: false,
                        contentType: false
                    }).done(function(res) {
                        scope.showFiles(projectModel);
                    });
                }

            }

		}
	})

	return {
		Controller: Controller
	}
});