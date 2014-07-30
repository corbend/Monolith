module.exports = function(grunt) {
	grunt.initConfig({
		// running `grunt less` will compile once
		less: {
			development: {
				options: {
					// paths: ["./public/less"],
					yuicompress: true
				},
				files: {
					"./public/css/main.css": "./public/less/main.less",
					"./public/css/start.css" : "./public/less/start.less"
				}
			}
		},
		// running `grunt watch` will watch for changes
		watch: {
			files: "./public/less/*.less",
			tasks: ["less"]
		}
	});
	grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
};