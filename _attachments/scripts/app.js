'use strict'

angular.module('movieApp', ['ngRoute'])

	.config(function($routeProvider) {
	    $routeProvider
	        .when('/home', {
	            templateUrl: 'assets/views/home.html',
	            controller: 'homeCtrl'
	        });
	})
	
	.controller('homeCtrl', function($scope, moviesSrv, saveSrv) {
		
	    	$('#searchButton').on('click', function (e) {

	    		$scope.movies = '';

	    		var actor = $('#actorText').val();
	    		
	    		var results = saveSrv.getObject(actor);
	    		
	    		if(Object.keys(results).length == 0){ //acteur is nog niet opgeslagen in couchDB
	    		
	    			moviesSrv.getMoviesWithActor(actor).then(function(data){
	    			
	    			console.log('movie search');
	    			console.log(actor);
	    			console.log(data);
	    			
	    			$scope.movieResults = data; //weet niet hoe alleen de filmografie lijst te tonen!! =(((   		    		
		    			
		    				results = data;
		    				saveSrv.setObject(actor, data);		    				
		    			});
		    		}
		    		else {
		    			//als de acteur al eens eerder opgezocht was, toon de toen opgeslagen zoek resultaten
		    			console.log('reloaded!');
		    			$scope.movieResults = saveSrv.getObject('results');    		    
		    		}	    			
	    		});
	    	 	
    })
    
    .service('moviesSrv', function($http, $q) {
    	this.getMoviesWithActor = function(actor) {
    		var q = $q.defer();
    		var url = 'http://theimdbapi.org/api/find/person?name=' + encodeURIComponent(actor);
    		
    		$http.get(url)
    		.then(function(data) {
    			q.resolve(data);
    		}, function error(err) {
    			q.reject(err);
    		});
    		
    		return q.promise;
    	};
    })  
    
    .service('saveSrv', function($window, $http){
		  this.setObject = function(key, value){
			  $window.localStorage[key] = JSON.stringify(value);
			  //Save in CouchDB
			  
			  console.log('save');
			  console.log(key);
			  var doc = {};
			  
			  	doc.key = key;
			  	doc.value = value;
				var json = JSON.stringify(doc);
				console.log(json);			  
			  
				$.ajax({
					type: 			'PUT',
					url: 			'../..' + key,
					data: 			json,
					contentType: 	'application/json',
					async: true,
					success: function(data){
						console.log(data);	
					},
					error: function(XMLHttpRequest, textStatus, errorThrown){
						console.log(errorThrown);
					}						
				});		
		  };
		  
		  this.getObject = function(key){
			  return JSON.parse($window.localStorage[key] || '{}');
		  };
	});