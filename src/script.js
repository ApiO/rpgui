"use strict";

var gui = {
    lock: null,
    isEditMode: false,
    isSkillBarMenuOpened: false,
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
    }

    // Handle rgith click
    window.oncontextmenu = OnWindowContextMenu;

    // initialize UI lock button
    gui.lock = document.getElementById("bar-lock");
    gui.lock.onclick = ToggleSkillBarLock;

    // initialize skill bar menu
    InitializeSkillBarMenu();

    // Load user UI
    AddBar();
};

function OnWindowContextMenu(e) {
    e.stopPropagation();

    // if right click on edition mode
    if (gui.isEditMode) {
        if (e.target.classList.contains("skill-bar")) {
            DisplaySkillBarMenu(e, e.target);
        }
        else {
            if (e.target.parentNode &&
                e.target.parentNode.classList &&
                e.target.parentNode.classList.contains("skill-bar")) {
                DisplaySkillBarMenu(e, e.target.parentNode);
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

        BeginDrageMovable(event, this, null);
    };

    // setup PositionX

    document.getElementById("sbm-pos-x").addEventListener("change", function () {
        console.log(this);
    });
    document.getElementById("sbm-pos-x-incr").addEventListener("click", function () {
        console.log(this);
    });
    document.getElementById("sbm-pos-x-decr").addEventListener("click", function () {
        console.log(this);
    });

    // setup PositionY

    document.getElementById("sbm-pos-y").addEventListener("change", function () {
        console.log(this);
    });
    document.getElementById("sbm-pos-y-incr").addEventListener("click", function () {
        console.log(this);
    });
    document.getElementById("sbm-pos-y-decr").addEventListener("click", function () {
        console.log(this);
    });

    // setup sliders

    document.getElementById("sbm-buttons").addEventListener("change", function (event) {
        event.stopPropagation();
        console.log(this);
    });

    document.getElementById("sbm-rows").addEventListener("change", function (event) {
        event.stopPropagation();
        console.log(this);
    });

};

function DisplaySkillBarMenu(e, bar) {
    const menu = document.getElementById("sbm");
    menu.style.display = "block";
    gui.isSkillBarMenuOpened = true;

    menu.style.top = e.pageY + "px";
    menu.style.left = e.pageX + "px";

    const pos = GetPosition(bar);
    UpdateBarMenuPosition(pos.x, pos.y);

    document.getElementById("sbm-buttons").value = 10;
    document.getElementById("sbm-rows").value = 1;
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
    gui.isSkillBarMenuOpened = false;
};

function UpdateBarMenuPosition(x, y) {
    document.getElementById("sbm-pos-x").value = (x + "").replace("px", "");
    document.getElementById("sbm-pos-y").value = (y + "").replace("px", "");
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
}

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

function AddBar() {
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
            if (gui.isSkillBarMenuOpened) {
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
        BeginDrageMovable(event, this, UpdateBarMenuPosition);
    };
};

function TrackMouseMove(e, callback) {
    const targetStyle = gui.movable.target.style;
    targetStyle.top = (e.pageY - gui.movable.offsetY) + "px";
    targetStyle.left = (e.pageX - gui.movable.offsetX) + "px";

    if (callback) {
        callback(targetStyle.left, targetStyle.top);
    }
};

function BeginDrageMovable(event, skillBar, callback) {
    event.stopPropagation();

    gui.movable = {
        target: skillBar,
        offsetX: event.clientX - skillBar.offsetLeft,
        offsetY: event.clientY - skillBar.offsetTop
    }

    document.onmousemove = function (event) {
        TrackMouseMove(event, callback);
    };

    document.onmouseup = ReleaseMovable;
};

function ReleaseMovable() {
    document.onmousemove = null;
    document.onmouseup = null;
    gui.movable = null;
};