"use strict";

var gui = {
    lock: null,
    isEditMode: false,
    barMenuTarget: null,
    movable: null
};

function Initialize() {
    // Handle global document click
    document.onclick = function (e) {
        // Handle left click on button
        if (e.target.classList.contains("skill-button")) {
            if (gui.isEditMode) return;
            SkillButton_onclick(e.target);
        }
    };

    // Handle rgith click
    window.oncontextmenu = OnWindowContextMenu;

    // initialize UI lock button
    gui.lock = document.getElementById("bar-lock");
    gui.lock.onclick = ToggleSkillBarLock;

    // initialize skill bar menu
    InitializeSkillBarMenu();

    // Load user UI
    SpawnBar();
};

function OnWindowContextMenu(e) {
    e.stopPropagation();

    // if right click on edition mode 
    if (gui.isEditMode) {
        //TODO: dirty
        if (e.target.classList.contains("skill-bar")) {
            ShowSkillBarMenu(e, e.target);
        }
        else {
            if (e.target.parentNode &&
                e.target.parentNode.classList &&
                e.target.parentNode.classList.contains("skill-bar")) {
                ShowSkillBarMenu(e, e.target.parentNode);
            }
        }
    }
    return false;
};

function InitializeSkillBarMenu() {
    document.getElementById("sbm-close").onclick = HideSkillBarMenu;

    document.getElementById("sbm").onmousedown = function (event) {
        event.stopPropagation();
        // exit if anything else than left click
        if (event.which !== 1) return;
        BeginDragMovable(event, this, null);
    };

    // setup axes
    InitializePositionAxe("sbm-pos-x", true);
    InitializePositionAxe("sbm-pos-y", false);

    // setup sliders
    InitializeSlider("sbm-buttons", OnRowSliderChange);
    InitializeSlider("sbm-rows", OnRowSliderChange);
};

function InitializePositionAxe(id, isX) {
    const input = document.getElementById(id);

    input.oninput = function (event) {
        console.log(id + " oninput", event);//TODO
        parseInt(input.value);
    };

    document.getElementById(id + "-incr").addEventListener("click", function () {
        SkillBarMenuPositionClick(input, 1, isX);
    });

    document.getElementById(id + "-decr").addEventListener("click", function () {
        SkillBarMenuPositionClick(input, -1, isX);
    });
};

function SkillBarMenuPositionClick(input, increment, isX) {
    const pos = ReadSkillBarPosition();
    if (isX && pos.x === 0 && increment < 0) return;
    if (!isX && pos.y === 0 && increment < 0) return;

    //TODO: return on bar.width + pos.x > screen.width & same with Y/height

    input.value = parseInt(input.value) + increment;

    if (isX) {
        pos.x += increment;
    } else {
        pos.y += increment;
    }

    SetSkillBarPosition(pos);
};

function ReadSkillBarPosition() {
    const targetStyle = gui.barMenuTarget.style;
    return {
        x: parseInt(targetStyle.left.replace("px", "")),
        y: parseInt(targetStyle.top.replace("px", ""))
    };
};

function SetSkillBarPosition(pos) {
    const targetStyle = gui.barMenuTarget.style;
    targetStyle.top = pos.y + "px";
    targetStyle.left = pos.x + "px";
};

function OnButtonSliderChange(event, slider) {
    console.log(slider.id + " OnButtonSlider input:" + slider.value); //TODO
};

function OnRowSliderChange(event, slider) {
    console.log(slider.id + " OnRowSlider input:" + slider.value, event); //TODO
};

function StopMouseDownPropagation(event) {
    event.stopPropagation();
};

function InitializeSlider(id, callback) {
    const slider = document.getElementById(id);
    slider.onmousedown = StopMouseDownPropagation;

    const label = document.getElementById(id + "-value");
    label.innerHTML = slider.value;

    slider.oninput = function (event) {
        event.stopPropagation();
        label.innerHTML = this.value;
        callback(event, this);
    };
};

function ShowSkillBarMenu(e, bar) {
    const menu = document.getElementById("sbm");
    menu.style.display = "block";
    menu.style.top = e.pageY + "px";
    menu.style.left = e.pageX + "px";

    UpdateSkillBarMenu(bar);
};

function GetPosition(node) {
    const pos = { x: node.offsetLeft, y: node.offsetTop };

    var parent = node.parent;
    if (parent) {
        do {
            pos.y += parent.offsetTop;
            pos.x += parent.offsetLeft;
            parent = node.parent;
        } while (parent);
    }
    return pos;
};

function HideSkillBarMenu() {
    const menu = document.getElementById("sbm");
    menu.style.display = "none";
    gui.barMenuTarget = null;
};

function UpdateSkillBarMenu(bar) {
    gui.barMenuTarget = bar;

    const pos = GetPosition(bar);
    UpdateSkillBarMenuPosition(pos.x, pos.y);
    
    SelectSkillBar(bar);

    //TODO: rows/buttons from bar ref.
    document.getElementById("sbm-buttons").value = 10;
    document.getElementById("sbm-rows").value = 1;
};

function UpdateSkillBarMenuPosition(x, y) {
    document.getElementById("sbm-pos-x").value = x;
    document.getElementById("sbm-pos-y").value = y;
};

function SkillButton_onclick(button) {
    if (button.classList.contains("disabled")) {
        return;
    }
    StartSkillCountDown(button);
};

function StartSkillCountDown(button) {
    button.className += " disabled";
    const duration = 3000;
    const precision = 1000;

    const labelCountDown = document.createElement("span");
    labelCountDown.innerText = duration;
    labelCountDown.className = "skill-button-countdown";
    button.appendChild(labelCountDown);

    SkillButtonCountDown(button, precision, duration, labelCountDown);
};

function SkillButtonCountDown(button, interval, countDown, labelCountDown) {

    labelCountDown.innerText = countDown / 1000;

    countDown -= interval;

    if (countDown < 0) {
        button.className = button.className.replace(" disabled", "");
        button.removeChild(labelCountDown);
        return;
    }

    setTimeout(SkillButtonCountDown, interval,
        button, interval, countDown, labelCountDown);
};

function SpawnBar() {
    const bar = document.createElement("div");
    bar.className = "skill-bar";

    if (gui.isEditMode) {
        SetSkillBarMovable(bar);
    }

    // Add buttons
    const buttonCount = 10;
    for (let i = 0; i < buttonCount; i++) {
        const button = document.createElement("div");
        button.className = "skill-button";

        const shortcut = document.createElement("span");
        shortcut.className = "skill-button-shortcut";
        shortcut.innerText = i + 1;

        button.appendChild(shortcut);
        bar.appendChild(button);
    }

    document.body.appendChild(bar);
};

function ToggleSkillBarLock() {
    const lockLabel = "Lock";
    const unlockLabel = "Unlock";

    gui.isEditMode = !gui.isEditMode;

    this.innerText = (gui.isEditMode ? lockLabel : unlockLabel);

    const bars = document.getElementsByClassName("skill-bar");
    for (let i = 0; i < bars.length; i++) {
        const bar = bars[i];
        if (gui.isEditMode) {
            SetSkillBarMovable(bar);
        } else {
            bar.className = bar.className.replace(" movable", "");
            bar.onmousedown = null;
            if (gui.barMenuTarget) {
                HideSkillBarMenu();
            }
        }
    }
};

function SetSkillBarMovable(bar) {
    bar.className += " movable";
    bar.onmousedown = function (event) {
        event.stopPropagation();
        // exit if anything else than left click
        if (event.which !== 1) return;

        if (gui.barMenuTarget) {
            UpdateSkillBarMenu(bar);
        }

        BeginDragMovable(event, this, UpdateSkillBarMenuPosition);
    };
};

function TrackMouseMove(e, callback) {
    const targetStyle = gui.movable.target.style;

    const y = e.pageY - gui.movable.offsetY;
    const x = e.pageX - gui.movable.offsetX;

    targetStyle.top = y + "px";
    targetStyle.left = x + "px";

    if (callback) {
        callback(x, y);
    }
};

function BeginDragMovable(event, bar, callback) {
    event.stopPropagation();

    SelectSkillBar(bar);

    gui.movable = {
        target: bar,
        offsetX: event.clientX - bar.offsetLeft,
        offsetY: event.clientY - bar.offsetTop
    }

    document.onmousemove = function (e) {
        TrackMouseMove(e, callback);
    };

    document.onmouseup = ReleaseMovable;
};

function ReleaseMovable() {
    document.onmousemove = null;
    document.onmouseup = null;
    gui.movable = null;
};

function SelectSkillBar(bar) {
    const selected = document.getElementsByClassName("selected");
    if (selected.length > 0) {
        selected[0].className = selected[0].className.replace(" selected", "");
    }
    bar.className += " selected";  
};