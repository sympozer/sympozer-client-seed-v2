export var Config = {
    app: {
        "appLogo": "Sympozer_logo.png",
        //              "conferenceEventCategory": "http:\/\/data.semanticweb.		org\/conference\/www\/2018\/category\/conference-event",
        "presentationEventCategory": "http:\/\/data.semanticweb.org\/conference\/www\/2018\/category\/presentation-event",
        "sessionEventCategory": "http:\/\/data.semanticweb.org\/conference\/www\/2018\/category\/session-event",
        styleMatching: {
            "http://data.semanticweb.org/ns/swc/ontology#PosterEvent": "poster",
            "http://data.semanticweb.org/ns/swc/ontology#SessionEvent": "session",
            //                    "http://data.semanticweb.org/ns/swc/ontology#SessionEvent": "research",
            //                    "http://data.semanticweb.org/conference/www/2018/category/in-use-event": "inUse",
            "http://data.semanticweb.org/ns/swc/ontology#DemoEvent": "demo",
            "http://data.semanticweb.org/ns/swc/ontology#WorkshopEvent": "workshop",
            "http://data.semanticweb.org/ns/swc/ontology#TutorialEvent": "tutorial",
            "http://data.semanticweb.org/ns/swc/ontology#KeynoteEvent": "keynote"
        },
        "imageFolder": "data/images/", //Needs a trailing slash
        "whatsNextDelay": {"hours": 2} //MomentJS notation
    },
    preferences: {
        "storage": "on"
    },
    conference: {
        "name": "The Web Conference 2018",
        "hashtag": "#TheWebConf @TheWebConf",
        "acronym": "WWW2018",
        "logoUri": "data/images/TheWebConference2018-logo.png",
        "website": "https://www2018.thewebconf.org/",
        "baseUri": "http://data.semanticweb.org/conference/www/2018",
        "updateUri": "https://raw.githubusercontent.com/sympozer/datasets/master/WWW2018/conference.ttl",
        "lang": "EN",
        "momentLang": "EN_us",
        "storage": "on",
        "timeZone": {
            "name": "Europe/Athens",
            "standardOffset": "+01",
            "daylightOffset": "+02",
            "changeToDaylightMonth": "3",
            "changeToStandardMonth": "10"
        }
    },
    datasources: {
        "DblpDatasource": {
            "uri": "http://dblp.rkbexplorer.com/sparql/",
            "crossDomainMode": "CORS",
            "commands": "DBLPCommandStore"
        },
        "DuckDuckGoDatasource": {
            "uri": "http://api.duckduckgo.com/",
            "crossDomainMode": "JSONP",
            "commands": "DDGoCommandStore"
        },
        "GoogleDataSource": {
            "uri": "https://ajax.googleapis.com/ajax/services/search/web",
            "crossDomainMode": "JSONP",
            "commands": "GoogleCommandStore"
        },
        "localDatasource": {
            "uri": "local:/embedded",
            //local configuration
            "local": true,
            "commands": "LocalCommandStore"
        },
        "VotingSystemDatasource": {
            "uri": "local:/voting",
            //local configuration
            "local": true,
            "commands": "VotingSystemCommandStore"
        },
        "TwitterWidgetDatasource": {
            "uri": "local:/twitter",
            //local configuration
            "local": true,
            "commands": "TwitterWidgetCommandStore"
        }
    },
    apiLogin: {
        url: "https://login.sympozer.com"
    },

    jwt_key : 'testsympozerlogin',

    externalServer: {
        url: "https://sympozer.com/external"
    },
    vote :{
        url: 'https://sympozer.com/external/',
        tracks: ['https://w3id.org/scholarlydata/track/www-2018-demo', 'https://w3id.org/scholarlydata/track/www-2018-poster']
    }
};