 
/*
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/component/Axis1 sys/repo0/chart/component/Axis1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/component/Legend1 sys/repo0/chart/component/Legend1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/component/Bubble1 sys/repo0/chart/component/Bubble1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/component/TextBox1 sys/repo0/chart/component/TextBox1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/component/Line1 sys/repo0/chart/component/Line1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/component/Points1 sys/repo0/chart/component/Points1

cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/BubbleX1  sys/repo0/chart/BubbleX1

cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/variants/BubbleX1/BillionDollarWeatherEvents3 sys/repo0/chart/variants/BubbleX1/BillionDollarWeatherEvents1

cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/example/BarChart1 sys/repo0/example/BarChart1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/example/BarChart2 sys/repo0/example/BarChart2
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/example/BarChart3 sys/repo0/chart/Bar1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/LineChart1 sys/repo0/chart/Line1
cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/chart/Scatter sys/repo0/chart/Scatter1

cd /mnt/ebs0/prototypejungledev/node;node admin/copyItem.js sys/repo0dev/example/TwoRectangles sys/repo0/example/TwoRectangles


*/
//var pjdb = require('./db.js').pjdb;
var dyno = require('../dynamo.js');
var user = require('../user.js');
var s3 = require('../s3.js');
var util = require('../util.js');
var sys = require('sys')
var http = require('http');
var dns = require('dns');
util.activeTags.push('test');
util.activeTags.push('s3');
console.log("TEST");

var src = process.argv[2];
console.log("src",src);

var dst = process.argv[3];
console.log("dst",dst);

s3.copyItem(src,dst,function (e,d) {
    console.log("COPY DONE",e,d);
  });

 



