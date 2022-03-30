import { 
	Mesh, 
	MeshBasicMaterial, 
	LineBasicMaterial, 
	Color, 
	EdgesGeometry, 
	MeshLambertMaterial,
} from 'three';
import { IfcViewerAPI } from 'web-ifc-viewer'
import {IFCAnimationDataFrame} from './components/IFC2AnimationDataFrame'
import {JSGanttTaskJson} from "./sequence/JSGanttTaskJson";
import "./utils/jsgantt/jsgantt.js"
import {FloatingPanel} from './components/FloatingPanel'
import {SlidingMenus} from './components/SlidingMenus'
import {AnimationControls} from './components/AnimationControls'
import {ProjectTree} from './components/ProjectTree'

let model
let isUserFileLoaded = false;
let isExampleFileLoaded = false;
var jsGanttJson
let animationSequenceFrame
let animationControls
let tree

let ganttWrapperDiv = document.getElementById("floatingDiv")
ganttWrapperDiv.style.display = "none"

let container = document.getElementById('viewer-container')
let viewer = new IfcViewerAPI({ container })
const ifc = viewer.IFC.loader.ifcManager;

viewer.IFC.setWasmPath("../static/wasm/")

//CAMERA - FOR TOGGLING FPS - TO DO
//const camera = viewer.IFC.context.ifcCamera;

//WEBWORKERS - to do
//viewer.IFC.loader.ifcManager.useWebWorkers(true, '../static/web-workers/IFCWorker.js')



/* Load Model, 4D Data & Gantt Chart */
const init = async (ifcURL) => {
  await loadModel(ifcURL)
  await loadScheduleData(document.getElementById('GanttChartDIV'), 0)
  await loadProjectTree()
}

let aggregation = {}


const getIds = async (TreeDict) => {
  for (let i = 0; i < TreeDict.length; i++) {
    if (TreeDict[i].type =='IFCPROJECT' || TreeDict[i].type =='IFCBUILDING' || TreeDict[i].type =='IFCBUILDINGSTOREY'){
      children = TreeDict[i].children
      childrenList = []
      for (let j = 0; j < children.length;j++ ){
        childrenList.push(children[j].expressID)
      }
      aggregation[TreeDict[i].expressID] = {'type':TreeDict[i].type, 'children':childrenList}
    }
    await getIds(TreeDict[i].children)
  }
  return aggregation
}

/* Load Model */
const loadModel = async (url) => {
  viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({
  });
  model = await viewer.IFC.loadIfcUrl(url, true);
  await viewer.shadowDropper.renderShadow(0);
  file_id = model.modelID;

  
    animationControls = new AnimationControls()
    animationControls.setIfcProductVisibilityTool(viewer.IFC.loader.ifcManager,model)


};

let ifcProject
let allIds

const loadProjectTree = async () => {
  await loadIFCTreeData()
  await setUpProjectBrowser()
}

async function setUpProjectBrowser(){
  const projectBrowser = document.getElementById('myUL');
  tree = new ProjectTree(viewer.IFC.loader.ifcManager, model)
  await tree.load(projectBrowser, ifcProject.expressID, ifcProject.type, ifcProject.children)
  let myBoxes = tree.getCheckBoxes()
  for (let i = 0; i < myBoxes.length; i++){
    myBoxes[i].onclick = loadBboxesFunctionality;
  }
}

async function loadIFCTreeData(){
  ifcProject = await viewer.IFC.getSpatialStructure(model.modelID);
  allIds = await getIds([ifcProject])
}

function loadBboxesFunctionality() {
 
  if (this.id != -1){
    if( 
      Object.keys(aggregation).includes(this.id) && aggregation[this.id].type == 'IFCBUILDINGSTOREY'){
      if (this.checked){
        tree.visibility.getCurrentVisibility("full-model-subset")
        tree.visibility.addToSubSet(aggregation[Number(this.id)].children,"full-model-subset")
        aggregation[Number(this.id)].children.forEach(item => 
          document.getElementById(item.toString()).checked = true
          )
      } 
      else {
         tree.visibility.hideItems(aggregation[Number(this.id)].children,"full-model-subset")
         aggregation[Number(this.id)].children.forEach(item => 
          document.getElementById(item.toString()).checked = false
          )
      }
    }
    else {
      if (this.checked){
        tree.visibility.getCurrentVisibility("full-model-subset")
        tree.visibility.addToSubSet([Number(this.id)],"full-model-subset")
  
      } 
      else {
         tree.visibility.hideItems([Number(this.id)],"full-model-subset")        
      }
    }

  }
}

/* 4D Data Retrieval */
const loadScheduleData = async (div, modelID) => {
	animationSequenceFrame = new IFCAnimationDataFrame(ifc)
	/* //FOR GANTT CHARTS */
	//Retrieve All Tasks
	await ifc.sequenceData.load(modelID)
	let tasks = ifc.sequenceData.tasks

	//Transform IFC Task Data to jsGantt-improved schema
	let jsGanttData = new JSGanttTaskJson()
	jsGanttJson = jsGanttData.getJsGanttTaskJson(tasks)
	jsGanttInputData = JSON.stringify(jsGanttJson)

	// Load Data into Gantt Chart
	await setGanttChartDiv(div,JSON.stringify(jsGanttJson) )	
	//FOR ANIMATIONS
	animationSequenceFrame = await animationSequenceFrame.getAnimationSequencefromWorkSchedule(0)
	lastTask = animationSequenceFrame[animationSequenceFrame.length-1];

}

const printDataExample = async () => {
	//await viewer.IFC.loader.ifcManager.utils.byType(file_id,"IfcSlab")  
};

function setGanttChartDiv(div, tasksJSON){
  var g = new JSGantt.GanttChart(div, 'week');
  g.setOptions({
      vCaptionType: 'Complete',  // Set to Show Caption : None,Caption,Resource,Duration,Complete,
      vQuarterColWidth: 36,
      vDateTaskDisplayFormat: 'day dd month yyyy', // Shown in tool tip box
      vDayMajorDateDisplayFormat: 'mon yyyy - Week ww',// Set format to dates in the "Major" header of the "Day" view
      vWeekMinorDateDisplayFormat: 'dd mon', // Set format to display dates in the "Minor" header of the "Week" view
      vLang: 'en',
      vShowTaskInfoLink: 1, // Show link in tool tip (0/1)
      vShowEndWeekDate: 0,  // Show/Hide the date for the last day of the week in header for daily
      vUseSingleCell: 10000, // Set the threshold cell per table row (Helps performance for large data.
      vFormatArr: ['Day', 'Week', 'Month', 'Quarter'], // Even with setUseSingleCell using Hour format on such a large chart can cause issues in some browsers,
      vShowRes: false, // Disable the resource column.
      vShowComp: false, // Disable the completion column.
      vUseToolTip: false, // Disable tooltips.
      vTotalHeight: 900,
  });
  JSGantt.parseJSONString(tasksJSON, g);
  return g.Draw();
};


// 3D Data
async function writeProductQuantities(modelID,props,table){
  for (let property_sets_index in props["psets"]){
      let property_sets = props["psets"][property_sets_index]
      if (property_sets["Quantities"]) {
          for (let quantity_reference in property_sets["Quantities"]) {
              const quantity_id = property_sets["Quantities"][quantity_reference]["value"]
              if(quantity_id){
                  let quantity = await viewer.IFC.getProperties(modelID, quantity_id);
                  let quantity_name = quantity["Name"]["value"]
                  let quantity_value = Object.values(quantity)[5]["value"]
                  var row = table.insertRow(-1);
                  var cell1 = row.insertCell(0);
                  var cell2 = row.insertCell(1);
                  cell1.innerHTML = quantity_name;
                  cell2.innerHTML = quantity_value;
              }
          }
      }
  }
};

function writeProductProperties(props){
  document.getElementById("Name").innerHTML = props["Name"]["value"];
  let description = props["Description"]
  if (description){
      document.getElementById("Description").innerHTML = description["value"];
  }
  document.getElementById("GlobalID").innerHTML = props["GlobalId"]["value"];
  document.getElementById("PredefinedType").innerHTML = props["PredefinedType"]["value"];
  document.getElementById("ObjectType").innerHTML = props["ObjectType"]["value"];
}

async function loadProductData(result) {  
  const { modelID, id } = result;
  let props = await viewer.IFC.getProperties(modelID, id, true);
  var tableQuantities = document.getElementById("tableQuantities");
  clear_table(tableQuantities)
  writeProductQuantities(modelID,props,tableQuantities)
  writeProductProperties(props)
};

function clear_table(table){
  while(table.hasChildNodes())
  {
     table.removeChild(table.firstChild);
  }
};



// App buttons and functionnality
const exampleButton = document.getElementById("load-test-example")
const ganttButton = document.getElementById("display-gantt")
const sectionButton = document.getElementById("display-sections")
const playSequence = document.getElementById("play-sequence")
const cumulateSequence = document.getElementById("cumulative-sequence")
const dateSequence = document.getElementById("date-sequence")
const sequenceMenu = document.getElementById("sequenceMenu")
const costingMenu = document.getElementById("costingMenu")
const userFileInput = document.getElementById("file-input");


/* 	//viewer.context.getScene().remove(model.mesh)
  //visibility example !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  walls = await ifc.utils.byType(0,"IfcWall")
  let wallIds = []
  for (let i = 0; i <walls.length; i++) {
    let wallID = walls[i].expressID
    wallIds.push(wallID)
  }
  //tree.visibility.hideItems(wallIds,"full-model-subset")
  console.log("Done my friend")  
 */


playSequence.onclick = async function(){
	animationControls.autoAnimation(document.getElementById('myRange'),document.getElementById('date-output'), animationSequenceFrame)
}

cumulateSequence.onclick = async function(){
	animationControls.CumulativeSliderControl(document.getElementById('myRange'),document.getElementById('date-output'), animationSequenceFrame)
}

dateSequence.onclick = async function(){
	animationControls.HighlightSliderControl(document.getElementById('myRange'),document.getElementById('date-output'), animationSequenceFrame)
}

userFileInput.addEventListener("change",
  async (changed) => {
    if (isExampleFileLoaded){
		alert("A File is already loaded. Please refresh the page")
    }
    else{
      const file = changed.target.files[0];
      const ifcURL = URL.createObjectURL(file);
	  init(ifcURL)
      isUserFileLoaded = true;
    }
  },
);

sectionButton.onclick = async function(){
  viewer.clipper.toggle()
  if (viewer.clipper.active){
	document.getElementById("viewer-container").classList.remove('moveRotateCursor')
    document.getElementById("viewer-container").classList.add('sectionCursor')
	sectionButton.innerHTML = "🔪 Hide"
  }
  else {
	sectionButton.innerHTML = "🔪 Cut"
	document.getElementById("viewer-container").classList.remove('sectionCursor')
	document.getElementById("viewer-container").classList.add('moveRotateCursor')
  }
  
}

exampleButton.onclick = async function (){
  if (isUserFileLoaded){
    alert("A File is already loaded. Please refresh the page and click on `load example` ")
  }
  else if (isExampleFileLoaded){
	alert("A File is already loaded. Please refresh the page and click on `load example` ")
  }
  else {
    let ifcURL = "./Model/programme.ifc";
    await init(ifcURL)
    isExampleFileLoaded = true;
  }
}
ganttButton.onclick = async function (){
  if (ganttWrapperDiv.style.display == "none"){
    ganttWrapperDiv.style.display = "block"
  }

}
const handleKeyDown = async (event) => {
  if (event.code === 'Delete') {
    viewer.clipper.deletePlane();
    viewer.dimensions.delete();
  }
  if (event.code === 'Escape') {
    viewer.IFC.selector.unpickIfcItems();
  }
  if (event.code === 'keyP') {
    viewer.IFC.selector.unpickIfcItems();
  }

}
window.onkeydown = handleKeyDown;

window.ondblclick = async () => {
  if (viewer.clipper.active) {
    viewer.clipper.createPlane();
  } else {
    const result = await viewer.IFC.selector.pickIfcItem(true);
    if (!result) return;
    loadProductData(result);
  }
};

//Make the DIV element draggagle:
new FloatingPanel(document.getElementById("floatingDiv"),document.getElementById("floatingDivHeader"))
new FloatingPanel(document.getElementById("productMenu"),document.getElementById("objectIconHeader"))

sequenceMenu.onclick = async function (){
	new SlidingMenus("sequenceMenu", "arrow")
}
costingMenu.onclick = async function (){
	new SlidingMenus("costingMenu", "arrow_2")
}

/* CURSORS */
document.getElementById("viewer-container").classList.add('moveRotateCursor')
document.getElementById("arrow").classList.add('moveSideCursor')
document.getElementById("arrow_2").classList.add('moveSideCursor')
document.getElementById("objectIconHeader").classList.add('moveCursor')