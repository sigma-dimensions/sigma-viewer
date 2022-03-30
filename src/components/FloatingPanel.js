class FloatingPanel { 
    constructor(htmlElement, header) {
        this.dragElement(htmlElement,header)
    }

    dragElement(htmlElement,header) {
        var pos1 = 30, pos2 = 30, pos3 = 0, pos4 = 0;
        if (header) {
            /* if present, the header is where you move the htmlElement from:*/
            header.onmousedown = dragMouseDown;
        } 
        else {
            /* otherwise, move the htmlElement from anywhere inside the htmlElement:*/
            htmlElement.onmousedown = dragMouseDown;
        }

        function dragMouseDown(e) {
            e = e || window.event;
            e.preventDefault();
            // get the mouse cursor position at startup:
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            // call a function whenever the cursor moves:
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            // calculate the new cursor position:
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            // set the element's new position:
            htmlElement.style.top = (htmlElement.offsetTop - pos2) + "px";
            htmlElement.style.left = (htmlElement.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            /* stop moving when mouse button is released:*/
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}

export {FloatingPanel}