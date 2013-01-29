
requirejs.config({
    //Pass the top-level main.js/index.js require
    //function to requirejs so that node modules
    //are loaded relative to the top-level JS file.
    nodeRequire: require,
    baseUrl: 'js/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app',
        _ : 'underscore',
        jquery: "require-jquery"
    }
});

require.config({
    shim: {
        underscore: {
          exports: '_'
        }
    }
})

//convert Google Maps into an AMD module
// define('myGmaps', [''],
// function(){
//     return window.google.maps;
// });


require(['jquery','underscore-min','bootstrap.min', 'knockout', 'app/appViewModel','domReady!'], 
	function  ($, _, bootstrap, ko, appViewModel, gmaps) {
    //foo and bar are loaded according to requirejs
    //config, but if not found, then node's require
    //is used to load the module.
    console.log('apply model');
    ko.applyBindings(new appViewModel());
    console.log('init carousel');
    $('.carousel').carousel();

});

