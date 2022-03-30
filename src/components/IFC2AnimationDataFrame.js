class IFCAnimationDataFrame { 
    constructor(ifcManager) {
        this.ifc = ifcManager
    }

    purge(){
        this.ifc = null
    }

    async getAnimationSequencefromWorkSchedule(modelID) {	
        let animationSequence = {};
        let sequenceData = await this.ifc.getSequenceData(modelID);
        for (let index in sequenceData.tasks) {
            let task = sequenceData.tasks[index];
            // console.log("task: ",task)
            if (!task.Outputs.length){continue}
            else {
                animationSequence[task.Id] = {
                                            'ScheduleStart': Date.parse(task.TaskTime.ScheduleStart.value), 
                                            'Outputs': task.Outputs,
                                            'Cumulative': [],
                                        };
                
            }
        }
        let orderedTasks = this.orderTasks(animationSequence);
        let AnimationDataFrame = this.createCumulativeList(orderedTasks);
        this.purge()
        return AnimationDataFrame
    }

    orderTasks(dict){
    // Create items array
    var items = Object.keys(dict).map((key) => {
        return [key, dict[key]['ScheduleStart'], dict[key]["Outputs"]];
    });
    items.sort((first, second) => {
        return first[1] - second[1];
    });
    return items;
    }

    createCumulativeList(sequence){
        let cumulative = [];
        for (let index in sequence){
            let task = sequence[index];
            const myOutputs = task[2];
            cumulative = [...cumulative, ...myOutputs];
            sequence[index].push(cumulative);
        }
        return sequence
    }
}

export {IFCAnimationDataFrame}