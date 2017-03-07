/**
 * Created by pierremarsot on 02/03/2017.
 */
const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('./dataset-conf2.jsonld', 'utf8'));

export class ParsingJsonLd {

    readonly full_array_file = new Map();

//Person
    readonly type_person = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#Person';
    readonly key_holds_role_person = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#holdsRole';
    readonly key_mailbox_person = 'http://xmlns.com/foaf/0.1/mbox_sha1sum';
    readonly key_name_person = 'http://xmlns.com/foaf/0.1/name';
    readonly prefix_id_person = 'https://w3id.org/scholarlydata/';
    readonly key_affiliation_during_event_person = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#hasAffiliation';
    readonly length_prefix_id_person = this.prefix_id_person.length;

//Hold Role
    readonly key_with_role_hold_role = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#withRole';
    readonly key_during_hold_role = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#during';
    readonly key_is_help_by_hold_role = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#isHeldBy';

//Affiliation During Event
    readonly key_with_role_affiliation_during_event = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#withRole';

//Objet liaison person => Organisation
    readonly key_with_organisation = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#withOrganisation';

//Organisation
    readonly key_name_organisation = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#name';

//Objet liaison in_proceedings => Organised Event
    readonly key_relates_to_event = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#relatesToEvent';

//Organised Event
    readonly key_date_end_organised_event = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#endDate';
    readonly key_date_start_organised_event = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#startDate';

//In proceedings
    readonly key_maker_in_proceeding = 'http://xmlns.com/foaf/0.1/maker';
    readonly key_titile_in_proceeding = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#title';
    readonly key_creator_in_proceeding = 'http://purl.org/dc/elements/1.1/creator';
    readonly key_keywords_in_proceedings = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#keyword';
    readonly key_subject_in_proceedings = 'http://purl.org/dc/elements/1.1/subject';
    readonly key_author_list_in_proceedings = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#hasAuthorList';
    readonly key_same_as_in_proceedings = 'http://www.w3.org/2002/07/owl#sameAs';

//Author list
    readonly key_first_item_author_list = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#hasFirstItem';
    readonly key_last_item_author_list = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#hasLastItem';
    readonly key_all_items_author_list = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#hasItem';

//List item
    readonly key_person_list_item = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#hasContent';
    readonly key_next_list_item = 'http://www.scholarlydata.org/ontology/conference-ontology.owl#next';
    readonly prefix_id_person_list_item = 'http://www.scholarlydata.org/';
    readonly length_prefix_id_person_list_item = this.prefix_id_person_list_item.length;

//Global array
    readonly persons = new Map();
    readonly in_proceedings = new Map();
    readonly organised_events = new Map();
    readonly organisations = new Map();
    readonly affiliations_during_events = new Map();

    constructor() {

    }

    initialize() {
        if (obj) {
            for (const i of obj) {
                const id = i['@id'];
                if (id) {
                    this.full_array_file.set(id, i);
                }
            }

            //On récup les person avec leurs infos
            for (const i of obj) {
                //On récup le type
                const type = i['@type'];
                if (type) {
                    //On regarde si c'est une personne
                    let isPerson = false;
                    for (const t of type) {
                        if (t === this.type_person) {
                            isPerson = true;
                            break;
                        }
                    }

                    //si c'est une personne, on parse les infos
                    if (isPerson) {
                        //On récup son id et le noeud de son nom
                        const id = i['@id'];
                        let name = i[this.key_name_person];

                        if (name) {
                            //On récup son nom
                            name = name[0]['@value'];
                            if (id && name) {
                                //Création de l'objet personne
                                let person = {
                                    name: name,
                                    mailbox: [],
                                    id_in_proceedings: [],
                                    affiliation_during_events: [],
                                    role_during_event: new Map(),
                                };

                                //On récup ses mails
                                if (i[this.key_mailbox_person]) {
                                    for (const mail of i[this.key_mailbox_person]) {
                                        const hash_mail = mail['@value'];
                                        if (hash_mail) {
                                            person.mailbox.push(hash_mail);
                                        }
                                    }
                                }

                                //On regarde si il a des "holdsRole"
                                if (i[this.key_holds_role_person]) {
                                    const holds_roles_person = i[this.key_holds_role_person];
                                    for (const hold_role_person of holds_roles_person) {
                                        //On récup l'id du hold role dans le document person
                                        const id_hold_role = hold_role_person['@id'];
                                        if (id_hold_role) {
                                            //On va chercher le hold role
                                            const hold_role = this.full_array_file.get(id_hold_role);
                                            if (hold_role) {
                                                let hold_role_to_add = {
                                                    id_with_role: [],
                                                    id_person_help_by: [],
                                                };

                                                //On récup ses roles
                                                const with_roles = hold_role[this.key_with_role_hold_role];
                                                if (with_roles && with_roles.length > 0) {
                                                    for (const r of with_roles) {
                                                        const id_with_role = r['@id'];
                                                        if (id_with_role) {
                                                            hold_role_to_add.id_with_role.push(id_with_role);
                                                        }
                                                    }
                                                }

                                                //On récup son "during"
                                                const during_hold_role = hold_role[this.key_during_hold_role];

                                                //On récup ses "help by"
                                                const help_by_hold_role = hold_role[this.key_is_help_by_hold_role];
                                                if (help_by_hold_role && help_by_hold_role.length > 0) {
                                                    for (const h of help_by_hold_role) {
                                                        const id_person_help_by = h['@id'];
                                                        if (id_person_help_by) {
                                                            hold_role_to_add.id_person_help_by.push(id_person_help_by);
                                                        }
                                                    }
                                                }

                                                person.role_during_event.set(id_hold_role, hold_role_to_add);
                                            }
                                        }
                                    }
                                }

                                //On regarde si il a des AffiliationDuringEvent
                                if (i[this.key_affiliation_during_event_person]) {
                                    const affiliations_during_event = i[this.key_affiliation_during_event_person];

                                    //On parcourt toutes ses affiliations
                                    for (const affiliation_during_event of affiliations_during_event) {
                                        //On récup l'id de l'affiliation
                                        const id_affiliation_during_event = affiliation_during_event['@id'];
                                        if (id_affiliation_during_event) {
                                            //On regarde si on a pas déjà enregistré l'affiliation during event
                                            const affiliation_during_event_globale = this.affiliations_during_events.get(id_affiliation_during_event);
                                            if (!affiliation_during_event_globale) {
                                                const obj_liaison_affiliation_organisation = this.full_array_file.get(id_affiliation_during_event);
                                                if (obj_liaison_affiliation_organisation) {
                                                    let affiliation_during_event_to_add = {
                                                        id_organisations: [],
                                                        with_role: [],
                                                        id_person_liees: [id],
                                                    };

                                                    //On récup les organisations
                                                    const organisations_obj_liaison = obj_liaison_affiliation_organisation[this.key_with_organisation];
                                                    if (organisations_obj_liaison) {
                                                        for (const organisation_obj_liaison of organisations_obj_liaison) {
                                                            //On récup l'id de l'organisation
                                                            const id_organisation = organisation_obj_liaison['@id'];
                                                            if (id_organisation) {
                                                                //On regarde si on l'a pas déjà enregistrée
                                                                if (!this.organisations.has(id_organisation)) {
                                                                    //On récup l'organisation
                                                                    const organisation = this.full_array_file.get(id_organisation);
                                                                    if (organisation) {
                                                                        //On récup le nom de l'organisation
                                                                        const name_organisation = organisation[this.key_name_organisation];
                                                                        if (name_organisation) {
                                                                            //On ajoute l'organisation
                                                                            this.organisations.set(id_organisation, {
                                                                                name: name_organisation,
                                                                                id_person_liees: [id],
                                                                            });

                                                                            affiliation_during_event_to_add.id_organisations.push(id_organisation);
                                                                        }
                                                                    }
                                                                }
                                                                else {
                                                                    //On récup l'objet de l'organisation
                                                                    const organisation = this.organisations.get(id_organisation);
                                                                    if (organisation) {
                                                                        //On ajoute la person à l'organisation
                                                                        organisation.id_person_liees.push(id);

                                                                        //On ajoute l'affiliation during event à la person
                                                                        affiliation_during_event_to_add.id_organisations.push(id_organisation);
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }

                                                    /*
                                                     TODO  with role => à faire ne marche pas
                                                     */
                                                    //On récup les "with role"
                                                    const with_roles = obj_liaison_affiliation_organisation[this.key_with_role_affiliation_during_event];
                                                    if (with_roles) {
                                                        //On parcours tous les with role
                                                        for (const with_role of with_roles) {
                                                            //On récup l'id
                                                            const id_with_role = with_role['@id'];
                                                            if (id_with_role) {
                                                                //On l'ajout au tableau
                                                                affiliation_during_event_to_add.with_role.push(id_with_role);
                                                            }
                                                        }
                                                    }

                                                    //On ajoute l'id de l'affiliaton during event à la person
                                                    person.affiliation_during_events.push(id_affiliation_during_event);

                                                    //On ajoute l'affiliation during event
                                                    this.affiliations_during_events.set(id_affiliation_during_event, affiliation_during_event_to_add);
                                                }
                                            }
                                            else {
                                                //On ajoute la personne dans l'affiliation
                                                affiliation_during_event_globale.id_person_liees.push(id);
                                                this.affiliations_during_events.set(id_affiliation_during_event, affiliation_during_event_globale);

                                                //On ajoute l'id de l'affiliaton during event à la person
                                                person.affiliation_during_events.push(id_affiliation_during_event);
                                            }
                                        }
                                    }
                                }

                                //On regarde si il a des inproceedings
                                //On parse l'url de la person
                                const indexOf = id.indexOf(this.prefix_id_person);
                                if (indexOf >= 0) {
                                    //On crée l'url pour accéder a l'objet temporaire qui lie la person avec le inproceed
                                    const id_liaison_in_proceedings = 'http://www.scholarlydata.org/' + id.substring(this.length_prefix_id_person);
                                    if (id_liaison_in_proceedings) {
                                        //On regarde si on en a un
                                        if (this.full_array_file.has(id_liaison_in_proceedings)) {
                                            //On récup le inproceedings de liaison
                                            const in_proceedings_obj = this.full_array_file.get(id_liaison_in_proceedings);
                                            if (in_proceedings_obj) {
                                                //On récup les made de la person
                                                const mades = in_proceedings_obj['http://xmlns.com/foaf/0.1/made'];
                                                if (mades) {
                                                    //On parcours les made de la person
                                                    for (const made of mades) {
                                                        //On récup l'id du inProceeding
                                                        const id_made = made['@id'];
                                                        if (id_made) {
                                                            //On regarde si on l'a pas déjà enregistré
                                                            if (!this.in_proceedings.has(id_made)) {
                                                                //On récup le inProceedings
                                                                const in_proceeding = this.full_array_file.get(id_made);

                                                                //On récup l'objet SameAs (pour avoir l'Organised Event)
                                                                const same_as_in_proceedings = in_proceeding[this.key_same_as_in_proceedings];
                                                                let id_organised_events = [];
                                                                if (same_as_in_proceedings && same_as_in_proceedings.length > 0) {
                                                                    //On récup l'id du same as
                                                                    const id_same_as_in_proceedings = same_as_in_proceedings[0]['@id'];
                                                                    if (id_same_as_in_proceedings) {
                                                                        //On récup l'objet de liaison entre le proceedings et l'organised event
                                                                        const obj_liaison_in_proceedings_organised_event = this.full_array_file.get(id_same_as_in_proceedings);
                                                                        if (obj_liaison_in_proceedings_organised_event) {
                                                                            //On récup la liste des events liés
                                                                            const relates_to_event = obj_liaison_in_proceedings_organised_event[this.key_relates_to_event];
                                                                            if (relates_to_event) {
                                                                                for (const relate_to_event of relates_to_event) {
                                                                                    const id_relate_to_event = relate_to_event['@id'];
                                                                                    if (id_relate_to_event) {
                                                                                        //On récup le organised event
                                                                                        const organised_event = this.full_array_file.get(id_relate_to_event);
                                                                                        if (organised_event) {
                                                                                            //On récup la date de début
                                                                                            const date_debut_organised_event = organised_event[this.key_date_start_organised_event];
                                                                                            const date_fin_organised_event = organised_event[this.key_date_end_organised_event];

                                                                                            //On ajoute l'organised event
                                                                                            this.organised_events.set(id_relate_to_event, {
                                                                                                date_start: date_debut_organised_event,
                                                                                                date_end: date_fin_organised_event,
                                                                                            });

                                                                                            id_organised_events.push(id_relate_to_event);
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }

                                                                //On récup les makers
                                                                let makers = [];
                                                                if (in_proceeding[this.key_maker_in_proceeding]) {
                                                                    for (const maker of in_proceeding[this.key_maker_in_proceeding]) {
                                                                        if (!maker) {
                                                                            continue;
                                                                        }

                                                                        const id_maker = maker['@id'];
                                                                        if (id_maker) {
                                                                            makers.push(id_maker);
                                                                        }
                                                                    }
                                                                }

                                                                //On récup les titres du in_proceedings
                                                                let titles_in_proceedings = [];
                                                                if (in_proceeding[this.key_titile_in_proceeding]) {
                                                                    for (const title of in_proceeding[this.key_titile_in_proceeding]) {
                                                                        if (!title) {
                                                                            continue;
                                                                        }

                                                                        const value_title = title['@value'];
                                                                        if (value_title) {
                                                                            titles_in_proceedings.push(value_title);
                                                                        }
                                                                    }
                                                                }

                                                                //On récup les créateurs du in_proceedings
                                                                let creators_in_proceedings = [];
                                                                if (in_proceeding[this.key_creator_in_proceeding]) {
                                                                    for (const creator of in_proceeding[this.key_creator_in_proceeding]) {
                                                                        if (!creator) {
                                                                            continue;
                                                                        }

                                                                        const id_creator = creator['@id'];
                                                                        if (id_creator) {
                                                                            creators_in_proceedings.push(id_creator);
                                                                        }
                                                                    }
                                                                }

                                                                //On récup les mots clefs du in_proceedings
                                                                let keywords_in_proceedings = [];
                                                                if (in_proceeding[this.key_keywords_in_proceedings]) {
                                                                    for (const keyword of in_proceeding[this.key_keywords_in_proceedings]) {
                                                                        if (!keyword) {
                                                                            continue;
                                                                        }

                                                                        const value_keyword = keyword['@value'];
                                                                        if (value_keyword) {
                                                                            keywords_in_proceedings.push(value_keyword);
                                                                        }
                                                                    }
                                                                }

                                                                //On récup les sujets du in_proceedings
                                                                let subjects_in_proceedings = [];
                                                                if (in_proceeding[this.key_subject_in_proceedings]) {
                                                                    for (const subject of in_proceeding[this.key_subject_in_proceedings]) {
                                                                        if (!subject) {
                                                                            continue;
                                                                        }

                                                                        const value_subject = subject['@value'];
                                                                        if (value_subject) {
                                                                            subjects_in_proceedings.push(value_subject);
                                                                        }
                                                                    }
                                                                }

                                                                //On récup les author list du in_proceedings
                                                                let array_author_list_item = new Map();
                                                                if (in_proceeding[this.key_author_list_in_proceedings]) {
                                                                    for (const author_list of in_proceeding[this.key_author_list_in_proceedings]) {
                                                                        if (!author_list) {
                                                                            continue;
                                                                        }

                                                                        //On récup l'id du author list
                                                                        const id_author_list = author_list['@id'];
                                                                        if (id_author_list) {
                                                                            //On récup l'objet de l'author list
                                                                            const obj_author_list = this.full_array_file.get(id_author_list);
                                                                            if (obj_author_list) {
                                                                                //On récup le premier item list
                                                                                let first_item_list = obj_author_list[this.key_first_item_author_list];
                                                                                if (first_item_list && first_item_list.length > 0) {
                                                                                    //On récup l'id du first list item
                                                                                    const id_first_item_list = first_item_list[0]['@id'];
                                                                                    if (id_first_item_list) {
                                                                                        //On extrait les list item
                                                                                        this.extractPersonListItem(id_first_item_list, array_author_list_item);
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }

                                                                //Création de l'objet in_proceeding
                                                                this.in_proceedings.set(id_made, {
                                                                    makers: makers,
                                                                    titles: titles_in_proceedings,
                                                                    creators: creators_in_proceedings,
                                                                    keywords: keywords_in_proceedings,
                                                                    subjects: subjects_in_proceedings,
                                                                    author_list: array_author_list_item,
                                                                    id_organised_events: id_organised_events,
                                                                });
                                                            }

                                                            //On ajoute l'id du inProceedings à la person
                                                            person.id_in_proceedings.push(id_made);
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                this.persons.set(id, person);
                            }
                        }
                    }
                }
            }

            //On parcourt les persons et on leur associe les affiliation during event
            this.persons.forEach((key, p) => {
                if (p.affiliation_during_events && p.affiliation_during_events.length > 0) {
                    let new_array_affiliation_during_event = new Map();
                    for (const id_affiliation_during_event of p.affiliation_during_events) {
                        this.affiliations_during_events.forEach((key, affiliation_during_event) => {
                            if (id_affiliation_during_event !== key) {
                                return;
                            }

                            new_array_affiliation_during_event.set(key, affiliation_during_event);
                            return false;
                        });
                    }

                    p.affiliation_during_events = new_array_affiliation_during_event;
                }
            });
        }

        fs.writeFile('./temp.json', ParsingJsonLd.mapToJson(this.persons));
    }

    static mapToJson(map) {
        return JSON.stringify([...map]);
    }

    extractPersonListItem(id_list_item, array_author_list) {
        const obj_item_list = this.full_array_file.get(id_list_item);
        if (obj_item_list) {
            //On récup le tableau des personnes
            const persons_list_item = obj_item_list[this.key_person_list_item];
            let id_persons_list_item = [];
            if (persons_list_item) {
                //On parcourt le tableau pour extraire les id des persons
                for (const person_list_item of persons_list_item) {
                    if (!person_list_item) {
                        continue;
                    }

                    let id_person_list_item = person_list_item['@id'];
                    if (!id_person_list_item) {
                        continue;
                    }

                    const indexOf = id_person_list_item.indexOf(this.prefix_id_person_list_item);
                    if (indexOf >= 0) {
                        id_persons_list_item.push('https://w3id.org/scholarlydata/' + id_person_list_item.substring(this.length_prefix_id_person_list_item));
                    }
                }
            }

            //On ajoute le item list
            array_author_list.set(id_list_item, id_persons_list_item);

            //On regarde si on a un next de list item
            if (obj_item_list[this.key_next_list_item]) {
                const next_list_item = obj_item_list[this.key_next_list_item];
                if (next_list_item && next_list_item.length > 0) {
                    const id_next_list_item = next_list_item[0]['@id'];
                    if (id_next_list_item) {
                        return this.extractPersonListItem(id_next_list_item, array_author_list);
                    }
                }
            }

            return array_author_list;
        }
    }
}