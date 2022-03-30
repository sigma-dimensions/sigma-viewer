import {ProductVisibility} from './ProductVisibility'

class AnimationControls { 

    constructor() {
        this.timeLap = 1000
    }
    setIfcProductVisibilityTool(ifcManager, ifcModel) {
        this.productVisibility = new ProductVisibility(ifcManager, ifcModel)
    }
    setSlider(slider, start, min, max){
        slider.value = start;
        slider.min = min;
        slider.max = max -1;
    }

    async autoAnimation(slider, outputDate, sequenceFrames){
        this.productVisibility.removeFullModelSubset('full-model-subset')
        let allIds =sequenceFrames[sequenceFrames.length-1][3]
        this.setSlider(slider, 0, 0, sequenceFrames.length);
        for(let id = 0; sequenceFrames.length; id++) {
            let ids = sequenceFrames[id][3];
            this.productVisibility.highlightProducts(allIds)
            setTimeout(() => {
                slider.value = id;  
                outputDate.innerHTML = "Current Date: " + new Date(sequenceFrames[id][1]);
                this.productVisibility.showProducts(ids);
            }, id*this.timeLap);
        }
    }

    async  CumulativeSliderControl(slider, outputDate, sequenceFrames){
        this.productVisibility.removeFullModelSubset('full-model-subset')
        let allIds =sequenceFrames[sequenceFrames.length-1][3]
        this.setSlider(slider, 0,0, sequenceFrames.length);
        slider.addEventListener('input',  () => {
            outputDate.innerHTML = "Current Date: " +new Date(sequenceFrames[slider.value][1]);
            let currentTask = sequenceFrames[slider.value];
            if (currentTask){
                let cumulativeIds = currentTask[3];
                this.productVisibility.highlightProducts(allIds)
                this.productVisibility.showProducts(cumulativeIds);
            }		
            }, false);
    }

    async  HighlightSliderControl(slider, outputDate, sequenceFrames){
        this.productVisibility.removeFullModelSubset('full-model-subset')
        let allIds =sequenceFrames[sequenceFrames.length-1][3]
        this.setSlider(slider, 0,0, sequenceFrames.length);
        slider.addEventListener('input',  () => {
            outputDate.innerHTML = "Current Date: " + new Date(sequenceFrames[slider.value][1]);
            let currentTask = sequenceFrames[slider.value];
            if (currentTask){
                let currentIds = currentTask[2];
                this.productVisibility.highlightProducts(allIds)
                this.productVisibility.showProducts(currentIds);
            }		
            }, false);
    }

    displayOutputObjects(ids){
        //this.productVisibility.highlightProducts(ids);
        this.productVisibility.showObjects(ids);
    }

    CumulativeControl(ids){
        //this.productVisibility.highlightProducts(ids);
        this.productVisibility.showTasks(ids);
    }

    DateControl(ids){
        this.productVisibility.highlightProducts(ids);
        this.productVisibility.showCurrentTask(ids);
    }
}

export {AnimationControls}