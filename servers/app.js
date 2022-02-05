var express = require('express')
var cool = require('cool-ascii-faces');
var app = express()
var server = require('http').Server(app);
var path = require('path')
//跨域问题后面处理
var io = require('socket.io')(server,{cors:true});
var PORT = process.env.PORT || 5000
var playerCount=0;
var visitorCount=0;
var whiteSeleted=false;
var whiteplayer={
    id:'whiteplayer',
    playing:true,
    color:'white',
};
var blackplayer={
    id:'blackplayer',
    playing:true,
    color:'black',
};
var visitor={
    id:'visitor'+(visitorCount+1),
    playing:false,
    color:''
}
var players=[]
var visitors=[]
var spectatorCount=0;
var gameData=0;
server.listen(PORT,()=>{
    console.log(`Server running at port ${PORT}`)
});

io.on('connection',(socket)=>{
    socket.emit('connected','connect successful')
    switch(playerCount){
        case 0:
            playerCount++;
            if (Math.random()>0.5){
                socket.emit('player',whiteplayer);
                whiteSeleted=true;
                players.push(whiteplayer)
                socket.username='whiteplayer'
                console.log('white join')
            }
            else {
                socket.emit('player',blackplayer);
                players.push(blackplayer)
                socket.username='blackplayer'
                console.log('black join')
            }
            break;
        case 1:
            playerCount++;
            if (whiteSeleted){
                socket.emit('player',blackplayer);
                players.push(blackplayer)
                socket.username='blackplayer'
                console.log('Black joined')
            }
            else 
                socket.emit('player',whiteplayer);
                players.push(whiteplayer)
                socket.username='whiteplayer'
                console.log('White joined')
            break;
        default:
            visitors.push(visitor)
            visitorCount++;
            spectatorCount++;
            socket.username='visitor'+visitorCount
            socket.emit('player',visitor)
            console.log('Spectator joined')
            if (gameData!==0){
                socket.emit('Board',gameData)
            }
    }
    socket.on('move',(data)=>{
        gameData=data
        console.log(data)
        socket.broadcast.emit('Board',data)});
    // if (whiteTurn){
    //     socket.on('yourTurn',()=>{
    //         socket.emit('turn','Your turn')
    //     });}
    socket.on('disconnect',()=>{
        console.log(playerCount);
        console.log(socket.username)
        console.log(1000)
        switch(socket.username){
            case 'whiteplayer':
                whiteSeleted=false;
                playerCount--;
                console.log('White player left')
                gameData=0;
                break;
            case 'blackplayer':
                playerCount--;
                console.log('Black player left')
                gameData=0;
                break;
            default:
                spectatorCount--;
                console.log('Visitor'+ socket.username+'left')
        }
    })
})
app
.use(express.static(__dirname.replace('servers','')))
.get('/cool', (req, res) => res.send(cool()))
// app.get("*", (req, res) =>
// {   dirname = __dirname.replace('servers','index.html')
//     console.log(path.join(dirname))
//     res.sendFile(path.join(dirname))}
//     // {
//     //     res.sendFile(path.join(__dirname, '/index.html'));
//     //     console.log(path.join(__dirname, '/index.html'))
//     // }
// );


