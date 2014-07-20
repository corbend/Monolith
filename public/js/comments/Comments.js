define('root/comments/Comments', [
	'jquery', 'underscore', 'backbone', 'backbone.marionette',
	'root/users/Users',
	'root/comments/Create'
], function($, _, Backbone, Marionette, 
	Users, Create
) {"use strict";
		
	var Region = Marionette.Region.extend({
		el: '#project-list-template'
	});

	var CommentView = Marionette.ItemView.extend({
		template: '#comment-item-template',
		tagName: 'li',
		className: 'list-group-item',
		templateHelpers: {
			getLocalTime: function() {
				return this.postDate.toLocaleString();
			},
			getAuthorName: function() {
				var user = Users.Collection.get(this.userId);
				return (user && user.get('name')) || '';
			}
		}
	});	

	var CommentsList = Marionette.CollectionView.extend({
		childView: CommentView,
		tagName: 'ul',
		className: 'list-group'
	});

	var Comment = Backbone.Model.extend({
		urlRoot: 'comments',
		defaults: {
			userId: '',
			projectId: '',
			taskId: '',
			text: '',
			postDate: 0
		}
	});

	var Comments = Backbone.Collection.extend({
		model: Comment,
		url: 'comments'
	});

	var collection = new Comments();

	var CommentsForProject = Comments.extend({
		getProject: function() {
			return this.project;
		},
		setProject: function(project) {
			this.project = project;
		},
		url: function() {
			var projectModel = this.getProject().constructor.prototype;

			return [projectModel.urlRoot, this.getProject().id, Comment.prototype.urlRoot].join("/");
		}
	});


	var CommentsForTask = Comments.extend({
		getTask: function() {
			return this.task;
		},
		setTask: function(task) {
			this.task = task;
		},
		url: function() {
			var taskModel = this.getTask().constructor.prototype;

			return [taskModel.urlRoot, this.this.getTask().id, Comment.prototype.urlRoot].join("/");
		}
	});

	var MessageView = Marionette.ItemView.extend({
		template: '#empty-warning-template'
	});

	var Controller = Marionette.Controller.extend({
		initialize: function(App) {
			this.App = App;
		},
		showProjectCommentsList: function(projectEntity) {
			var scope = this;
			var region = new Region({
				el: '#project-comment-region'
			});
			var collection = new CommentsForProject();
			collection.setProject(projectEntity);

			collection.fetch({
				success: function() {
					var view = new CommentsList({
						collection: collection
					});

					region.show(view);
				}
			})

			var newComment = new Comment();
			newComment.set('projectId', projectEntity.id);
			var createRegion = new Create.Region();
			Create.Controller.showCreateForm(createRegion, newComment);
		},
		showTaskCommentsList: function(region, taskEntity) {
			var region = region || new Region();
			var collection = new CommentsForTask();
			collection.setTask(taskEntity);

			collection.fetch({
				success: function() {
					region.show(new CommentsList({
						collection: collection
					}));
				}
			})

			var newComment = new Comment();
			newComment.set('taskId', taskEntity.id);
			var createRegion = new Create.Region();
			Create.Controller.showCreateForm(createRegion, newComment);
		},
		showWarningMessage: function(message) {

			var commentsRegion = new Region({
				el: '#project-comment-region'
			});

			commentsRegion.show(new MessageView({
				title: '',
				message: ''
			}));
		}
	});

	// var controller = new Controller();

	return {
		Controller: Controller,
		Region: Region
	}
});