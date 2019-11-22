var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
var app = express();
var mysql = require("sync-mysql");
var async = require("async");


/*
var connection = new mysql({
    host : [my host name],
    user : [my user name],
    password : [my user password],
    database : [db name]
});
*/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


var connection = new mysql({
    host : 'localhost',
    user : 'root',
    password : '/* my pwd */',
    database : 'opensource'
});

// 사용자 회원가입


// 사용자 로그인


// 조도 값 받기
// POST : 172.25.242.68/illuminance
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "lux_DT": "2019-11-22T13:48:58.950Z",
               "lux_Value": 50
             }
*/



// 온도 값 받기
// POST : 172.25.242.68/tempertaure
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "C_DT": "2019-11-22T13:48:58.950Z",
               "C_Value": 50
             }
*/

app.post('/temperature', function(req, res) {
    var value = req.body.value;
    var id = req.body.id;
    // var value = req.body.value;
    async.waterfall([
        function (callback) {
            var rows = connection.query('select * from user where user_Id ="'+id+'"');
            callback(null, rows.length);
        },
        function (rowsLength, callback) {
            var idValidate;
            if(rowsLength != 0) {
                connection.query('insert into temperature values("'+id+'", now(2), '+value+');');
                idValidate = true;
            }
            else
                idValidate = false;
            callback(null, idValidate);
        },
        function(idValidate, callback) {
            var result;
            if(idValidate) {
                var rows = connection.query('select C_DT, C_Value from temperature where user_Id ="'+id+ '" order by C_DT desc limit 1');
                var C_DT = rows[0].C_DT;
                var C_Value = rows[0].C_Value;
                result = { 
                    C_DT,
                    C_Value                  
                 };
            }
            callback(null, result);
        }
    ],
        function (err, result) {
            console.log(result);
            res.send(result);
        }
    )
});


// 습도 값 받기
// POST : 172.25.242.68/humidity
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "SH_DT": "2019-11-22T13:48:58.950Z",
               "SH_Value": 50
             }
*/


// 초음파 거리 값 받기
// POST : 172.25.242.68/ultrasound
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "dist_DT": "2019-11-22T13:48:58.950Z",
               "dist_Value": 50
             }
*/
  

// 미세먼지 pm2.5 값 받기
// POST : 172.25.242.68/particulate_matter2.5
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "pm2.5_DT": "2019-11-22T13:48:58.950Z",
               "pm2.5_Value": 50
             }
*/
  

// 미세먼지 pm10 값 받기
// POST : 172.25.242.68/particulate_matter10
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "pm10_DT": "2019-11-22T13:48:58.950Z",
               "pm10_Value": 50
             }
*/
  


app.listen(3000, function () {
    console.log('Server is running in port 3000');
});