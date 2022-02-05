// --- Begin Example JS --------------------------------------------------------
var board = null
var game = new Chess()
var $status = $('#status')
var $fen = $('#fen')
var $pgn = $('#pgn')
var $btn = $('#btn')
var socket=io()
var player;
var move;
$btn.hide()
socket.on('connected',(data)=>{
  alert(data)
})
socket.on('player',playerObj=>{
  player=playerObj
  console.log(player)
  if (player.color==='black'){
  board.orientation('black')
}
})
socket.on('Board',data=>{
  if (player.color==='black'){
    var newfen=data.fen.replace(/[RNBQP]/g, "1");
  }
  else if (player.color==='white'){
    var newfen=data.fen.replace(/[rnbqp]/g, "1");
  }
  else{
    newfen=data.fen
  }
  board.position(newfen)
  game.move(data.move)
  if (player.playing){
    alert('It is now your turn')}
  updateStatus()
})
function reload() {
board = null
game = new Chess()
$status = $('#status')
$fen = $('#fen')
$pgn = $('#pgn')
config.position='start'
board = Chessboard('myBoard', config)
}

function onDragStart (source, piece, position, orientation) {
  // do not pick up pieces if the game is over
  if (game.game_over()) return false
  // alert(player.color==='white')
  // alert(player.color==='black')
  // only pick up pieces for the side to move
  if ((player.color==='black'&&game.turn() === 'w' && piece.search(/^b/) !== -1) ||
      (player.color==='white'&&game.turn() === 'b' && piece.search(/^w/) !== -1)) {
    return false
  }
  if((player.color==='black'&&game.turn() === 'w') ||
    (player.color==='white'&&game.turn() === 'b' )){
      return false
    }
  if (!(player.playing)) {
      return false}
}

function onDrop (source, target) {
  // see if the move is legal
  move = game.move({
    from: source,
    to: target,
    promotion: 'q' // NOTE: always promote to a queen for example simplicity
  })

  // illegal move
  if (move === null) return 'snapback'

  updateStatus()
}

// update the board position after the piece snap
// for castling, en passant, pawn promotion
function onSnapEnd () {
  //Hide black pieces
  socket.emit('move',{fen:game.fen(),move:move})
}

function updateStatus () {
  var status = ''

  var moveColor = 'White'
  if (game.turn() === 'b') {
    moveColor = 'Black'
  }

  // checkmate?
  if (game.in_checkmate()) {
    status = 'Game over, ' + moveColor + ' is in checkmate.'
  }

  // draw?
  else if (game.in_stalemate()){
    status = 'Game over, drawn by stalemate'
  }

  else if (game.in_repeat()){
    status = 'Game over, drawn by three fold repetition'
  }

  else if (game.in_draw()) {
    status = 'Game over, drawn position'
  }

  // game still on
  else {
    status = moveColor + ' to move'

    // check?
    if (game.in_check()) {
      status += ', ' + moveColor + ' is in check'
    }
  }
  if (!player.playing){
    status='(Visitor mode)'+status
  }
  else {
    status='(Player mode)'+status
  }
  $status.html(status)
  if (game.game_over()){
    $fen.html(game.fen())
    $pgn.html(game.pgn())
    board.position(game.fen())
    // $btn.show()
  }
}

var config = {
  draggable: true,
  position: 'start',
  onDragStart: onDragStart,
  onDrop: onDrop,
  onSnapEnd: onSnapEnd
}
board = Chessboard('myBoard', config)


updateStatus()

// --- End Example JS ----------------------------------------------------------