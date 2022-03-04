sequence_type_map = {
    null: "FS",
    "START_START": "SS",
    "START_FINISH": "SF",
    "FINISH_START": "FS",
    "FINISH_FINISH": "FF",
    "USERDEFINED": "FS",
    "NOTDEFINED": "FS",
}
class JSGanttTaskJson { 
    constructor() {
        this.workSchedule = null
        this.jsWorkSchedule = []
    }
    setTaskSource = (source) => {
        this.workSchedule = source
    }
    getJsGanttTaskJson(source){
        this.setTaskSource(source)
        for (let taskID in this.workSchedule){
            this.createNewTaskJson(this.workSchedule, taskID)
        }
        return this.jsWorkSchedule
    }
    createNewTaskJson = (scheduleData, taskID)  => {
        let task = scheduleData[taskID]
        if (task.Nests[0] > 0 ){
        }
        let data
        data = {
          "pID": task.Id.toString(),
          "pName": task.Name,
          "pStart":  ((task.TaskTime !== "") ? task.TaskTime.ScheduleStart.value : "" ),
          "pEnd": ((task.TaskTime !== "") ? task.TaskTime.ScheduleFinish.value : "" ),
          "pPlanStart": ((task.TaskTime !== "") ? task.TaskTime.ScheduleStart.value : "" ),
          "pPlanEnd": ((task.TaskTime !== "") ? task.TaskTime.ScheduleFinish.value : "" ),
          "pComp": 0,
          "pMile": ((task.IsMilestone == "T") ? 1 : 0 ),
          "pGroup": ((task.IsNestedBy[0] > 0) ? 1 : 0 ), 
          "pParent": ((task.Nests[0] > 0 ) ? task.Nests[0] : 0),
          "pOpen": 1,
          "pCost": 1,
        } 
        if (task.TaskTime != "" && task.TaskTime.IsCritical != null && task.TaskTime.IsCritical.value == 'T') {
            data["pClass"] = "gtaskred"
        }
        else if (data["pGroup"] == 1 ) {
            data["pClass"] = "ggroupblack"
        }
        else if (task.IsMilestone == "T") {
            data["pClass"] = "gmilestone"
        }
        else {
            data["pClass"] = "gtaskblue"
        }
        if (task.IsSucessorFrom != null){
            for (let index in task.IsSucessorFrom){
                let relSequence = task.IsSucessorFrom[index].Rel
                let sequenceType = relSequence.SequenceType.value
                let relatingProcess = relSequence.RelatingProcess.value
                sequenceType = sequence_type_map[sequenceType]
                let relData = relatingProcess.toString().concat(sequenceType)
                data["pDepend"] = relData
            }
        }
        this.jsWorkSchedule.push(data);
        for (let relatedObjectIndex in task.IsNestedBy){
        let taskID = task.IsNestedBy[relatedObjectIndex]
        this.createNewTaskJson(scheduleData, taskID)
    }
      }
}

export {JSGanttTaskJson}