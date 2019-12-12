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
    password : 'my password',
    database : 'opensource'
});


app.post('/texttest', function(req,res) {  
    var text = req.query.text;
    console.log(text);
    res.send(text);
});
 
// client 요청으로 가장 최근의 센서 값 응답하기  
// GET : ---.--.---.--/client/ 해당 센서 /current
// parameter : X  , return : {"value" : value };


app.get('/client/temperature/current', function(req,res) {
    async.waterfall([
        function (callback) {
            var rows = connection.query('select * from temperature  order by C_DT desc limit 1');
            callback(null, rows);
        },
        function (rows, callback) {
            var value = rows[0].C_Value;
            var time = rows[0].C_DT;
            callback(null, value, time);
        }
    ],
        function (err, value, time) {
            console.log(value);
            var v = value;
            var json = new Array();

            json.push( {"value" : v,
                        "time" : time,
                        "sensor" : "temperature"} ) ;
            res.send(json);
        }
    )
});

// client 요청으로 가장 최근의 센서 값 응답하기  (조도)
// GET : ---.--.---.--/client/illuminate/current
// parameter : X  , return : {"value" : value };
app.get('/client/illuminance/current', function(req,res) {
    async.waterfall([
        function (callback) {
            var rows = connection.query('select lux_Value from illuminance  order by lux_DT desc limit 1');
            callback(null, rows);
        },
        function (rows, callback) {
            var value = rows[0].lux_Value;
            callback(null, value);
        }
    ],
        function (err, value) {
            console.log(value);
            var v = value;
            var json = new Array();

            json.push( {"value" : v} ) ;
            res.send(json);
        }
    )
});


// client 요청으로 가장 최근의 센서 값 응답하기  (습도)
// GET : ---.--.---.--/client/humidity/current
// parameter : X  , return : {"value" : value };
app.get('/client/humidity/current', function(req,res) {
    async.waterfall([
        function (callback) {
            var rows = connection.query('select SH_Value from humidity  order by SH_DT desc limit 1');
            callback(null, rows);
        },
        function (rows, callback) {
            var value = rows[0].SH_Value;
            callback(null, value);
        }
    ],
        function (err, value) {
            console.log(value);
            var v = value;
            var json = new Array();

            json.push( {"value" : v} ) ;
            res.send(json);
        }
    )
});


// client 요청으로 가장 최근의 센서 값 응답하기  (초음파)
// GET : ---.--.---.--/client/ultrasound/current
// parameter : X  , return : {"value" : value };
app.get('/client/ultrasound/current', function(req,res) {
    async.waterfall([
        function (callback) {
            var rows = connection.query('select dist_Value from ultrasound order by dist_DT desc limit 1');
            callback(null, rows);
        },
        function (rows, callback) {
            var value = rows[0].dist_Value;
            callback(null, value);
        }
    ],
        function (err, value) {
            console.log(value);
            var v = value;
            var json = new Array();

            json.push( {"value" : v} ) ;
            res.send(json);
        }
    )
});


// client 요청으로 가장 최근의 센서 값 응답하기  (미세먼지 2.5)
// GET : ---.--.---.--/client/particulate_matter2/current
// parameter : X  , return : {"value" : value };
app.get('/client/particulate_matter2/current', function(req,res) {
    async.waterfall([
        function (callback) {
            var rows = connection.query('select `pm2.5_Value` as PM from `particulate_matter2.5`  order by `pm2.5_DT` desc limit 1');
            callback(null, rows);
        },
        function (rows, callback) {
            var value = rows[0].PM;
            callback(null, value);
        }
    ],
        function (err, value) {
            console.log(value);
            var v = value;
            var json = new Array();

            json.push( {"value" : v} ) ;
            res.send(json);
        }
    )
});


// client 요청으로 가장 최근의 센서 값 응답하기  (미세먼지 10)
// GET : ---.--.---.--/client/particulate_matter10/current
// parameter : X  , return : {"value" : value };
app.get('/client/particulate_matter10/current', function(req,res) {
    async.waterfall([
        function (callback) {
            var rows = connection.query('select pm10_Value from particulate_matter10 order by pm10_DT desc limit 1');
            callback(null, rows);
        },
        function (rows, callback) {
            var value = rows[0].pm10_Value;
            callback(null, value);
        }
    ],
        function (err, value) {
            console.log(value);
            var v = value;
            var json = new Array();

            json.push( {"value" : v} ) ;
            res.send(json);
        }
    )
});

// 온도 값 받기
// POST : 172.25.242.68/tempertaure
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "C_DT": "2019-11-22T13:48:58.950Z",
               "C_Value": 50
             }
*/
app.get('/temperature', function(req, res) {
    var value = req.query.value;
    var id = req.query.id;
    // var value = req.body.value;
    async.waterfall([
        function (callback) {
            var rows = connection.query('select * from user where user_Id ="'+id+'"');
            callback(null, rows.length);
        },
        function (rowsLength, callback) {
            var idValidate;
            if(rowsLength != 0) {
                connection.query('insert into temperature values("'+id+'", now(), '+value+');');
                idValidate = true;
            }
            else
                idValidate = false;
            callback(null, idValidate);
        },
        function(idValidate, callback) {
            if(idValidate) {
                var rows = connection.query('select CONVERT_TZ(C_DT, "+0:00","+9:00") as C_DT, C_Value from temperature where user_Id ="'+id+ '" order by C_DT desc limit 1');
                var C_DT = rows[0].C_DT;
                var C_Value = rows[0].C_Value;
            }
            callback(null, C_DT, C_Value);
        },
        function (dt, value, callback) {
            var result;
            var tokenizedDate = new Array();
            tokenizedDate.push(dt.substring(0,4));
            tokenizedDate.push(dt.substring(5,7));
            tokenizedDate.push(dt.substring(8,10));
            tokenizedDate.push(dt.substring(11,13));
            tokenizedDate.push(dt.substring(14,16));
            tokenizedDate.push(dt.substring(17,22));

            result = {
                "year" : tokenizedDate[0],
                "month" : tokenizedDate[1],
                "day" : tokenizedDate[2], 
                "hour" : tokenizedDate[3],
                "minute" : tokenizedDate[4],
                "second" : tokenizedDate[5],
                "value" : value
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

// 조도 값 받기
// POST : 172.25.242.68/illuminance
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "lux_DT": "2019-11-22T13:48:58.950Z",
               "lux_Value": 50
             }
*/

app.get('/illuminance', function(req, res) {
    var value = req.query.value;
    var id = req.query.id;
    // var value = req.body.value;
    async.waterfall([
        function (callback) {
            var rows = connection.query('select * from user where user_Id ="'+id+'"');
            callback(null, rows.length);
        },
        function (rowsLength, callback) {
            var idValidate;
            if(rowsLength != 0) {
                connection.query('insert into illuminance(user_Id, lux_DT, lux_Value) values("'+id+'", now(), '+value+');');
                idValidate = true;
            }
            else
                idValidate = false;
            callback(null, idValidate);
        },
        function(idValidate, callback) {
            if(idValidate) {
                var rows = connection.query('select CONVERT_TZ(lux_DT, "+0:00","+9:00") as lux_DT, lux_Value from illuminance where user_Id ="'+id+ '" order by lux_DT desc limit 1');
                var lux_DT = rows[0].lux_DT;
                var lux_Value = rows[0].lux_Value;
            }
            callback(null, lux_DT, lux_Value);
        },
        function (dt, value, callback) {
            var result;
            var tokenizedDate = new Array();
            tokenizedDate.push(dt.substring(0,4));
            tokenizedDate.push(dt.substring(5,7));
            tokenizedDate.push(dt.substring(8,10));
            tokenizedDate.push(dt.substring(11,13));
            tokenizedDate.push(dt.substring(14,16));
            tokenizedDate.push(dt.substring(17,22));

            result = {
                "year" : tokenizedDate[0],
                "month" : tokenizedDate[1],
                "day" : tokenizedDate[2], 
                "hour" : tokenizedDate[3],
                "minute" : tokenizedDate[4],
                "second" : tokenizedDate[5],
                "value" : value
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
// humidity , SH_DT, SH_Value
app.get('/humidity', function(req, res) {
    var value = req.query.value;
    var id = req.query.id;
    // var value = req.body.value;
    async.waterfall([
        function (callback) {
            var rows = connection.query('select * from user where user_Id ="'+id+'"');
            callback(null, rows.length);
        },
        function (rowsLength, callback) {
            var idValidate;
            if(rowsLength != 0) {
                connection.query('insert into humidity(user_Id, SH_DT, SH_Value) values("'+id+'", now(), '+value+');');
                idValidate = true;
            }
            else
                idValidate = false;
            callback(null, idValidate);
        },
        function(idValidate, callback) {
            if(idValidate) {
                var rows = connection.query('select CONVERT_TZ(SH_DT, "+0:00","+9:00") as SH_DT, SH_Value from humidity where user_Id ="'+id+ '" order by SH_DT desc limit 1');
                var SH_DT = rows[0].SH_DT;
                var SH_Value = rows[0].SH_Value;
            }
            callback(null, SH_DT, SH_Value);
        },
        function (dt, value, callback) {
            var result;
            var tokenizedDate = new Array();
            tokenizedDate.push(dt.substring(0,4));
            tokenizedDate.push(dt.substring(5,7));
            tokenizedDate.push(dt.substring(8,10));
            tokenizedDate.push(dt.substring(11,13));
            tokenizedDate.push(dt.substring(14,16));
            tokenizedDate.push(dt.substring(17,22));

            result = {
                "year" : tokenizedDate[0],
                "month" : tokenizedDate[1],
                "day" : tokenizedDate[2], 
                "hour" : tokenizedDate[3],
                "minute" : tokenizedDate[4],
                "second" : tokenizedDate[5],
                "value" : value
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


// 초음파 거리 값 받기
// POST : 172.25.242.68/ultrasound
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "dist_DT": "2019-11-22T13:48:58.950Z",
               "dist_Value": 50
             }
*/
// ultrasound , dist_DT, dist_Value
app.get('/ultrasound', function(req, res) {
    var value = req.query.value;
    var id = req.query.id;
    // var value = req.body.value;
    async.waterfall([
        function (callback) {
            var rows = connection.query('select * from user where user_Id ="'+id+'"');
            callback(null, rows.length);
        },
        function (rowsLength, callback) {
            var idValidate;
            if(rowsLength != 0) {
                connection.query('insert into ultrasound(user_Id, dist_DT, dist_Value) values("'+id+'", now(), '+value+');');
                idValidate = true;
            }
            else
                idValidate = false;
            callback(null, idValidate);
        },
        function(idValidate, callback) {
            if(idValidate) {
                var rows = connection.query('select CONVERT_TZ(lux_DT, "+0:00","+9:00") as dist_DT, dist_Value from ultrasound where user_Id ="'+id+ '" order by dist_DT desc limit 1');
                var dist_DT = rows[0].dist_DT;
                var dist_Value = rows[0].dist_Value;
            }
            callback(null, dist_DT, dist_Value);
        },
        function (dt, value, callback) {
            var result;
            var tokenizedDate = new Array();
            tokenizedDate.push(dt.substring(0,4));
            tokenizedDate.push(dt.substring(5,7));
            tokenizedDate.push(dt.substring(8,10));
            tokenizedDate.push(dt.substring(11,13));
            tokenizedDate.push(dt.substring(14,16));
            tokenizedDate.push(dt.substring(17,22));

            result = {
                "year" : tokenizedDate[0],
                "month" : tokenizedDate[1],
                "day" : tokenizedDate[2], 
                "hour" : tokenizedDate[3],
                "minute" : tokenizedDate[4],
                "second" : tokenizedDate[5],
                "value" : value
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


// 미세먼지 pm2.5 값 받기
// POST : 172.25.242.68/particulate_matter2.5
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "pm2.5_DT": "2019-11-22T13:48:58.950Z",
               "pm2.5_Value": 50
             }
*/
// particulate_matter2.5 , pm2.5_DT, pm2.5_Value
app.get('/particulate_matter2', function(req, res) {
    var value = req.query.value;
    var id = req.query.id;
    // var value = req.body.value;
    async.waterfall([
        function (callback) {
            var rows = connection.query('select * from user where user_Id ="'+id+'"');
            callback(null, rows.length);
        },
        function (rowsLength, callback) {
            var idValidate;
            if(rowsLength != 0) {
                connection.query('insert into `particulate_matter2.5`(user_Id, `pm2.5_DT`, `pm2.5_Value`) values("'+id+'", now(), '+value+');');
                idValidate = true;
            }
            else
                idValidate = false;
            callback(null, idValidate);
        },
        function(idValidate, callback) {
            if(idValidate) {
                var rows = connection.query('select CONVERT_TZ(`pm2.5_DT`, "+0:00","+9:00") as DT, `pm2.5_Value` as V from `particulate_matter2.5` where user_Id ="'+id+ '" order by `pm2.5_DT` desc limit 1');
                var p_DT = rows[0].DT;
                var p_V = rows[0].V;
            }
            callback(null, p_DT, p_V);
        },
        function (dt, value, callback) {
            var result;
            var tokenizedDate = new Array();
            tokenizedDate.push(dt.substring(0,4));
            tokenizedDate.push(dt.substring(5,7));
            tokenizedDate.push(dt.substring(8,10));
            tokenizedDate.push(dt.substring(11,13));
            tokenizedDate.push(dt.substring(14,16));
            tokenizedDate.push(dt.substring(17,22));

            result = {
                "year" : tokenizedDate[0],
                "month" : tokenizedDate[1],
                "day" : tokenizedDate[2], 
                "hour" : tokenizedDate[3],
                "minute" : tokenizedDate[4],
                "second" : tokenizedDate[5],
                "value" : value
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


// 미세먼지 pm10 값 받기
// POST : 172.25.242.68/particulate_matter10
// parameter : id (센서 사용자의 id) , value (해당 값)
/*  return : {
               "pm10_DT": "2019-11-22T13:48:58.950Z",
               "pm10_Value": 50
             }
*/
// particulate_matter10 , pm10_DT, pm10_Value
app.get('/particulate_matter10', function(req, res) {
    var value = req.query.value;
    var id = req.query.id;
    // var value = req.body.value;
    async.waterfall([
        function (callback) {
            var rows = connection.query('select * from user where user_Id ="'+id+'"');
            callback(null, rows.length);
        },
        function (rowsLength, callback) {
            var idValidate;
            if(rowsLength != 0) {
                connection.query('insert into `particulate_matter10`(user_Id, pm10_DT, pm10_Value) values("'+id+'", now(), '+value+');');
                idValidate = true;
            }
            else
                idValidate = false;
            callback(null, idValidate);
        },
        function(idValidate, callback) {
            if(idValidate) {
                var rows = connection.query('select CONVERT_TZ(pm10_DT, "+0:00","+9:00") as pm10_DT, pm10_Value from `particulate_matter10` where user_Id ="'+id+ '" order by pm10_DT desc limit 1');
                var pm10_DT = rows[0].pm10_DT;
                var pm10_Value = rows[0].pm10_Value;
            }
            callback(null, pm10_DT, pm10_Value);
        },
        function (dt, value, callback) {
            var result;
            var tokenizedDate = new Array();
            tokenizedDate.push(dt.substring(0,4));
            tokenizedDate.push(dt.substring(5,7));
            tokenizedDate.push(dt.substring(8,10));
            tokenizedDate.push(dt.substring(11,13));
            tokenizedDate.push(dt.substring(14,16));
            tokenizedDate.push(dt.substring(17,22));

            result = {
                "year" : tokenizedDate[0],
                "month" : tokenizedDate[1],
                "day" : tokenizedDate[2], 
                "hour" : tokenizedDate[3],
                "minute" : tokenizedDate[4],
                "second" : tokenizedDate[5],
                "value" : value
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


app.get('/', function(req, res ) {
    var value = "succeed";
    console.log(value);
    res.send(value);
})



app.listen(80, function () {
    console.log('Server is running');
});