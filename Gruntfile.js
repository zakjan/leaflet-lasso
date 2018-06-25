const webpackConfig = require('./webpack.config');
module.exports = function(grunt) {
  grunt.initConfig({
    //ts: {
    //  default : {
    //    tsconfig: './tsconfig.json'
    //  }
    //},
    webpack: {
      default: webpackConfig
    }    
  });
  //grunt.loadNpmTasks("grunt-ts");
  grunt.loadNpmTasks('grunt-webpack');
  //grunt.registerTask("default", ["ts","webpack"]);
  grunt.registerTask("default", ["webpack"]);
};