/* eslint-disable prefer-destructuring */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-plusplus */
/* eslint-disable max-len */
import themes from './themes';
import GamePlay from './GamePlay';
import PositionedCharacter from './PositionedCharacter';
import GameState from './GameState';
import cursors from './cursors';
import Bowman from './character types/Bowman';
import Daemon from './character types/Daemon';
import Magician from './character types/Magician';
import Swordsman from './character types/Swordsman';
import Undead from './character types/Undead';
import Vampire from './character types/Vampire';
import { generateTeam } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.selected = undefined;
    this.movements = [];
    this.attackOpt = [];
    this.level = 1;
    this.score = 0;
    this.userTypes = [Bowman, Swordsman, Magician];
    this.enemyTypes = [Vampire, Undead, Daemon];
    this.position = [];
    this.occupiedCells = [];
    this.area = this.arrOfIndexes();
    this.userPositions = this.area.map((item) => item.slice(0, 2)).flat(); // [0, 1, 8, 9, 16, 17, 24, 25, 32, 33, 40, 41, 48, 49, 56, 57]
    this.enemyPositions = this.area.map((item) => item.slice(6, 8)).flat(); // [6, 7, 14, 15, 22, 23, 30, 31, 38, 39, 46, 47, 54, 55, 62, 63]
    this.player; // players turn: 1 - user, 0 - enemy;
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    const startUserTeam = this.userTypes.slice(0, 2);
    const userPos = this.generatePlayers(this.userPositions, startUserTeam);
    this.gamePlay.redrawPositions(userPos);
    const enemyPos = this.generatePlayers(this.enemyPositions, this.enemyTypes);
    this.gamePlay.redrawPositions(enemyPos);

    // TODO: add event listeners to gamePlay events
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this));
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this));
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this));

    // TODO: load saved stated from stateService
    this.gamePlay.addNewGameListener(this.onNewGameClick.bind(this));
    this.gamePlay.addSaveGameListener(this.onSaveGameClick.bind(this));
    this.gamePlay.addLoadGameListener(this.onLoadGameClick.bind(this));
  }

  onNewGameClick() {
    this.level = 1;
    this.scores = 0;
    this.position = [];
    this.player = 1;
    this.userTeam = [];
    this.enemyTeam = [];
    this.gamePlay.drawUi(themes.prairie);
    const startUserTeam = this.userTypes.slice(0, 2);
    const userPos = this.generatePlayers(this.userPositions, startUserTeam);
    this.gamePlay.redrawPositions(userPos);
    const enemyPos = this.generatePlayers(this.enemyPositions, this.enemyTypes);
    this.gamePlay.redrawPositions(enemyPos);
  }

  generatePlayers(teamPositions, teamArr) {
    const team = generateTeam(teamArr, 1, 2);
    for (const character of team) {
      const pos = this.getRandomPosition(teamPositions);
      const char = new PositionedCharacter(character, pos);
      this.position.push(char);
    }
    return this.position;
  }

  getRandomPosition(teamPositions) {
    let index = teamPositions[Math.floor(Math.random() * teamPositions.length)];
    while (this.checkPosition(index)) {
      index = teamPositions[Math.floor(Math.random() * teamPositions.length)];
    }
    return index;
  }

  // to avoid the same random position
  checkPosition(index) {
    for (const pos of this.position) {
      if (index === pos.position) {
        return true;
      }
    }
    return false;
  }

  onSaveGameClick() {
    const savedGame = {
      level: this.level,
      activePlayer: this.player,
      position: this.position,
      scores: this.scores,
    };
    const state = GameState.from(savedGame);
    this.stateService.save(state);
    GamePlay.showMessage('Saved');
  }

  onLoadGameClick() {
    const loaded = this.stateService.load();
    if (!loaded) {
      GamePlay.showError('Something wrong...');
    }
    this.level = loaded.level;
    this.player = loaded.activePlayer;
    this.position = loaded.position;
    this.scores = loaded.scores;
    switch (loaded.level) {
      case 1:
        this.gamePlay.drawUi(themes.prairie);
        break;
      case 2:
        this.gamePlay.drawUi(themes.desert);
        break;
      case 3:
        this.gamePlay.drawUi(themes.arctic);
        break;
      case 4:
        this.gamePlay.drawUi(themes.mountain);
        break;
      default:
        this.gamePlay.drawUi(themes.prairie);
        break;
    }
    this.gamePlay.redrawPositions(this.position);
  }

  newLevel() {
    let userNum;
    const userLevel = this.level - 1;
    let enemyLength;

    if (this.level === 2) {
      userNum = 1;
      enemyLength = this.userTeam.length + userNum;
      this.gamePlay.drawUi(themes.desert);
      this.gamePlay.redrawPositions(this.position);
      const userPos = this.teamNewLevel(this.userPositions, this.userTypes, userLevel, userNum);
      this.gamePlay.redrawPositions(userPos);
      const enemyPos = this.teamNewLevel(this.enemyPositions, this.enemyTypes, this.level, enemyLength);
      this.gamePlay.redrawPositions(enemyPos);
    }
    if (this.level === 3) {
      this.gamePlay.drawUi(themes.arctic);
      userNum = 2;
      enemyLength = this.userTeam.length + userNum;
      this.gamePlay.redrawPositions(this.position);
      const userPos = this.teamNewLevel(this.userPositions, this.userTypes, userLevel, userNum);
      this.gamePlay.redrawPositions(userPos);
      const enemyPos = this.teamNewLevel(this.enemyPositions, this.enemyTypes, this.level, enemyLength);
      this.gamePlay.redrawPositions(enemyPos);
    }
    if (this.level === 4) {
      userNum = 2;
      this.gamePlay.drawUi(themes.mountain);
      this.gamePlay.redrawPositions(this.position);
      const userPos = this.teamNewLevel(this.userPositions, this.userTypes, userLevel, userNum);
      this.gamePlay.redrawPositions(userPos);
      const enemyPos = this.teamNewLevel(this.enemyPositions, this.enemyTypes, this.level, enemyLength);
      this.gamePlay.redrawPositions(enemyPos);
    }
  }

  // generation of new characters in accordance with a current level
  teamNewLevel(teamPositions, teamArr, level, charAmount) {
    const team = generateTeam(teamArr, level, charAmount);
    for (const char of team) {
      const pos = this.getRandomPosition(teamPositions);
      const placedChar = new PositionedCharacter(char, pos);
      this.position.push(placedChar);
    }
    return this.position;
  }

  checkGameStatus() {
    // to get array of current characters
    this.enemyTeam = this.position.filter((el) => ['vampire', 'undead', 'daemon'].includes(el.character.type));
    this.userTeam = this.position.filter((el) => ['bowman', 'swordsman', 'magician'].includes(el.character.type));

    // check status of the game
    if (this.userTeam.length === 0) {
      GamePlay.showMessage('Game over');
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
    }
    if (this.level >= 4 && this.enemyTeam.length === 0) {
      GamePlay.showMessage('Congrats! You`re win!');
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
    }
    if (this.enemyTeam.length === 0) {
      this.level += 1;
      for (const user of this.userTeam) {
        this.score += user.character.health;
        user.character.level += 1;
        user.character.health += 80;
        if (user.character.health > 100) {
          user.character.health = 100;
        }
        user.character.attack = Math.max(user.character.attack, (user.character.attack * (80 + user.character.health)) / 100);
        user.character.defence = Math.max(user.character.defence, (user.character.defence * (80 + user.character.health)) / 100);
      }
      this.newLevel();
    }
  }

  onCellClick(index) {
    // TODO: react to click
    const currentPosition = this.position.find((el) => el.position === index);

    // to get cells occupied by enemy team
    this.occupiedCells = this.position.filter((pos) => ['vampire', 'undead', 'daemon'].includes(pos.character.type));
    this.occupiedCells = this.occupiedCells.map((pos) => pos.position);

    // character selection
    if (this.occupiedCells.includes(index) && !this.attackOpt.includes(index)) {
      GamePlay.showError('Please choose a relevant character');
    } else if (currentPosition && !this.occupiedCells.includes(index)) {
      this.position.forEach((el) => this.gamePlay.deselectCell(el.position));
      this.gamePlay.selectCell(index);
      this.selected = currentPosition;
      this.movements = this.getMovesOptions(this.selected.position, this.selected.character.moveDistance);
      this.attackOpt = this.getAttackOptions(this.selected.position, this.selected.character.attackDistance);
    }
    // to make a move
    if (this.movements.includes(index) && !this.occupiedCells.includes(index)) {
      this.gamePlay.deselectCell(this.selected.position);
      this.selected.position = index;
      this.gamePlay.redrawPositions(this.position);
      this.gamePlay.selectCell(index);
      this.timeout = setTimeout(this.enemyAction.bind(this), 200);
    } else if (this.selected && this.attackOpt.includes(index) && this.occupiedCells.includes(index)) {
      // user to attack enemy
      const target = currentPosition;
      this.toAttack(index, this.selected.character, target.character);
      this.timeout = setTimeout(this.enemyAction.bind(this), 200);
      this.checkGameStatus();
    }
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const currentPosition = this.position.find((el) => el.position === index);

    // tooltip
    const icons = {
      level: '\u{1F396}',
      attack: '\u{2694}',
      defence: '\u{1F6E1}',
      health: '\u{2764}',
    };

    if (currentPosition) {
      const message = `${icons.level}${currentPosition.character.level}${icons.attack}${currentPosition.character.attack}${icons.defence}${currentPosition.character.defence}${icons.health}${currentPosition.character.health}`;
      this.gamePlay.showCellTooltip(message, index);
      this.gamePlay.setCursor(cursors.pointer);
      if (['vampire', 'undead', 'daemon'].includes(currentPosition.character.type)) {
        this.gamePlay.setCursor(cursors.notallowed);
      }
    }
    // to change cursors
    if (this.selected) {
      if (!currentPosition) {
        this.movements = this.getMovesOptions(this.selected.position, this.selected.character.moveDistance);
        if (this.movements.includes(index)) {
          this.gamePlay.selectCell(index, 'green');
          this.gamePlay.setCursor(cursors.pointer);
        } else {
          this.gamePlay.setCursor(cursors.auto);
        }
      } else if (currentPosition && ['vampire', 'undead', 'daemon'].includes(currentPosition.character.type)) {
        this.attackOpt = this.getAttackOptions(this.selected.position, this.selected.character.attackDistance);
        if (this.attackOpt.includes(index)) {
          this.gamePlay.selectCell(index, 'red');
          this.gamePlay.setCursor(cursors.crosshair);
        }
      }
    }
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    if (this.selected && this.selected.position !== index) {
      this.gamePlay.deselectCell(index);
    }
  }

  arrOfIndexes() {
    const area = [];
    let rowArr = [];
    for (let i = 0; i < this.gamePlay.boardSize ** 2; i++) {
      rowArr.push(i);
      if (rowArr.length === this.gamePlay.boardSize) {
        area.push(rowArr);
        rowArr = [];
      }
    }
    return area;
  }

  getMovesOptions(currentPosition, distance) {
    const boardSize = this.gamePlay.boardSize;
    const columnIndex = currentPosition % boardSize;
    const rowIndex = Math.floor(currentPosition / boardSize);
    const availableIndexArr = [];
    for (let i = 1; i <= distance; i += 1) {
      // one column to the right
      let availableColumnIndex = columnIndex + i;
      if (availableColumnIndex < boardSize) {
        availableIndexArr.push(this.area[rowIndex][availableColumnIndex]);
      }

      // one line down
      let availableRowIndex = rowIndex + i;
      if (availableRowIndex < boardSize) {
        availableIndexArr.push(this.area[availableRowIndex][columnIndex]);
      }

      // diagonal down/right
      if ((availableRowIndex < boardSize) && (availableColumnIndex < boardSize)) {
        availableIndexArr.push(this.area[availableRowIndex][availableColumnIndex]);
      }

      // one column to the left
      availableColumnIndex = columnIndex - i;
      if (availableColumnIndex >= 0) {
        availableIndexArr.push(this.area[rowIndex][availableColumnIndex]);
      }

      // diagonal down/left
      if ((availableColumnIndex >= 0) && (availableRowIndex < boardSize)) {
        availableIndexArr.push(this.area[availableRowIndex][availableColumnIndex]);
      }

      // one line up
      availableRowIndex = rowIndex - i;
      if (availableRowIndex >= 0) {
        availableIndexArr.push(this.area[availableRowIndex][columnIndex]);
      }

      // diagonal up/left
      if ((availableRowIndex >= 0) && (availableColumnIndex >= 0)) {
        availableIndexArr.push(this.area[availableRowIndex][availableColumnIndex]);
      }

      // diagonal up/right
      availableColumnIndex = columnIndex + i;
      if ((availableColumnIndex < boardSize) && (availableRowIndex >= 0)) {
        availableIndexArr.push(this.area[availableRowIndex][availableColumnIndex]);
      }
    }
    return availableIndexArr;
  }

  getAttackOptions(currentPosition, distance) {
    const boardSize = this.gamePlay.boardSize;
    const columnIndex = currentPosition % boardSize;
    const rowIndex = Math.floor(currentPosition / boardSize);
    let availableIndexArr = [];
    let upwardAttack = rowIndex - distance;
    let downAttack = rowIndex + distance;
    let leftAttack = columnIndex - distance;
    let rightAttack = columnIndex + distance;
    if (upwardAttack < 0) {
      upwardAttack = 0;
    } else if (downAttack > boardSize - 1) {
      downAttack = boardSize - 1;
    } else if (leftAttack < 0) {
      leftAttack = 0;
    } else if (rightAttack > boardSize - 1) {
      rightAttack = boardSize - 1;
    }
    for (let i = upwardAttack; i <= downAttack; i++) {
      for (let j = leftAttack; j <= rightAttack; j++) {
        availableIndexArr.push(this.area[i][j]);
      }
    }
    availableIndexArr = availableIndexArr.filter((el) => el !== currentPosition);
    availableIndexArr = availableIndexArr.filter((el) => el >= 0 && el <= 63);
    return availableIndexArr;
  }

  toAttack(index, activeChar, target) {
    const damageScores = Math.floor(Math.max(activeChar.attack - target.defence, activeChar.attack * 0.1));
    target.health -= damageScores;
    if (target.health <= 0) {
      target.health = 0;
      this.selected = null;
      this.position = this.position.filter((char) => char.position !== index);
    }
    this.gamePlay.deselectCell(index);
    this.gamePlay.showDamage(index, damageScores).then(() => {
      this.checkGameStatus();
      this.gamePlay.redrawPositions(this.position);
    });
  }

  enemyAction() {
    this.gamePlay.deselectCell(this.selected.position);
    this.player = 0;
    this.enemyTeam = this.position.filter((char) => ['vampire', 'undead', 'daemon'].includes(char.character.type));
    this.userTeam = this.position.filter((el) => ['bowman', 'swordsman', 'magician'].includes(el.character.type));
    const randomNum = Math.floor(Math.random() * this.enemyTeam.length);
    const randomEnemyChar = () => this.enemyTeam[randomNum];
    if (randomEnemyChar()) {
      const moves = randomEnemyChar().character.moveDistance;
      const attacks = randomEnemyChar().character.attackDistance;
      const randPos = randomEnemyChar().position;
      this.movements = this.getMovesOptions(randPos, moves);
      this.attackOpt = this.getAttackOptions(randPos, attacks);

      // if there is someone to be attacked
      for (const user of this.userTeam) {
        if (this.attackOpt.indexOf(user.position) !== -1) {
          const randChar = randomEnemyChar().character;
          this.toAttack(user.position, randChar, user.character);
          this.player = 1;
          return;
        }
        // to make a move
        randomEnemyChar().position = this.getRandomPosition(this.movements);
        this.gamePlay.redrawPositions(this.position);
        this.player = 1;
        return;
      }
    }
  }
}
