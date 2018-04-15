/**
 * Created by pierremarsot on 23/01/2017.
 */
import {Http} from '@angular/http';
import {Injectable} from '@angular/core';
import {RequestManager} from './request-manager.service';
import {UUID} from 'angular2-uuid';

import '../../assets/webworker/manager-web-worker.js';
declare var FrontRunner: any;

@Injectable()
export class HylarManager {

    private urlJsonLd = 'http://sympozer.liris.cnrs.fr/hylar/ontology/export.json'; // 'http://dev.sympozer.com/conference/www2012/file-handle/writer/jsonld';
    private url_server = 'http://sympozer.liris.cnrs.fr/hylar/ontology/export.json';
    private tasks: any;
    private worker: any;
    private callback_classify: any;

    constructor(private http: Http, private managerRequest: RequestManager) {
        this.worker = FrontRunner('./assets/webworker/WebWorkerHylar.js');
        this.registerEvents();
        this.tasks = [];
    }

    private registerEvents = () => {
        const that = this;
        this.worker.on('classify', function (data) {
            switch (typeof data) {
                case 'boolean':
                    that.callback_classify = null;
                    break;
                default:
                    if (that.callback_classify) {
                        that.callback_classify(data);
                    }
                    break;
            }
        });

        that.worker.on('query', function (data) {
            const {uuid, results} = data;
            if (!uuid) {
                return false;
            }

            const task = that.findTask(uuid);
            if (!task || !task.callback) {
                return false;
            }

            if (!results) {
                return task.callback(null);
            }

            return task.callback(results);
        });

        that.worker.on('import', function (response) {
            const {uuid, data} = response;
            console.log('end import');
            console.log(data);
            if (!uuid) {
                return false;
            }

            const task = that.findTask(uuid);
            if (!task || !task.callback) {
                return false;
            }

            if (!data) {
                return task.callback(null);
            }

            return task.callback(data);
        });
    }

    private findTask = (uuid) => {
        if (!uuid || uuid.length === 0) {
            return null;
        }

        if (!this.tasks || this.tasks.length === 0) {
            return null;
        }

        for (const task of this.tasks) {
            if (!task) {
                continue;
            }

            if (task.uuid === uuid) {
                return task;
            }
        }

        return null;
    }

    importData = (callback) => {
        console.log('import data');
        const that = this;
        this.managerRequest.get_json(this.url_server)
            .then((json) => {

                // On génère un uuid
                const uuid = UUID.UUID();

                // On save le callback
                that.tasks.push({
                    uuid: uuid,
                    callback: callback,
                });

                // On demande au worker d'hylar de faire la classification
                that.worker.send('import', {
                    data: json,
                    uuid: uuid,
                });
            });
    }

    classify = (callback) => {
        const that = this;
        this.managerRequest.get_json(this.urlJsonLd)
            .then((json) => {
                // On demande au worker d'hylar de faire la classification
                // console.log(json);

                that.callback_classify = callback;

                that.worker.send('classify', {
                    ontologyTxt: json,
                    mimeType: 'application/ld+json',
                    keepOldValues: false,
                });
            });
    }

    query = (query, callback) => {
        try {
            if (!callback ) {
                return false;
            }

            if (!query || query.length === 0) {
                return callback(null);
            }

            const uuid = UUID.UUID();

            this.tasks.push({
                uuid: uuid,
                callback: callback,
            });

            this.worker.send('query', {
                query: query,
                uuid: uuid,
            });

            return true;
        } catch (e) {
            return false;
        }
    }
}
