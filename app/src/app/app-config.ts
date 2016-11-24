export var Config = {
  app : {
    "appLogo" : "Sympozer_logo.png",
	//              "conferenceEventCategory": "http:\/\/data.semanticweb.		org\/conference\/eswc\/2015\/category\/conference-event",
	    "presentationEventCategory": "http:\/\/data.semanticweb.org\/conference\/eswc\/2015\/category\/presentation-event",
	    "sessionEventCategory": "http:\/\/data.semanticweb.org\/conference\/eswc\/2015\/category\/session-event",
	    styleMatching: {
	        "http://data.semanticweb.org/ns/swc/ontology#PosterEvent": "poster",
	        "http://data.semanticweb.org/ns/swc/ontology#SessionEvent": "session",
	//                    "http://data.semanticweb.org/ns/swc/ontology#SessionEvent": "research",
	//                    "http://data.semanticweb.org/conference/eswc/2015/category/in-use-event": "inUse",
	        "http://data.semanticweb.org/ns/swc/ontology#DemoEvent": "demo",
	        "http://data.semanticweb.org/ns/swc/ontology#WorkshopEvent": "workshop",
	        "http://data.semanticweb.org/ns/swc/ontology#TutorialEvent": "tutorial",
	        "http://data.semanticweb.org/ns/swc/ontology#KeynoteEvent": "keynote"
	    },
		"imageFolder": "data/images/", //Needs a trailing slash
	    "whatsNextDelay": {"hours":2} //MomentJS notation
    },
 	preferences: {
        "storage": "on"
    },
    conference : {
        "name": "13th ESWC2016",
        "acronym": "ESWC2016",
        "logoUri": "data/images/logo_eswc2016.png",
        "website": "http://2016.eswc-conferences.org/",
        "baseUri": "http://data.semanticweb.org/conference/eswc/2016",
        "updateUri": "https://raw.githubusercontent.com/sympozer/datasets/master/ESWC2016/data_ESWC2016.json",
        "lang" : "EN",
        "momentLang" : "EN_us",
        "storage": "on",
        "timeZone": {
            "name": "Europe/Athens",
            "standardOffset": "+01",
            "daylightOffset": "+02",
            "changeToDaylightMonth": "3",
            "changeToStandardMonth": "10"
        }
    },
    datasources : {
        "DblpDatasource" : {
            "uri" : "http://dblp.rkbexplorer.com/sparql/",
            "crossDomainMode" : "CORS",
            "commands" : "DBLPCommandStore"
        },
        "DuckDuckGoDatasource" : {
            "uri" : "http://api.duckduckgo.com/",
            "crossDomainMode" : "JSONP",
            "commands" : "DDGoCommandStore"
        },
        "GoogleDataSource" : {
            "uri" : "https://ajax.googleapis.com/ajax/services/search/web",
            "crossDomainMode" : "JSONP",
            "commands" : "GoogleCommandStore"
        },
        "localDatasource" : {
            "uri" : "local:/embedded",
            //local configuration
            "local": true,
            "commands" : "LocalCommandStore"
        },
        "VotingSystemDatasource" : {
            "uri" : "local:/voting",
            //local configuration
            "local": true,
            "commands" : "VotingSystemCommandStore"
        },
        "TwitterWidgetDatasource" : {
            "uri" : "local:/twitter",
            //local configuration
            "local": true,
            "commands" : "TwitterWidgetCommandStore"
        }
    }
};