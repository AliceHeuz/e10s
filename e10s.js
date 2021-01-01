// Under CC-BY-SA 4.0 Licence : https://creativecommons.org/licenses/by-sa/4.0/

// PIXI init
var app = new PIXI.Application(600, 700, { backgroundColor: 0x1099bb });
document.getElementById("view").appendChild(app.view);

var container = new PIXI.Container();
app.stage.addChild(container);

var difficulty = 'normal';
var state = {};
var textures = {};
var elems = {};
var rotate = false;

function loadTextures() {
    textures.background = PIXI.Texture.fromImage('img/bg.jpg');
    textures.backgroundTowers = PIXI.Texture.fromImage('img/bg_towers.jpg');
    textures.shadow = PIXI.Texture.fromImage('img/shadow.png');
    textures.cleft = PIXI.Texture.fromImage('img/cleave_left.png');
    textures.cright = PIXI.Texture.fromImage('img/cleave_right.png');
    textures.cno = PIXI.Texture.fromImage('img/no_cleave.png');
}
loadTextures();

function updatePlayer() {
    elems.player.x = state.playerX;
    elems.player.y = state.playerY + 100;

    if(state.shadow == -1) { return; }

    elems.shadow.visible = true;
    elems.player.rotation = Math.PI * state.shadow / 2;

    if(state.side == -1) { return; }

    if(state.shadow % 2 == 0) {
        if(state.side - (state.shadow / 2) == 0) {
            elems.slash.x = state.playerX - 600;
        } else {
            elems.slash.x = state.playerX;
        }
        elems.slash.y = 100;
    } else {
        elems.slash.x = 0;
        if(state.side - ((state.shadow - 1) / 2) == 0) {
            elems.slash.y = state.playerY - 500;
        } else {
            elems.slash.y = state.playerY + 100;
        }
    }
}

function drawBase() {
    elems.arena = new PIXI.Container();
    elems.arena.x = 300;
    elems.arena.y = 400;
    elems.arena.pivot.x = 300;
    elems.arena.pivot.y = 400;

    elems.background = new PIXI.Sprite(textures.background);
    elems.background.x = 0;
    elems.background.y = 100;
    elems.arena.addChild(elems.background);

    elems.boss = new PIXI.Sprite(textures.cno);
    elems.boss.anchor.set(0.5);
    elems.boss.scale.x = 2.5;
    elems.boss.scale.y = 2.5;
    elems.boss.x = 300;
    elems.boss.y = 400;
    elems.arena.addChild(elems.boss);

    elems.bossCircle = new PIXI.Graphics();
    elems.bossCircle.lineStyle(4, 0xFF0000, 1);
    elems.bossCircle.drawCircle(0, 0, 90);
    elems.bossCircle.x = 300;
    elems.bossCircle.y = 400;
    elems.arena.addChild(elems.bossCircle);

    elems.slash = new PIXI.Graphics();
    elems.slash.beginFill(0xFF0000);
    elems.slash.drawRect(0, 0, 600, 600);
    elems.slash.alpha = 0.3;
    elems.slash.visible = false;
    elems.arena.addChild(elems.slash);

    elems.player = new PIXI.Container();
    elems.playerCircle = new PIXI.Graphics();
    elems.playerCircle.lineStyle(2, 0x000099, 1);
    elems.playerCircle.beginFill(0x66FF);
    elems.playerCircle.drawCircle(0, 0, 20);
    elems.player.addChild(elems.playerCircle);

    elems.shadow = new PIXI.Sprite(textures.shadow);
    elems.shadow.x = -25;
    elems.shadow.y = 5;
    elems.shadow.visible = false;
    elems.player.addChild(elems.shadow);

    elems.player.x = 300;
    elems.player.y = 500;
    elems.arena.addChild(elems.player);

    elems.sides = new PIXI.Graphics();
    elems.sides.beginFill(0x0);
    elems.sides.drawRect(-600, -600, 1200, 600);
    elems.sides.drawRect(-600, 600, 1200, 600);
    elems.sides.drawRect(-600, 0, 600, 600);
    elems.sides.drawRect(600, 0, 600, 600);
    elems.sides.x = 0;
    elems.sides.y = 100;
    elems.arena.addChild(elems.sides);

    container.addChild(elems.arena);

    elems.castArea = new PIXI.Graphics();
    elems.castArea.beginFill(0x0);
    elems.castArea.drawRect(0, 0, 600, 100);
    elems.castArea.x = 0;
    elems.castArea.y = 0;
    container.addChild(elems.castArea);

    var castTextStyle = new PIXI.TextStyle({ fill: '#FFFFFF' });
    elems.castText = new PIXI.Text('Shadow Servant', castTextStyle);
    elems.castText.x = 20;
    elems.castText.y = 12;
    container.addChild(elems.castText);

    elems.castBar = new PIXI.Container();
    elems.castBarOuter = new PIXI.Graphics();
    elems.castBarOuter.lineStyle(2, 0xFFFFFF, 1);
    elems.castBarOuter.drawRect(0, 0, 560, 40);
    elems.castBarOuter.x = 0;
    elems.castBarOuter.y = 0;
    elems.castBar.addChild(elems.castBarOuter);

    elems.castBarInner = new PIXI.Graphics();
    elems.castBarInner.x = 4;
    elems.castBarInner.y = 4;
    elems.castBar.addChild(elems.castBarInner);

    elems.castBar.x = 20;
    elems.castBar.y = 50;
    elems.castBar.visible = false;
    container.addChild(elems.castBar);
}
drawBase();

var movement = {};
function processKey(e, down) {
    var delta = 5;
    var handled = false;
    if(e.key == 'ArrowUp' || e.keyCode == 38) {
        movement.up = down;
        handled = true;
    } else if(e.key == 'ArrowDown' || e.keyCode == 40) {
        movement.down = down;
        handled = true;
    } else if(e.key == 'ArrowLeft' || e.keyCode == 37) {
        movement.left = down;
        handled = true;
    } else if(e.key == 'ArrowRight' || e.keyCode == 39) {
        movement.right = down;
        handled = true;
    }
    if(handled) {
        e.preventDefault();
    }
}

function onKeydown(e) { processKey(e, true); }
function onKeyup(e) { processKey(e, false); }

function handlePointer(e) {
    if(e.type == 'pointerdown') {
        movement.mouse = true;
    } else if(e.type == 'pointerup') {
        movement.mouse = false;
    }

    if(!movement.active || !movement.mouse) { return; }

    var pos = elems.arena.toLocal(e.data.global);

    if(pos.x >= 50 && pos.x <= 550 && pos.y >= 150 && pos.y <= 650) {
        if(difficulty == 'drunk') {
            state.playerX = pos.x - 10 + 20 * Math.random();
            state.playerY = pos.y - 110 + 20 * Math.random();
        } else {
            state.playerX = pos.x;
            state.playerY = pos.y - 100;
        }
        updatePlayer();
    } else {
        movement.mouse = false;
    }
}

function bindInputs() {
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('keyup', onKeyup);
    container.interactive = true;
    container.on('pointerdown', handlePointer);
    container.on('pointermove', handlePointer);
    container.on('pointerup', handlePointer);
}
bindInputs();

function handleMovement(delta) {
    if(!movement.active) { return; }
    var factor = 3;
    var moved = false;
    var move = {x: 0, y: 0};
    if(movement.up) {
        move.y -= delta * factor;
    }
    if(movement.down) {
        move.y += delta * factor;
    }
    if(movement.left) {
        move.x -= delta * factor;
    }
    if(movement.right) {
        move.x += delta * factor;
    }

    if(difficulty == 'drunk') {
        state.playerX += move.x * (0.5 + Math.random()) + move.y * Math.random();
        state.playerY += move.x * Math.random() + move.y * (0.5 + Math.random());
    } else {
        state.playerX += move.x * Math.cos(elems.arena.rotation) + move.y * Math.sin(elems.arena.rotation);
        state.playerY += move.y * Math.cos(elems.arena.rotation) - move.x * Math.sin(elems.arena.rotation);
    }

    if(move.x != 0 || move.y != 0) {
        moved = true;
        if(state.playerX < 50) {
            state.playerX = 50;
            moved = true;
        }
        if(state.playerX > 550) {
            state.playerX = 550;
            moved = true;
        }
        if(state.playerY < 50) {
            state.playerY = 50;
            moved = true;
        }
        if(state.playerY > 550) {
            state.playerY = 550;
            moved = true;
        }
    }

    if(moved) { updatePlayer(); }
}

function onTick(delta) {
    handleMovement(delta);
    roundUpdate(delta);
}
app.ticker.add(onTick);

function getTime() {
    var now = +new Date();
    return now - state.startTime;
}

function setMovementActive(active) {
    movement.active = active;

    if(active) {
        elems.playerCircle.beginFill(0xAA66);
        elems.playerCircle.drawCircle(0, 0, 20);
    } else {
        elems.playerCircle.beginFill(0x66FF);
        elems.playerCircle.drawCircle(0, 0, 20);
    }
}

function roundPhase(phase) {
    if(state.phase == phase) { return; }
    state.phase = phase;

    if(phase == 1) {
        // Shadow appears
        if(state.lastShadow > -1) {
            // Change each time
            state.shadow = Math.floor(Math.random() * 3);
            if(state.shadow >= state.lastShadow) {
                state.shadow += 1;
            }
        } else {
            state.shadow = Math.floor(Math.random() * 4);
        }

        if(difficulty != 'hard') {
            setMovementActive(true);
        }
    } else if(phase == 2) {
        // Side selected
        state.side = Math.floor(Math.random() * 2);
        elems.boss.texture = state.side ? textures.cright : textures.cleft;
        if(difficulty == "easy") {
            elems.slash.visible = true;
        }
        if(difficulty == 'veryhard') {
            elems.castText.text = "Giga Slash";
        } else if(difficulty == 'drunk') {
            elems.castText.text = "Gig" + Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7) + Math.random().toString(36).substring(7) + " (" + Math.random().toString(36).substring(7) + ")";
        } else {
            elems.castText.text = "Giga Slash " + (state.side ? "(right)" : "(left)");
        }
    } else if(phase == 3 && difficulty == 'hard') {
        // End of towers in hard difficulty
        elems.background.texture = textures.background;
        setMovementActive(true);
    } else if(phase == 4) {
        // End
        roundEnd();
    }
    updatePlayer();
}

function roundStart() {
    state.lastShadow = state.shadow;
    state.shadow = -1;
    state.side = -1;
    state.startTime = +new Date();
    state.phase = 0;
    if(difficulty == 'hard') {
        elems.background.texture = textures.backgroundTowers;
        state.playerX = 400;
        state.playerY = 400;
    } else {
        elems.background.texture = textures.background;
        state.playerX = 300;
        state.playerY = 400;
    }

    setMovementActive(false);
    elems.shadow.visible = false;
    elems.slash.visible = false;
    updatePlayer();

    elems.boss.texture = textures.cno;
    elems.arena.rotation = 0;

    elems.castArea.beginFill(0x0);
    elems.castArea.drawRect(0, 0, 600, 100);

    elems.castText.text = "Shadow Servant";
    elems.castBarInner.beginFill(0x0);
    elems.castBarInner.drawRect(0, 0, 552, 32);
}
roundStart();

function roundUpdate(delta) {
    var time = getTime();

    if(difficulty == 'drunk') {
        elems.arena.rotation += 0.015;
    }

    if(difficulty == 'veryhard') {
        if(time > 9000) {
            roundStart();
        } else if(time > 4000) {
            roundPhase(4);
            elems.castBar.visible = false;
        } else if(time > 2000) {
            roundPhase(2);
            elems.castBar.visible = true;
            elems.castBarInner.beginFill(0xFFFFFF);
            elems.castBarInner.drawRect(0, 0, Math.floor((time - 2000) * 552 / 2000), 32);
        } else if(time > 1000) {
            roundPhase(1);
        }
        return;
    }

    if(time > 16000) {
        roundStart();
    } else if(time > 11000) {
        roundPhase(4);

        elems.castBar.visible = false;
    } else if(time > 8000) {
        roundPhase(3);
        elems.castBar.visible = true;
        elems.castBarInner.beginFill(0xFFFFFF);
        elems.castBarInner.drawRect(0, 0, Math.floor((time - 4000) * 552 / 7000), 32);
    } else if(time > 4000) {
        roundPhase(2);

        if(rotate && (difficulty == 'easy' || difficulty == 'normal') && state.shadow > 0) {
            if(state.shadow == 1) {
                elems.arena.rotation -= delta * 0.03;
                if(elems.arena.rotation < -Math.PI / 2) {
                    elems.arena.rotation = -Math.PI / 2;
                }
            } else {
                elems.arena.rotation += delta * 0.03;
                if(elems.arena.rotation > Math.PI * (4 - state.shadow) / 2) {
                    elems.arena.rotation = Math.PI * (4 - state.shadow) / 2;
                }
            }
        }

        elems.castBar.visible = true;
        elems.castBarInner.beginFill(0xFFFFFF);
        elems.castBarInner.drawRect(0, 0, Math.floor((time - 4000) * 552 / 7000), 32);
    } else if(time > 2000) {
        roundPhase(1);
    }
}

function roundEnd() {
    // Check everything is right
    setMovementActive(false);
    elems.slash.visible = true;

    var okay = false;
    var correct = false;
    var dir = null;

    if(state.shadow % 2 == 0) {
        if(state.side - (state.shadow / 2) == 0) {
            dir = 'left';
        } else {
            dir = 'right';
        }
    } else {
        if(state.side - ((state.shadow - 1) / 2) == 0) {
            dir = 'up';
        } else {
            dir = 'down';
        }
    }

    if(dir == 'left') {
        okay = state.playerX < 300;
        correct = state.playerX < 240;
    } else if(dir == 'right') {
        okay = state.playerX > 300;
        correct = state.playerX > 360;
    } else if(dir == 'up') {
        okay = state.playerY < 300;
        correct = state.playerY < 240;
    } else if(dir == 'down') {
        okay = state.playerY > 300;
        correct = state.playerY > 360;
    }

    if(correct) {
        elems.castArea.beginFill(0x33CC33);
        elems.castText.text = "Correct!";
    } else if(okay) {
        elems.castArea.beginFill(0xFF0000);
        elems.castText.text = "Wrong (too close to the center)!";
    } else {
        elems.castArea.beginFill(0xFF0000);
        elems.castText.text = "Wrong (cleaved the center)!";
    }
    elems.castArea.drawRect(0, 0, 600, 100);
}

function setDifficulty(newDifficulty) {
    difficulty = newDifficulty;
    roundStart();
    document.activeElement.blur();
}

function setRotate() {
    rotate = document.getElementById('rotate').checked;
}
