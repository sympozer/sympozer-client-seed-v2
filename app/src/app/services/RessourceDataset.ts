/**
 * Created by pierremarsot on 25/04/2017.
 */
export class RessourceDataset {
    private types = [];
    constructor(){
        this.types = ["Panel", "Session", 'Talk', 'Tutorial', 'Workshop'];
    }
    extractType(type, label){
        switch(typeof type){
            case "object":
                for(const t of type){
                    const r = this.parseStringType(t);
                    if(r !== null){
                        return r;
                    }
                }

                return null;
            case "string":
                return this.parseStringType(type);
            default:
                return null;
        }
    }

    private parseStringType(type){

        if(!type || type.length === 0){
            return null;
        }

        console.log(type);

        if(type.includes('#')){
            const tab = type.split('#');
            if (tab.length !== 2) {
                return null;
            }

            type = tab[1];
            type.replace('>', '');

            if (!type || type.length === 0) {
                return null;
            }
            console.log(type);
        }

        //On regarde si le type n'est pas déjà présent dans le label
        /*if(label.includes(type)){
            return null;
        }*/

        type = type.toLowerCase();

        for(let t of this.types){
            const t_lower = t.toLowerCase();
            if(t_lower === type){
                return t;
            }
        }

        return null;
    }

    isIncludeIntoLabel(type, label){
        type = type.toLowerCase();
        label = label.toLowerCase();
        return label.includes(type);
    }
}