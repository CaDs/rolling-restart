//////////////////////////////////////////////////////////////////////////////////////////////////////
// 
// This example was heavily inspired and contains code from ActionHeroCluster
//                     https://github.com/evantahler/actionHero
// 
//////////////////////////////////////////////////////////////////////////////////////////////////////

var cluster = require('cluster'),
		numWorkers = 1,
		workerRestartArray = [],
		workersExpected = numWorkers;

// signals
process.on('SIGINT', function(){
	console.log("Signal: SIGINT");
	workersExpected = 0;
	setupShutdown();
});

process.on('SIGUSR2', function(){
	console.log("Signal: SIGUSR2");
	console.log("swap out new workers one-by-one");
	workerRestartArray = [];
	for(var i in cluster.workers){			
		workerRestartArray.push(cluster.workers[i]);
	}
	reloadAWorker();
});

process.on("exit", function(){
	workersExpected = 0;
	console.log("Bye!")
});

// signal helpers
var startAWorker = function(callback){
	worker = cluster.fork();
	console.log("starting worker #" + worker.id);	
	if (callback != null) {callback()};
}

var reloadAWorker = function(next){
	for (var i in workerRestartArray){ 
		worker = workerRestartArray[i];
		startAWorker(destroyWorker(worker));
	}
}

var	destroyWorker = function(worker){
	console.log("bye bye worker");
	worker.destroy();
}

var setupShutdown = function(){
	console.log("Cluster manager quitting");
	console.log("Stopping each worker...");
	for(var i in cluster.workers){
		cluster.workers[i].send('stop');
	}
	setTimeout(loopUntilNoWorkers, 1000);
}

var loopUntilNoWorkers = function(){
	if(cluster.workers.length > 0){
		console.log("there are still " + cluster.workers.length + " workers...");
		setTimeout(loopUntilNoWorkers, 1000);
	}else{
		console.log("all workers gone");        
		process.exit();
	}
}

// Start the service
if (cluster.isMaster) {
	for(var i=0; i < numWorkers; i++){
		startAWorker();
	}    
} else {
	require('./worker.js');
}