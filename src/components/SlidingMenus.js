class SlidingMenus { 
    constructor(div, button) {
        this.toggle(div, button)
    }
    toggle(id, button) {
        var el = document.getElementById(id);
        var img = document.getElementById(button);
        var boxClass = el.getAttribute("class");
        if(boxClass == "hideIT"){
            el.setAttribute("class", "showIT");
            this.delay(400);
        }
        else{
            el.setAttribute("class", "hideIT");
            this.delay(400);
        }
    }
    delay(delayTime){
        window.setTimeout(delayTime);
    }
}

export {SlidingMenus}