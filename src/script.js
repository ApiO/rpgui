"use strict";

var gui = {
    lock: null,
    isEditMode: false,
    barMenuTarget: null,
    movable: null,
    button: {
        offsetRight: 4,
        offsetBottom: 4
    }
};

function Initialize() {
    // Handle global document click
    document.onclick = function (e) {
        // Handle left click on button
        if (e.target.classList.contains("skill-button")) {
            if (gui.isEditMode) { return; }
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
    const json = '{\"settings\":{\"buttonOffsetRight\":4,\"buttonOffsetBottom\":4},' +
        '\"bars\":[' +
        '{\"position\":{\"top\":50,\"left\":50},\"buttons\":6,\"rows\":1},' +
        '{\"position\":{\"top\":156,\"left\":175},\"buttons\":4,\"rows\":2},' +
        '{\"position\":{\"top\":100,\"left\":300},\"buttons\":3,\"rows\":2}' +
        ']}';
    LoadUserUI(json);
};

function OnWindowContextMenu(e) {
    e.stopPropagation();

    // On right click on edition mode 
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
    InitializeSlider("sbm-buttons", SaveUIState);
    InitializeSlider("sbm-rows", SaveUIState);
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

function SaveUIState() {
    console.log("SaveUIState"); //TODO

    var state= gui.barMenuTarget
};

function StopMouseDownPropagation(event) {
    event.stopPropagation();
};

function InitializeSlider(id, callback) {
    const slider = document.getElementById(id);
    slider.onmousedown = StopMouseDownPropagation;
    slider.oninput = function (event) {
        event.stopPropagation();
        document.getElementById(id + "-value").innerHTML = this.value;
        callback(event, this);
    };
};

function SetSliderValue(id, value) {
    document.getElementById(id).value = value;
    document.getElementById(id + "-value").innerHTML = value;
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
    
    SetSliderValue("sbm-buttons", bar.getAttribute("buttons"));
    SetSliderValue("sbm-rows", bar.getAttribute("rows"));
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

function LoadUserUI(json) {
    const ui = JSON.parse(json);
    for (let i = 0; i < ui.bars.length; i++) {
        SpawnBar(ui.settings, ui.bars[i]);
    }
};

function SpawnBar(globalSettings, barSettings) {
    const bar = document.createElement("div");
    bar.className = "skill-bar";
    bar.style.top = barSettings.position.top + "px";
    bar.style.left = barSettings.position.left + "px";
    bar.setAttribute("buttons", barSettings.buttons);
    bar.setAttribute("rows", barSettings.rows);

    if (gui.isEditMode) {
        SetSkillBarMovable(bar);
    }

    // Add buttons
    const buttonCount = barSettings.buttons;
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