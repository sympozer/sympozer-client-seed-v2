import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import {Encoder} from '../../lib/encoder';


@Injectable()
export class ParticipantService {

  constructor(
      private http: Http,
      private encoder: Encoder
  ) {

  }

  defaultPerson = () => {
    return {
      publications: [],
      roles: [],
      publiConf: [],
      orgas: []
    };
  }

  generateRolesFromStream = (roles, stream) => {
    if (stream && stream['?idRole'] && stream['?label']) {
      const nodeLabel = stream['?label'];
      const nodeId = stream['?idRole'];

      if (nodeLabel && nodeId) {
        const label = nodeLabel.value;
        let id = nodeId.value;

        if (label && id) {
          id = this.encoder.encode(id);
          if (!id) {
            return false;
          }

          const find = roles.find((r) => {
            return r.id === id;
          });

          if (find) {
            return roles;
          }

          roles.push({
            label: label,
            id: id,
          });
        }
      }
    }

    return roles;
  }

  generateOrgasFromStream = (orgas, stream) => {
    if (stream && stream['?name'] && stream['?id']) {
      const nodeName = stream['?name'];
      const nodeId = stream['?id'];

      if (nodeName && nodeId) {
        const name = nodeName.value;
        let id = nodeId.value;

        if (name && id) {
          id = this.encoder.encode(id);
          if (!id) {
            return false;
          }

          const find = orgas.find((o) => {
            return o.id === id;
          });

          if (find) {
            return orgas;
          }

          orgas.push({
            name: name,
            id: id
          });
        }
      }
    }

    return orgas;
  }

  generatePublicationLinkFromStream = (publiConf, stream) => {
    if (stream && stream['?label'] && stream['?id']) {
      const nodeLabel = stream['?label'];
      const nodeId = stream['?id'];
      const nodeAbstract = stream['?abstract'];

      if (nodeLabel && nodeId && nodeAbstract) {
        const label = nodeLabel.value;
        let id = nodeId.value;
        const abstract = nodeAbstract.value;

        if (label && id && abstract) {
          id = this.encoder.encode(id);
          if (!id) {
            return false;
          }

          publiConf.push({
            label: label,
            id: id,
            abstract: abstract,
          });
        }
      }
    }

    return publiConf;
  }

  generatePersonFromStream = (person, stream) => {
    if (stream && stream['?a']) {
      if (!person) {
        person = this.defaultPerson();
      }

      const typeA = stream['?a'].value;

      switch (typeA) {
        default:
          break;
        case 'http://xmlns.com/foaf/0.1/name':
          const name = stream['?b'];
          if (!name) {
            break;
          }

          person.name = name.value;
          break;

        case 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type':
          const type = stream['?b'];
          if (!type) {
            break;
          }

          if (!person.types) {
            person.types = [];
          }

          person.types.push(type.value);
          break;

        case 'http://www.w3.org/2000/01/rdf-schema#label':
          const label = stream['?b'];
          if (!label) {
            break;
          }

          person.label = label;
          break;

        case 'http://www.w3.org/2002/07/owl#sameAs':
          const sameAs = stream.b;
          if (!sameAs) {
            break;
          }

          if (!person.sameAs) {
            person.sameAs = [];
          }

          person.sameAs.push(sameAs.value);
          break;

        case 'http://www.w3.org/ns/org#member':
          const member = stream['?b'];
          if (!member) {
            break;
          }

          if (!person.members) {
            person.members = [];
          }

          person.members.push(member.value);
          break;

        case 'http://xmlns.com/foaf/0.1/familyName':
          const familyName = stream['?b'];
          if (!familyName) {
            break;
          }

          person.familyName = familyName.value;
          break;

        case 'http://xmlns.com/foaf/0.1/givenName':
          const givenName = stream['?b'];
          if (!givenName) {
            break;
          }

          person.givenName = givenName.value;
          break;

        case 'http://xmlns.com/foaf/0.1/made':
          const made = stream['?b'];
          if (!made) {
            break;
          }

          if (!person.mades) {
            person.mades = [];
          }

          person.mades.push(made.value);
          break;

        case 'https://w3id.org/scholarlydata/ontology/conference-ontology.owl#hasAffiliation':
          const hasAffiliation = stream['?b'];
          if (!hasAffiliation) {
            break;
          }

          if (!person.hasAffiliations) {
            person.hasAffiliations = [];
          }

          person.hasAffiliations.push(hasAffiliation.value);
          break;

        case 'http://xmlns.com/foaf/0.1/mbox_sha1sum':
          const mail = stream['?b'];
          if (!mail) {
            break;
          }

          if (!person.mails) {
            person.mails = [];
          }

          person.mails.push(mail.value);
      }

      return person;
    }
  }
}
