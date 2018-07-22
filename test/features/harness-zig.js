'use restrict';
var tape = require('tape');
var _test = require('tape-promise');
var test = _test(tape);
var zig = require('../../src/zigledger/zig.js');
var path = require("path")
var configPath = path.join(__dirname, '../../benchmark/simple/zigledger.json');
var blockchain = new zig(configPath);
var open = require("../../benchmark/simple/open.js");
var query = require("../../benchmark/simple/query.js");
var caUtils = require("../utils/ca-helper.js");
test('\n\n*** 初始化ZigLedger网络 ***\n\n', (t) => {
    global.tapeObj = t;
    try {
        blockchain.init();
        testSuite();
    }catch(error){
        t.error(error);
    }
    
    t.end()
});

function testSuite(){
    test('\n\n*** #64 数据存储隔离性 ***\n\n', (t) => {
        let openContext = blockchain.getContext("open");
        open.init(blockchain,openContext)
        open.run();
        blockchain.releaseContext(openContext);
        let queryContext = blockchain.getContext("query");
        query.init(blockchain,openContext)
        query.run();
        blockchain.releaseContext(queryContext);
        let queryContextDifferentChannel = blockchain.getContext("query");
        queryContextDifferentChannel.channel = "yourchannel";
        query.init(blockchain,queryContextDifferentChannel)
        query.run();
        blockchain.releaseContext(queryContextDifferentChannel);
        t.end()
    });
}

test('\n\n*** 使用证书授权来维护数据安全 ***\n\n',(t) => {
    caUtils.init();
    caUtils.verifyUser("admin","adminpw","org1");
    t.pass("the negative case");
    caUtils.verifyUser("admin","admin","org2");
});