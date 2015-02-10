var wsConfig = {
api : {
urls: {
get_organizations      : "http://integrationv2.sympozer.com/backend/web/app.php//organizations",
get_persons            : "http://integrationv2.sympozer.com/backend/web/app.php//persons",
get_events             : "http://integrationv2.sympozer.com/backend/web/app.php//events",
get_categories         : "http://integrationv2.sympozer.com/backend/web/app.php//categories",
get_mainEvents         : "http://integrationv2.sympozer.com/backend/web/app.php//mainEvents",
get_teammates          : "http://integrationv2.sympozer.com/backend/web/app.php//teammates",
get_locations          : "http://integrationv2.sympozer.com/backend/web/app.php//locations",
get_equipments         : "http://integrationv2.sympozer.com/backend/web/app.php//equipments",
get_roles              : "http://integrationv2.sympozer.com/backend/web/app.php//roles",
get_roleLabels         : "http://integrationv2.sympozer.com/backend/web/app.php//roleLabels",
get_papers             : "http://integrationv2.sympozer.com/backend/web/app.php//papers",
get_topics             : "http://integrationv2.sympozer.com/backend/web/app.php//topics",

get_import_header      : "http://integrationv2.sympozer.com/backend/web/app.php//import",

login                  : "http://integrationv2.sympozer.com/backend/web/app.php//login/login_check?_format=json",
logout                 : "http://integrationv2.sympozer.com/backend/web/app.php//logout",
registration           : "http://integrationv2.sympozer.com/backend/web/app.php//signup",
confirm                : "http://integrationv2.sympozer.com/backend/web/app.php//user/confirm",
changepwd              : "http://integrationv2.sympozer.com/backend/web/app.php//user/change_pwd",
reset_pwd_request      : "http://integrationv2.sympozer.com/backend/web/app.php//reset_pwd_request",
reset_pwd              : "http://integrationv2.sympozer.com/backend/web/app.php//reset_pwd",


socialnetworks         : [
  {
  name        : "google",
  urls        : {
  login: "http://integrationv2.sympozer.com/backend/web/app.php//connect/google",
  enrich: "http://integrationv2.sympozer.com/backend/web/app.php//enrich/google"
  },
  can_register: true  }
,  {
  name        : "twitter",
  urls        : {
  login: "http://integrationv2.sympozer.com/backend/web/app.php//connect/twitter",
  enrich: "http://integrationv2.sympozer.com/backend/web/app.php//enrich/twitter"
  },
  can_register: false  }
,  {
  name        : "facebook",
  urls        : {
  login: "http://integrationv2.sympozer.com/backend/web/app.php//connect/facebook",
  enrich: "http://integrationv2.sympozer.com/backend/web/app.php//enrich/facebook"
  },
  can_register: true  }
,  {
  name        : "linkedin",
  urls        : {
  login: "http://integrationv2.sympozer.com/backend/web/app.php//connect/linkedin",
  enrich: "http://integrationv2.sympozer.com/backend/web/app.php//enrich/linkedin"
  },
  can_register: true  }
]
}
}
};