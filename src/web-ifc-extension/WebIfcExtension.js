import { IfcElements} from "../utils/ifc-elements.js";

class WebIfcExtension { 
    constructor() {
        this.elements = reverseElementMapping(IfcElements)
    }
    setIfcManager(ifcManager) {
        this.ifcManager = ifcManager
    }
    setFileId(fileId) {
        this.fileId = fileId;
    }

    is_a(line, entity_class){
        /* Returns the entity name 
        If a entity name is passed, returns a boolean to check if the entity is of the same class ( does not consider parent classes ) */
        if (entity_class){
            var test = false;
            if (IfcElements[line.type] === entity_class.toUpperCase()){
                test = true;
            }
            return test
        }
        else {
            return IfcElements[line.type]
        }
    }

    by_type(entity_class){
        /* Returns all entities of the chosen class */
        let entities_ids = this.entities_ids_by_type(entity_class);
        if (entities_ids !== null){
            let items = [];
            for (let i = 0; i < entities_ids.size(); i++){
                let entity_id = entities_ids.get(i)
                if (entity_id !==0){
                    let entity = this.by_id(entity_id)
                    items.push(entity);
                }
                else {
                    console.log("No Entities Found")
                    return
                }
            }
            return items;
        }
    }
    
    by_id(id){ 
        /* Returns the entity by Id search */
        let entity = this.ifcManager.ifcAPI.GetLine(this.fileId, id)
        return entity;
    }

    entities_ids_by_type(entity_class){
        /* Returns the entities Ids of a Given Ifc Class */
        let entities_ids = this.ifcManager.ifcAPI.GetLineIDsWithType(this.fileId, Number(this.elements[entity_class.toUpperCase()]));
        return entities_ids
    }
}
const reverseElementMapping = (obj) => {
    const reverseElement = {};
    Object.keys(obj).forEach(key => {
        reverseElement[obj[key]] = key;
    })
    return reverseElement;
}

export {WebIfcExtension}