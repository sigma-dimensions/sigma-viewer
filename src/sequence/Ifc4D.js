import { WebIfcExtension } from "../web-ifc-extension/WebIfcExtension.js";
import {JSGanttTaskJson} from "./JSGanttTaskJson.js";

class IFC4D { 
    constructor(file_id, ifcManager) {
        this.scheduleData = {};
        this.webIfcTool = new WebIfcExtension();
        this.webIfcTool.setIfcManager(ifcManager);
        this.webIfcTool.setFileId(file_id)
        window.scheduleData = this.scheduleData
        this.jsGanttJSON = []
    }
    
    async loadScheduleData(){
        await this.loadTasks()
        await this.loadTaskSequence()
        await this.loadTaskOutputs()
        await this.loadTaskNesting()
        await this.loadTaskOperations()
        await this.loadJsGanttData()
    }
    async loadTasks(){
        let tasks = this.webIfcTool.by_type("IfcTask")
        console.log(tasks)
        for (let i = 0; i < tasks.length; i++){
            let task = tasks[i]
            this.scheduleData[task.expressID] = {   
                "Id": task.expressID,
                "Name": task.Name.value,
                "TaskTime": ((task.TaskTime) ? this.webIfcTool.by_id(task.TaskTime.value) : ""), 
                "Identification": task.Identification.value,
                "IsMilestone": task.IsMilestone.value,
                "IsPredecessorTo": [],
                "IsSucessorFrom": [],
                "Inputs": [],
                "Resources": [],
                "Outputs": [],
                "Controls": [],
                "Nests": [],
                "IsNestedBy": [],
                "OperatesOn":[],
            }
        }
    }

    async loadTaskSequence(){
        let rel_sequence = await this.webIfcTool.entities_ids_by_type("IfcRelSequence")
        // Get Sequence Data
        for (let i = 0; i < rel_sequence.size(); i++){
            let rel_id = rel_sequence.get(i);
            if (rel_id !==0){
                    let rel = await this.webIfcTool.by_id(rel_id);
                    let related_process = rel.RelatedProcess.value;
                    let relating_process = rel.RelatingProcess.value;
                    this.scheduleData[relating_process]["IsPredecessorTo"].push(rel.expressID)
                    //this.scheduleData[related_process]["IsSucessorFrom"].push(rel.expressID)
                    let successorData = {
                        "RelId": rel.expressID,
                        "Rel": rel
                    }
                    this.scheduleData[related_process]["IsSucessorFrom"].push(successorData)
            }
        }
    }

    async loadTaskOutputs(){
        let rel_assigns_to_product = await this.webIfcTool.entities_ids_by_type("IfcRelAssignsToProduct");
        // Get Output Objects
        for (let i = 0; i < rel_assigns_to_product.size(); i++){
            let rel_id = rel_assigns_to_product.get(i);
            if (rel_id !==0){
                let rel = this.webIfcTool.by_id(rel_id);
                let relating_product = this.webIfcTool.by_id(rel.RelatingProduct.value);
                let related_object = this.webIfcTool.by_id(rel.RelatedObjects[0].value); 
                if (this.webIfcTool.is_a(related_object, "IfcTask")) {
                    this.scheduleData[related_object.expressID]["Outputs"].push(relating_product.expressID);
                }
            }
        }
    }

    async loadTaskNesting(){
        let rel_nests = await this.webIfcTool.entities_ids_by_type("IfcRelNests");
        // Get Nested Tasks
        for (let i = 0; i < rel_nests.size(); i++){
            let rel_id = rel_nests.get(i);
            if (rel_id !==0){
                let rel = this.webIfcTool.by_id(rel_id);
                let relating_object = this.webIfcTool.by_id(rel.RelatingObject.value);
                let related_objects = rel.RelatedObjects
                if (this.webIfcTool.is_a(relating_object, "IfcTask")) {
                    var arrayLength = related_objects.length;
                    for (var object_index = 0; object_index < arrayLength; object_index++) {
                        this.scheduleData[relating_object.expressID]["IsNestedBy"].push(related_objects[object_index].value)
                        this.scheduleData[related_objects[object_index].value]["Nests"].push(relating_object.expressID)
                    }
                }
            }
        }

    }

    async loadTaskOperations(){
        let rel_assigns_to_process = await this.webIfcTool.entities_ids_by_type("IfcRelAssignsToProcess");
        // Get Tasks Operations
        for (let i = 0; i < rel_assigns_to_process.size(); i++){
            let rel_id = rel_assigns_to_process.get(i);
            if (rel_id !==0){
                let rel = this.webIfcTool.by_id(rel_id);
                let relating_process = this.webIfcTool.by_id(rel.RelatingProcess.value);
                let related_objects = rel.RelatedObjects
                if (this.webIfcTool.is_a(relating_process, "IfcTask")) {
                    var arrayLength = related_objects.length;
                    for (var object_index = 0; object_index < arrayLength; object_index++) {
                        this.scheduleData[relating_process.expressID]["OperatesOn"].push(related_objects[object_index].value)
                        console.log(relating_process.expressID)
                        console.log("Has Operations")
                    }
                }
            }
        }
    }
    async loadJsGanttData(){
        let jsGanttData = new JSGanttTaskJson()
        this.jsGanttJson = jsGanttData.getJsGanttTaskJson(this.scheduleData)
    }
}

export {IFC4D}