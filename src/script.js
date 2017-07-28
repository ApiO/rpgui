var gui = {
	lock: null,
	isEditMode: false,
	isSkillBarMenuOpened: false,
	movable: null
};

function Initialize(){
	let skillButtons = document.getElementsByClassName('skill-button');
	
	// Handle global document click
	document.onclick = function(e){
		// Handle left click on button
		if(e.target.classList.contains('skill-button')){
			if(gui.isEditMode) return;
			SkillButton_onclick(e.target);
		}
	}
	
	// Handle rgith click
	window.oncontextmenu = function (e){
		e.stopPropagation();
		
		// if right click on edition mode
		if(gui.isEditMode){
			if(e.target.classList.contains('skill-bar')){
				DisplaySkillBarMenu(e, e.target);   
			}
			else 
			{
				if(	e.target.parentNode && 
					e.target.parentNode.classList && 
					e.target.parentNode.classList.contains('skill-bar')){
					DisplaySkillBarMenu(e, e.target.parentNode);
				}
			}
		}
		return false;
	};
	
	// initialize UI lock button
	gui.lock = document.getElementById('BarLock');
	gui.lock.onclick = ToggleSkillBarLock;
	
	// initialize skill bar menu
	InitializeSkillBarMenu();
	
	// Load user UI
	AddBar();
};


function InitializeSkillBarMenu(){	
	document.getElementById('SkillMenuCloseButton').onclick = HideSkillBarMenu;	
	
	document.getElementsByClassName('skill-bar-menu')[0].onmousedown = function(event){
		event.stopPropagation();
		// exit if anything else than left click
		if(event.which != 1) return;
		
		BeginDrageMovable(event, this, null);
	};
	
	/*
	var menu = document.createElement('div');
	menu.className = 'skill-bar-menu';
	
	// Add close button
	var closeButton = document.createElement('div');
	closeButton.id = 'SkillMenuCloseButton';
	closeButton.className = 'skill-bar-menu-close';
	closeButton.onclick = HideSkillBarMenu;	
	menu.appendChild(closeButton);
	
	// Add position section
	var title = document.createElement('div');
	title.className = 'skill-bar-menu-title';
	title.innerHtml = 'Position:';
	menu.appendChild(title);
	
	var row = document.createElement('div');
	row.className = 'heigher skill-bar-menu-row';
	
	
	
	menu.appendChild(row);
	
	// Add other behaviors section
	*/
}

function DisplaySkillBarMenu(e, bar){
	var menu = document.getElementsByClassName('skill-bar-menu')[0];
	menu.style.display='block';
	gui.isSkillBarMenuOpened = true;
	
	menu.style.top = e.pageY+'px';
	menu.style.left = e.pageX+'px';
	
	var pos = GetPosition(bar);
	UpdateBarMenuPosition(pos.x, pos.y);
	
	document.getElementById('ButtonsNumber').value = 10;
	document.getElementById('RowsNumber').value = 1;
};

function GetPosition(node) {   
	var pos = { x: node.offsetLeft, y: node.offsetTop};
	
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

function HideSkillBarMenu(){
	var menu = document.getElementsByClassName('skill-bar-menu')[0];
	menu.style.display='none';
	gui.isSkillBarMenuOpened = false;
};

function UpdateBarMenuPosition(x, y){
	document.getElementById('PositionX').value = (x+'').replace('px','');
	document.getElementById('PositionY').value = (y+'').replace('px','');
};

function SkillButton_onclick(button){
	if(button.classList.contains('disabled')){
		return;
	}
	StartSkillCountDown(button);
};

function StartSkillCountDown(button){
	button.className += ' disabled';
	var duration = 3000;
	var precision = 1000;
	
	var labelCountDown = document.createElement('span');
	labelCountDown.innerText = duration;
	labelCountDown.className = 'countdown';
	button.appendChild(labelCountDown);
	
	SkillButtonCountDown(button, precision, duration, labelCountDown);
}

function SkillButtonCountDown(button, interval, countDown, labelCountDown){
	
	labelCountDown.innerText = countDown/1000.0;
	
	countDown -= interval;
		
	if(countDown < 0){
		button.className = button.className.replace(' disabled', '');
		button.removeChild(labelCountDown);
		return;
	}
		
	setTimeout(SkillButtonCountDown, interval, 
				button, interval, countDown, labelCountDown);
};

function AddBar(){
	var bar = document.createElement('div');
	bar.className = 'skill-bar';
	
	if(gui.isEditMode)
	{
		SetSkillBarMovable(bar);
	}
	
	// Add buttons
	let buttonCount = 10;	
	for (var i = 0; i < buttonCount; i++){
		var button = document.createElement('div');
		button.className = 'skill-button';
		
		var shortcut = document.createElement('span');
		shortcut.className = 'shortcut';
		shortcut.innerText = i+1;
		
		button.appendChild(shortcut);
		bar.appendChild(button);
	}
	
	document.body.appendChild(bar);
};
	
function ToggleSkillBarLock(){
	var lockLabel ='Lock';
	var unlockLabel = 'Unlock';
	
	gui.isEditMode = !gui.isEditMode;
	
	this.innerText = (gui.isEditMode ? lockLabel : unlockLabel);

	var bars = document.getElementsByClassName('skill-bar');
	for (var i = 0; i < bars.length; i++) {
		let bar = bars[i];
		if(gui.isEditMode){
			SetSkillBarMovable(bar);
		}else{
			bar.className = bar.className.replace(' movable', '');
			bar.onmousedown = null;
			if(gui.isSkillBarMenuOpened){
				HideSkillBarMenu();
			}
		}
	}
};

function SetSkillBarMovable(bar){
	bar.className += ' movable';
	bar.onmousedown = function(event){
		event.stopPropagation();
		// exit if anything else than left click
		if(event.which != 1) return;
		BeginDrageMovable(event, this, UpdateBarMenuPosition);
	};
};

function TrackMouseMove(e, callback){
	var targetStyle = gui.movable.target.style;
	targetStyle.top = (e.pageY- gui.movable.offsetY) + 'px';
	targetStyle.left = (e.pageX - gui.movable.offsetX) + 'px';
	
	if(callback){
		callback(targetStyle.left, targetStyle.top);
	}
};

function BeginDrageMovable(event, skillBar, callback){
	event.stopPropagation();
		
	gui.movable = {
		target: skillBar,
		offsetX: event.clientX - skillBar.offsetLeft,
		offsetY: event.clientY - skillBar.offsetTop
	}
	
	document.onmousemove = function(event){
		TrackMouseMove(event, callback);
	};
	
	document.onmouseup = ReleaseMovable;
};

function ReleaseMovable(){
	document.onmousemove = null;
	document.onmouseup = null;
	gui.movable = null;
};