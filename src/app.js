import "./utils/jsgantt/jsgantt.js"
import { IfcViewerAPI } from 'web-ifc-viewer'
import { Mesh, MeshBasicMaterial, LineBasicMaterial, Color, EdgesGeometry } from 'three';
import {
  IFCSPACE,
  IFCOPENINGELEMENT,
  IFCWALLSTANDARDCASE,
  IFCWALL,
  IFCSTAIR,
  IFCCOLUMN,
  IFCSLAB,
  IFCROOF,
  IFCDOOR,
  IFCWINDOW,
  IFCFURNISHINGELEMENT,
  IFCMEMBER,
  IFCPLATE
  // IFCFOOTING,
  // IFCFURNISHINGELEMENT
  // IFCSTAIRFLIGHT,
  // IFCRAILING
} from 'web-ifc'

import {IFC4D} from './sequence/Ifc4D.js'

let model
let fills = []
let ifc4D
var jsGanttJson
let isUserFileLoaded = false;
let isExampleFileLoaded = false;

let container = document.getElementById('viewer-container')
let viewer = new IfcViewerAPI({ container })
viewer.IFC.setWasmPath("../static/wasm/")

const camera = viewer.IFC.context.ifcCamera;

//viewer.IFC.loader.ifcManager.useWebWorkers(true, '../static/web-workers/IFCWorker.js')

/* Styling Model */
const lineMaterial = new LineBasicMaterial({ color: 0x555555 })
const baseMaterial = new MeshBasicMaterial({ color: 0xffffff, side: 2 })
viewer.shadowDropper.darkness = 1.5
viewer.grid.setGrid()
viewer.axes.setAxes()
async function createFill(modelID) {
  const wallsStandard = await viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCWALLSTANDARDCASE, false);
  const walls = await viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCWALL, false);
  const stairs = await viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCSTAIR, false);
  const columns = await viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCCOLUMN, false);
  const roofs = await viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCROOF, false);
  const slabs = await viewer.IFC.loader.ifcManager.getAllItemsOfType(modelID, IFCSLAB, false);
  const ids = [...walls, ...wallsStandard, ...columns, ...stairs, ...slabs, ...roofs];
  const material = new MeshBasicMaterial({ color: 0x555555 });
  material.polygonOffset = true;
  material.polygonOffsetFactor = 10;
  material.polygonOffsetUnits = 1;
  fills.push(viewer.filler.create(`${modelID}`, modelID, ids, material));
};


/* Load Model, 4D Data & Gantt Chart */
const loadAllData = async (ifcURL) => {
  await loadModel(ifcURL)
  await loadScheduleData()
  await loadGanttChart()
  console.log("Data loaded")
}


/* Load Model */
const loadModel = async (url) => {
  viewer.IFC.loader.ifcManager.parser.setupOptionalCategories({
    [IFCSPACE]: false,
    [IFCOPENINGELEMENT]: false
  });
  model = await viewer.IFC.loadIfcUrl(url, true);
  file_id = model.modelID;
  model.material.forEach(mat => mat.side = 2);
  await createFill(model.modelID);
  viewer.edges.create(`${model.modelID}`, model.modelID, lineMaterial, baseMaterial);
  // viewer.edges.toggle(`${model.modelID}`);
  await viewer.shadowDropper.renderShadow(model.modelID);
};


function loadGanttChart(){
  var g = new JSGantt.GanttChart(document.getElementById('GanttChartDIV'), 'week');
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
  console.log(jsGanttJson)
  JSGantt.parseJSONString(jsGanttJson, g);
  console.log("Gantt Chart Loaded")
  return g.Draw();
};
/* 4D Data Retrieval */
const loadScheduleData = async () => {
  ifc4D = new IFC4D(model.modelID, viewer.IFC.loader.ifcManager);
  await ifc4D.loadScheduleData();
  jsGanttJson = JSON.stringify(ifc4D.jsGanttJson)
}





// 3D Data
async function writeQuantities(modelID,props,table){
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

function writeProperties(props){
  document.getElementById("Name").innerHTML = props["Name"]["value"];
  let description = props["Description"]
  if (description){
      document.getElementById("Description").innerHTML = description["value"];
  }
  document.getElementById("GlobalID").innerHTML = props["GlobalId"]["value"];
  document.getElementById("PredefinedType").innerHTML = props["PredefinedType"]["value"];
  document.getElementById("ObjectType").innerHTML = props["ObjectType"]["value"];
}

async function loadObjectData(result) {  
  const { modelID, id } = result;
  let props = await viewer.IFC.getProperties(modelID, id, true);
  var tableQuantities = document.getElementById("tableQuantities");
  clear_table(tableQuantities)
  writeQuantities(modelID,props,tableQuantities)
  writeProperties(props)
};

function clear_table(table){
  while(table.hasChildNodes())
  {
     table.removeChild(table.firstChild);
  }
};




// App buttons and functionnality
const ganttWrapperDiv = document.getElementById("floatingDiv")
ganttWrapperDiv.style.display = "none"
const exampleButton = document.getElementById("load-test-example")
const ganttButton = document.getElementById("display-gantt")
const sectionButton = document.getElementById("display-sections")
document.getElementById("viewer-container").style.cursor = "grab"
const userInput = document.getElementById("file-input");

userInput.addEventListener("change",
  async (changed) => {
    if (isExampleFileLoaded){
      return;
    }
    else{
      const file = changed.target.files[0];
      const ifcURL = URL.createObjectURL(file);
      viewer.IFC.loadIfcUrl(ifcURL);
      isUserFileLoaded = true;
    }
  },
);

sectionButton.onclick = async function(){
  viewer.toggleClippingPlanes()
  if (viewer.clipper.active){
    document.getElementById("viewer-container").style.cursor = "crosshair"
  }
  else {
    document.getElementById("viewer-container").style.cursor = "grab"
  }
  
}

exampleButton.onclick = async function (){
  if (isUserFileLoaded){
    alert("A File is already loaded. Please refresh the page and click on `load example` ")
  }
  else {
    let ifcURL = "./Model/MAD_SCIENTIST_212.ifc";
    await loadAllData(ifcURL)
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
    viewer.removeClippingPlane();
    viewer.dimensions.delete();
  }
  if (event.code === 'Escape') {
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
    loadObjectData(result);
  }
};