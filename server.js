const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('hbs');
const app = express();
const fs = require('fs');

app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}))
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.render('index.hbs');
})

app.post('/chat', (req, res) => {

  let chatData = [];
  let id;
  let username = req.body.username.toLocaleLowerCase();
  let message = req.body.message;
  let timeout = req.body.timeout;
  let expiration_date;
  let date_time = new Date();

  //Format date
  let date = date_time.getDate();
  let month = date_time.getMonth() + 1;
  let year = date_time.getFullYear();
  let hours = date_time.getHours();
  let minutes = date_time.getMinutes();
  let seconds = date_time.getSeconds();
  expiration_date = `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;

  //Check if the if exist if not create one to store chats
  if (!(fs.existsSync('./chats.txt'))) {
    fs.writeFileSync('./chats.txt', []);
  }

  try {
    chatData = JSON.parse(fs.readFileSync('./chats.txt'));
  } catch (e) {

  }

  //Get last object ID
  if (chatData.length > 0) {
    let lastObj = chatData[chatData.length - 1]
    id = lastObj['id'] + 1;
  } else {
    id = 1;
  }

  //Post Obj
  let postData = {
    id: id,
    username,
    message,
    timeout,
    expiration_date
  }

  chatData.push(postData);
  let chat = JSON.stringify(chatData);

  //Write chat to file
  fs.writeFile('./chats.txt', chat, (err) => {
    if (err) {
      console.log("err")
    } else {
      console.log("Success");
    }
  })

  //Response id
  res.send({
    id
  });
})

app.get('/chat/:id', (req, res) => {
  let chatId = req.params.id;
  let data;

  //Read chats from file
  let chats = JSON.parse(fs.readFileSync('./chats.txt'));
  let selectedChat = chats.find(chat => chat.id == chatId);

  if (selectedChat) {
    data = {
      username: selectedChat['username'],
      message: selectedChat['message'],
      expiration_date: selectedChat['expiration_date']
    }
  } else {
    data = {
      res: "No ID Found"
    }
  }

  res.send(data);
})

app.get('/chats/:username', (req, res) => {
  let username = req.params.username;

  //Read chats from file
  let chats = JSON.parse(fs.readFileSync('./chats.txt'));
  let userChat = chats.filter(chat => chat.username == username);

  if (userChat.length > 0) {
    //Delete keys from output
    userChat.forEach((obj, i) => {
      obj['username'] && delete obj['username'];
      obj['timeout'] && delete obj['timeout'];
      obj['expiration_date'] && delete obj['expiration_date'];
    })
  } else {
    userChat = {
      res: "No Username found"
    }
  }
  res.send(userChat);
})


app.listen(3000, () => {
  console.log("App running on port 3000");
})