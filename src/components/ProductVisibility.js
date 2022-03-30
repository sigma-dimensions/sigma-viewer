import { 
	MeshLambertMaterial,
} from 'three';


class ProductVisibility { 

    constructor(ifcManager, ifcModel) {
        this.ifc = ifcManager
        this.scene = ifcModel.parent
        this.allIDs = this.getAllIds(ifcModel);
        this.replaceOriginalModelBySubset(ifcModel);
        this.setHidingMaterial(0x00dd00)
        this.setLogisticsMaterial(0x00dd00)
        this.checkListed = this.allIDss
        this.unselected = this.allIDs - this.checkListed
    }

    getCurrentVisibility(customID) {
        this.ifc.getSubset(0,undefined,customID)
    }
    
    getAllIds(ifcModel) {
	return Array.from(
		new Set(ifcModel.geometry.attributes.expressID.array),
	);
}
    setHidingMaterial(color){
        this.hidingMaterial = this.createMaterial(color)
    }
    setLogisticsMaterial(color){
        this.constructionOuputMaterial = this.createMaterial(color)
    }

    hideItems(ids, susbsetID){
        this.ifc.removeFromSubset(0,ids,susbsetID)
    }

    removeFullModelSubset(ID){
        return this.ifc.createSubset({
            modelID: 0,
            ids: [],
            applyBVH: true,
            scene: this.scene,
            removePrevious: true,
            customID: ID,
        });
    }

    newSubset(allIDs) {
        return this.ifc.createSubset({
            modelID: 0,
            ids: allIDs,
            applyBVH: true,
            scene: this.scene,
            removePrevious: true,
            customID: 'full-model-subset',
        });
    }
    replaceOriginalModelBySubset(ifcModel) {
        this.newSubset(this.allIDs);
        ifcModel.removeFromParent();
    }



    filterSubset(currentIds) {
        return this.ifc.createSubset({
            modelID: 0,
            ids: currentIds,
            applyBVH: true,
            scene: this.scene,
            removePrevious: true,
            customID: customID,
        });
    }
    


    removeFromSubset(ids, material, subsetID){
        this.ifc.removeFromSubset({
            modelID: 0,
            ids: ids,
            customID: subsetID,
            material: material,
        });
    }

    addToSubSet(ids, subsetID){
        this.ifc.createSubset({
            modelID: 0,
            ids: ids,
            scene: this.scene,
            removePrevious: false,
            customID: subsetID,
        });
    }

    createMaterial(color){
        return new MeshLambertMaterial({
            transparent: true,
            opacity: 0.07,
            color: color
        });
    }


    highlightProducts(ids) {
        this.ifc.createSubset({
            modelID: 0,
            ids: ids,
            material: this.constructionOuputMaterial,
            scene: this.scene,
            removePrevious: false,
            customID:"",
        });
    }

    showProducts(ids) {
        this.ifc.removeFromSubset(0,ids,"",this.constructionOuputMaterial)
        this.ifc.createSubset({
            modelID: 0,
            ids: ids,
            material: undefined,
            scene: this.scene,
            removePrevious: true,
            customID: "Original"
        });
    }

    showTasks(ids) {
        //this.ifc.clearSubset(ids,undefined,"Original")
        //this.addToSubSet(ids, undefined, true, "Original")
        this.ifc.removeFromSubset(0,ids,this.constructionOuputMaterial,"HIGHLIGHT")
        this.ifc.createSubset({
            modelID: 0,
            ids: ids,
            material: undefined,
            scene: this.scene,
            removePrevious: true,
            customID: "Original"
        });
    }
}

export {ProductVisibility}