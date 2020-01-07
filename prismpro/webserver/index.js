const express = require('express');
var bodyParser = require('body-parser');
var https = require('https');
var exec = require('child_process').exec;
const fs = require('fs');
const app = express();
var cors = require('cors')
const port = process.env.PORT || 8080;
console.log(port);

app.use(cors())

// Load in the config file - Note that any time this file is changed
// the node server must be restarted.
var config = require('./json/config.json');
// Extract these variables for using in necessary scripts.
var PC_UI_USER = config.pc_ui_username;
var PC_UI_PASS = config.pc_ui_password;
var PC_SSH_USER = config.pc_ssh_username;
var PC_SSH_PASS = config.pc_ssh_password;
var VM_USER = config.uvm_ssh_username;
var VM_PASS = config.uvm_ssh_password;


function getPassword(body) {
  var password = body.password || PC_UI_PASS;
  return password && password.toString() || PC_UI_PASS;
}

///////////////////////
// App
///////////////////////

// console.log that your server is up and running
app.listen(port, () => console.log(`Listening on port ${port}`));

// Parse Requests as json
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.get('/', function (req, res) {
  res.sendfile('public/index.html');
});

app.get('/bootcamp', function (req, res) {
  res.sendfile('public/index.html');
});

app.get('/alerts', function (req, res) {
  res.sendfile('public/index.html');
});

app.get(/\/public\/(.*)/, function (req, res) {
  res.sendfile('.' + req.path);
});

app.get(/\/client\/build\/(.*)/, function (req, res) {
  res.sendfile('.' + req.path);
});

app.get('/log', function (req, res) {
  // Return the log.
  res.sendfile('out.log');
});

app.get('/error', function (req, res) {
  // Return the error log.
  res.sendfile('err.log');
});


app.post('/begin/', function (req, res) {
  var body = req.body;
  if (!body) {
    res.send({
      error: 'Invalid Setup Request. Please send PC IP, VM IP, VM ID'
    });
  }
  var status = 'SUCCESS';
  var password = getPassword(body);
  var url = './begin.sh ' + body.vmIp + ' ' + body.pcIp + ' ' + body.vmId + ' ' + PC_UI_USER + ' ' + password + ' ' + VM_USER + ' ' + VM_PASS + ' ' + PC_SSH_USER + ' ' + PC_SSH_PASS + ' "' + body.vmName + '"';
  console.log(url);
  exec(url, {}, function (error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log('exec error:', error);
      status = 'FAILED';
    }
    res.send({
      stdout: stdout,
      stderr: stderr,
      error: error,
      status: status
    });
  });
});

app.post('/generate_alert/:alert_uid', function (req, res) {
  var body = req.body;
  var alert_uid = req.params.alert_uid;
  if (!body) {
    res.send({
      error: 'Invalid Request. PC IP is required to generate alerts.'
    });
  }
  var status = 'SUCCESS';
  var password = getPassword(body);
  var query = './generate_alert.sh ' + body.pcIp + ' ' + PC_SSH_USER + ' ' + PC_SSH_PASS + ' ' + PC_UI_USER + ' ' + password + ' ' + alert_uid + ' ' + body.vmId + ' ' + body.vmName;
  exec(query, {}, function (error, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (error !== null) {
      console.log('exec error:', error);
      status = 'FAILED';
    }
    res.send({
      stdout: stdout,
      stderr: stderr,
      error: error,
      status: status
    });
  });
});


app.get('/gettickets', function (req, res) {
  try {
    fs.readFile('./ticket-raised.json', 'utf-8', (err, data) => {
      var arrayOfObjects = JSON.parse(data);
      res.send(arrayOfObjects)
    })
  } catch (err) {

  }  
})

app.get('/ticketsystem', function (req, res) {
  res.sendfile('public/index.html')
})

app.post('/generate_ticket/', (req, res) => {

  const creation_time = new Date();
  const key = Math.floor(Math.random() * 100000) + 1;
  const task_status = "Open";

   const  request_body = {
      creation_time,
      key,
      task_status,
      alert_name: req.body.alert_name,
      alert_id: req.body.alert_id,
      vm_name: req.body.vm_name,
      vm_id: req.body.vm_id      
    }
  try {
    fs.readFile('./ticket-raised.json', 'utf-8', (err, data) => {
      var arrayOfObjects = JSON.parse(data);

      arrayOfObjects.tickets.push(request_body)
      console.log(arrayOfObjects);

      fs.writeFile('./ticket-raised.json', JSON.stringify(arrayOfObjects), 'utf-8', function (err) {
        if (err) throw err
        res.send(request_body)        
      })
    })
  } catch (err) {

  }
})

// create a POST route
app.post('/groups/', (req, res) => {
  var body = req.body;
  if (!body) {
    res.send({
      error: 'Invalid Groups Request. Please send PC IP.'
    });
  }
  console.log('Groups request body', body)
  // take in entity type and entity name attr.
  // Prepare POST body
  var data = "{\"entity_type\":\"" + body.entityType + "\",\"query_name\":\"Groups search\",\"grouping_attribute\":\" \",\"group_count\":1,\"group_offset\":0,\"group_attributes\":[],\"group_member_count\":100,\"group_member_offset\":0,\"group_member_sort_attribute\":\"" + body.nameAttr + "\",\"group_member_sort_order\":\"ASCENDING\",\"group_member_attributes\":[{\"attribute\":\"" + body.nameAttr + "\"},{\"attribute\":\"ip_addresses\"}],\"filter_criteria\":\"" + body.filter + "\"}";
  // Prepare options for the request
  var password = getPassword(body);
  var options = {
    host: body.pcIp,
    port: 9440,
    path: '/api/nutanix/v3/groups',
    method: 'POST',
    headers : {
      'Content-Type': 'application/json;charset=UTF-8',
      'Authorization' : 'Basic ' + Buffer.from(PC_UI_USER + ':' + password).toString('base64')
    },
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  };
  var req2 = https.request(options, function (res2) {
    res2.setEncoding('utf8');
    var body = '';
    res2.on('data', function (chunk) {
      body = body + chunk;
    });
    res2.on('end',function () {
      if (res2.statusCode != 200) {
        if (body && body.indexOf('AUTHENTICATION_REQUIRED') >-1) {
          res.send({
            error: 'AUTHENTICATION_REQUIRED',
            body: body
          });
        } else {
          res.send({
            error: 'There was an error making the request.',
            body: body
          });
        }
      } else {
        res.send(body);
      }
    });
  });
  req2.on('error', function (err) {
    console.log(err);
  });
  req2.write(data);
  req2.end();
});

app.put('/updateticket/', (req, res) =>{
  
  try {
    fs.readFile('./ticket-raised.json', 'utf-8', (err, data) => {
      var arrayOfObjects = JSON.parse(data);
      var temp= null;
      console.log("req.body",req.body)
      for(tick in arrayOfObjects.tickets){
        console.log("tick",tick)
        if(arrayOfObjects.tickets[tick]['alert_id'] === req.body.alert_id){
          arrayOfObjects.tickets[tick]['task_status'] = 'Resolved'
          temp = arrayOfObjects.tickets[tick]
          console.log("temp",temp)
          break          
        }
      }
      fs.writeFile('./ticket-raised.json', JSON.stringify(arrayOfObjects), 'utf-8', function (err) {
        if (err) throw err
        res.send(temp)        
      })     
    })
  } catch (err) {

  }

})

// create a POST route
app.post('/api/nutanix/v3/action_rules/trigger/', (req, res) => {
  
  const  request_body = {
    ip: req.body.ppvmIp,
    username: 'admin',
    password: req.body.password,
    body: {
        trigger_type: "manual_trigger",
        trigger_instance_list: [
          {
            action_rule_uuid: req.body.selectedPlaybookUUID,
            source_entity_info: {
              type:"vm",
              uuid:req.body.vm_id
            }
          }
        ]
      }
  }

  res.send(request_body);
});




