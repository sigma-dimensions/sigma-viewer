import {ProductVisibility} from './ProductVisibility'

class ProjectTree { 

    constructor(ifcManager, ifcModel) {
        this.ifc = ifcManager
        this.checkboxes = []
        this.checking = []
        this.unchecked = []
        this.visibility = new ProductVisibility(ifcManager, ifcModel)
    }   

    getCheckBoxes(){ 
        return this.checkboxes
    }
    hideAll(){
        this.ifc.removeFromSubset(0,this.checked,"full-model-subset")
    }

    async load(parent, expressID, text, children){
        await this.createNode(parent, expressID, text, children)
        this.generateTreeLogic()
    }

    async createNode(parent, expressID, text, children) {
        let name
        if (expressID != -1){
            let product = await this.ifc.utils.byId(0,expressID)
            if (product.Name != null){
                name = product.Name.value
            }
            else {
                name = ""
            }
        }
        else{
            name = ""
        }

        if(children.length === 0) {
            await this.createLeafNode(parent, expressID, text, name);
        } else {
            // If there are multiple categories, group them together
            const grouped = this.groupCategories(children);
            await this.createBranchNode(parent, expressID, text, name, grouped);
        }
    }
    
    async createBranchNode(parent, expressID, text, name, children) {
    
        // container
        const nodeContainer = document.createElement('li');
        parent.appendChild(nodeContainer);

        // title
        const title = document.createElement('span');
        title.textContent = `${text} (${name})`
        title.classList.add('caret');
        nodeContainer.appendChild(title);
            
        // checkbox

        const titleCheckbox = document.createElement('label');
        titleCheckbox.classList.add('checkboxContainer');
        const checkBox = document.createElement('input');
        checkBox.type ="checkbox"
        checkBox.checked = "checked"
        checkBox.id = expressID.toString()
        this.checkboxes.push(checkBox);
       /*  checkBox.onclick = this.myFunction(checkBox) */
/*         async function(){
            if (checkBox.checked){
                console.log(checkBox.id)
                this.myFunction(checkBox)
            }
            else if (!checkBox.checked) {
                this.myFunction(checkBox)
                console.log("WE UNCHECKED:", checkBox.id)
            }
        } */
        checkBox.classList.add('checkbox');
        const checkmark = document.createElement('span');
        checkmark.classList.add('checkmark');
        titleCheckbox.appendChild(checkBox);
        titleCheckbox.appendChild(checkmark);
        nodeContainer.appendChild(titleCheckbox);
        
        // children
        const childrenContainer = document.createElement('ul');
        childrenContainer.classList.add('nested');
        nodeContainer.appendChild(childrenContainer);
         for (let i = 0; i < children.length;i++){
            let child = children[i]
            await this.createNode(childrenContainer, child.expressID, child.type, child.children )
        }
    }
    
    async createLeafNode(parent, expressID, text, name) {
        const leaf = document.createElement('li');
        leaf.textContent = `${text} (${name})`
        leaf.classList.add('leaf');
        // checkbox

        const titleCheckbox = document.createElement('label');
        titleCheckbox.classList.add('checkboxContainer');
        const checkBox = document.createElement('input');
        checkBox.name = "tree-box"
        checkBox.type ="checkbox"
        checkBox.checked = true
        checkBox.id = expressID.toString()
        this.checkboxes.push(checkBox);
        checkBox.classList.add('checkbox');

/*         checkBox.onclick = async function(){
            if (checkBox.checked){
                console.log(checkBox.id)
            }
            else if (!checkBox.checked) {
                console.log("WE UNCHECKED:", checkBox.id)
            }
        } 
*/


        const checkmark = document.createElement('span');
        checkmark.classList.add('checkmark');
        titleCheckbox.appendChild(leaf);
        titleCheckbox.appendChild(checkBox);
        titleCheckbox.appendChild(checkmark);

        

        parent.appendChild(titleCheckbox);

    }
    
     groupCategories(children) {
        const types = children.map(child => child.type);
        const uniqueTypes = new Set(types);
        if (uniqueTypes.size > 1) {
            const uniquesArray = Array.from(uniqueTypes);
            children = uniquesArray.map(type => {
                return {
                    expressID: -1,
                    type: type + 'S',
                    children: children.filter(child => child.type.includes(type)),
                };
            });
        }
        return children;
    }


    
    generateTreeLogic() {
        const toggler = document.getElementsByClassName("caret");
        for (let i = 0; i < toggler.length; i++) {
            toggler[i].addEventListener("click", function() {
                this.parentElement.querySelector(".nested").classList.toggle("active");
                this.classList.toggle("caret-down");
            });
        }

        //console.log(this.checkboxes)
    }
}

export {ProjectTree}