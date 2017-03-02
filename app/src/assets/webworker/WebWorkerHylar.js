importScripts('../hylar/hylar-client.js');
importScripts('../hylar/q.js');
importScripts('./manager-web-worker.js');

//create a Worker instance of FrontRunner
var worker = FrontRunner();

var hylar = new Hylar(),
  q = Q;

//Surchage de la méthode pour avoir les nouveaux résultats
Solver.evaluateThroughRestriction = function (rule, facts) {
  console.log('evaluateThroughRestriction');
  var mappingList = this.getMappings(rule, facts),
    consequences = [], deferred = q.defer(),
    substitution;

  try {
    this.checkOperators(rule, mappingList);

    for (var i = 0; i < mappingList.length; i++) {
      if (mappingList[i]) {
        for (var j = 0; j < rule.consequences.length; j++) {
          substitution = this.substituteFactVariables(mappingList[i], rule.consequences[j], []);
          consequences.push(substitution);

          //On envoie au parent le résultat des triples obtenue jusqu'à maintenant
          worker.send("classify", {
            partial: ParsingInterface.factToTurtle(substitution)
          });
         /* postMessage({
            action: "stream",
            partial: ParsingInterface.factToTurtle(substitution)
          });*/
        }
      }
    }
    deferred.resolve(consequences);
  } catch (e) {
    deferred.reject(e);
  }

  return deferred.promise;
};

worker.on('classify', function (event) {
  console.log(event);
  if (!event) {
    return false;
  }

  hylar
    .load(event.ontologyTxt, event.mimeType, event.keepOldValues)
    .then(function (done) {

      //On informe le parent que la classification est finie
      worker.send("classify", done);
      /*return {
        results: done,
        action: "classify"
      };*/
    });
});

worker.on('query', function(event) {
  if(!event || !event.query || !event.uuid)
  {
    return false;
  }

  hylar
    .query(event.query)
    .then(function (done) {
      //On informe le parent du résultat de la query
      worker.send('query', {
        results: done,
        uuid: event.uuid,
      });
    });
});

worker.on("import", function(event){
  console.log('worker import');
  if (!event || !event.data || !event.uuid || !event.data.dictionary) {
    return false;
  }

  hylar
    .import(event.data.dictionary)
    .then(function (data) {
      worker.send('import', {
        data: data,
        uuid: event.uuid
      });
    })
    .catch(function () {
      return false;
    });
});
