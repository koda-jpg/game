const EMPTY = 0, BLACK = 1, WHITE = 2;
let board = [];
let currentPlayer = BLACK;
// Single-player 設定: true にすると人間 vs AI (人間は `humanPlayer`)
let singlePlayer = true;
let humanPlayer = BLACK;
let aiTimer = null;

const boardEl = document.getElementById('board');
const turnEl = document.getElementById('turnPlayer');
const scoreBlackEl = document.getElementById('scoreBlack');
const scoreWhiteEl = document.getElementById('scoreWhite');
const messageEl = document.getElementById('message');
const restartBtn = document.getElementById('restartBtn');
const modeAIEl = document.getElementById('modeAI');
const modeHumanEl = document.getElementById('modeHuman');


function initBoard(){
  board = Array.from({length:8},()=>Array(8).fill(EMPTY));
  board[3][3] = WHITE; board[3][4] = BLACK;
  board[4][3] = BLACK; board[4][4] = WHITE;
  currentPlayer = BLACK;
}

function renderBoard(){
  boardEl.innerHTML = '';
  const valid = getValidMoves(currentPlayer);
  const showHintsNow = (singlePlayer ? (currentPlayer === humanPlayer) : true);
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x; cell.dataset.y = y;
      const v = board[y][x];
      if(v===BLACK || v===WHITE){
        const disc = document.createElement('div');
        disc.className = 'disc ' + (v===BLACK? 'black':'white');
        cell.appendChild(disc);
        cell.classList.add('disabled');
      } else {
        if(valid.some(p => p.x===x && p.y===y)){
          if(showHintsNow){
            const hint = document.createElement('div');
            hint.className = 'hint';
            cell.appendChild(hint);
          }
        } else {
          cell.classList.add('disabled');
        }
      }
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    }
  }
  updateScores();
  turnEl.textContent = currentPlayer===BLACK? '黒':'白';
}

function updateScores(){
  countScores();
}

function inBounds(x,y){return x>=0 && x<8 && y>=0 && y<8}

function getValidMoves(player){
  const opponent = player===BLACK?WHITE:BLACK;
  const moves = [];
  for(let y=0;y<8;y++){
    for(let x=0;x<8;x++){
      if(board[y][x]!==EMPTY) continue;
      if(canFlipFrom(x,y,player)) moves.push({x,y});
    }
  }
  return moves;
}

const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

function canFlipFrom(x,y,player){
  const opponent = player===BLACK?WHITE:BLACK;
  for(const [dx,dy] of dirs){
    let nx=x+dx, ny=y+dy; let found=false;
    while(inBounds(nx,ny) && board[ny][nx]===opponent){
      nx+=dx; ny+=dy; found=true;
    }
    if(found && inBounds(nx,ny) && board[ny][nx]===player) return true;
  }
  return false;
}

function applyMove(x,y,player){
  if(!canFlipFrom(x,y,player)) return false;
  board[y][x] = player;
  const opponent = player===BLACK?WHITE:BLACK;
  for(const [dx,dy] of dirs){
    let nx=x+dx, ny=y+dy; let toFlip=[];
    while(inBounds(nx,ny) && board[ny][nx]===opponent){
      toFlip.push([nx,ny]); nx+=dx; ny+=dy;
    }
    if(toFlip.length>0 && inBounds(nx,ny) && board[ny][nx]===player){
      for(const [fx,fy] of toFlip) board[fy][fx]=player;
    }
  }
  return true;
}

function onCellClick(e){
  const x = Number(this.dataset.x), y = Number(this.dataset.y);
  // シングルプレイ時、現在のターンが人間でなければ無視する
  if(singlePlayer && currentPlayer !== humanPlayer) return;
  if(!applyMove(x,y,currentPlayer)) return;
  nextTurn();
}

// --- AI utilities ---
function countFlips(x,y,player){
  const opponent = player===BLACK?WHITE:BLACK;
  let total = 0;
  for(const [dx,dy] of dirs){
    let nx = x+dx, ny = y+dy; let cnt = 0;
    while(inBounds(nx,ny) && board[ny][nx]===opponent){ cnt++; nx+=dx; ny+=dy; }
    if(cnt>0 && inBounds(nx,ny) && board[ny][nx]===player) total += cnt;
  }
  return total;
}

function bestAIMove(player){
  const moves = getValidMoves(player);
  if(moves.length===0) return null;
  let best = moves[0];
  let bestScore = -1;
  for(const m of moves){
    const s = countFlips(m.x,m.y,player);
    if(s>bestScore){ bestScore = s; best = m; }
  }
  return best;
}

function aiMove(){
  if(!singlePlayer) return;
  const move = bestAIMove(currentPlayer);
  if(!move){
    // 合法手なし -> nextTurn でパス処理
    nextTurn();
    return;
  }
  messageEl.textContent = (currentPlayer===BLACK? '黒':'白') + '（AI）が考えています...';
  // clear previous timer if any
  if(aiTimer) { clearTimeout(aiTimer); aiTimer = null; }
  aiTimer = setTimeout(()=>{
    // if mode changed to human while waiting, abort
    if(!singlePlayer) { aiTimer = null; messageEl.textContent = ''; return; }
    applyMove(move.x, move.y, currentPlayer);
    aiTimer = null;
    nextTurn();
  }, 500);
}

function setMode(mode){
  const wasSingle = singlePlayer;
  singlePlayer = (mode === 'ai');
  if(!singlePlayer){
    // switching to human: cancel pending AI timer and clear status
    if(aiTimer){ clearTimeout(aiTimer); aiTimer = null; }
    messageEl.textContent = '';
  } else {
    // switched to AI: if it's AI's turn, trigger AI move
    if(currentPlayer !== humanPlayer){
      // small delay to allow UI update
      setTimeout(()=>{ if(singlePlayer) aiMove(); }, 50);
    }
  }
  // re-render to update hints visibility
  renderBoard();
}

function nextTurn(){
  currentPlayer = currentPlayer===BLACK?WHITE:BLACK;
  const valid = getValidMoves(currentPlayer);
  if(valid.length===0){
    const otherValid = getValidMoves(currentPlayer===BLACK?WHITE:BLACK);
    if(otherValid.length===0){
      // game over
      const {b,w} = countScores();
      messageEl.textContent = b===w? '引き分け': (b>w? '黒の勝ち！':'白の勝ち！');
      renderBoard();
      return;
    } else {
      // pass
      messageEl.textContent = (currentPlayer===BLACK? '黒':'白') + ' は手がありません（パス）';
      currentPlayer = currentPlayer===BLACK?WHITE:BLACK;
    }
  } else {
    // シングルプレイの場合、人間以外のターンならヒントを非表示にして通知を出す
    if(singlePlayer && currentPlayer !== humanPlayer){
      messageEl.textContent = '相手の手番です';
    } else {
      messageEl.textContent = '';
    }
  }
  renderBoard();
  // AI のターンなら自動で着手させる
  if(singlePlayer && currentPlayer !== humanPlayer){
    aiMove();
  }
}

function countScores(){
  let b=0,w=0;
  for(let y=0;y<8;y++) for(let x=0;x<8;x++){
    if(board[y][x]===BLACK) b++; if(board[y][x]===WHITE) w++;
  }
  scoreBlackEl.textContent = b; scoreWhiteEl.textContent = w;
  return {b,w};
}


restartBtn.addEventListener('click', ()=>{initBoard(); messageEl.textContent=''; renderBoard();});

// mode handlers
if(modeAIEl) modeAIEl.addEventListener('change', ()=>{ if(modeAIEl.checked) setMode('ai'); });
if(modeHumanEl) modeHumanEl.addEventListener('change', ()=>{ if(modeHumanEl.checked) setMode('human'); });

// init
initBoard(); renderBoard();
