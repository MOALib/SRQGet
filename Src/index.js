const https = require("node:https"), http = require("node:http"), fs = require("node:fs"),
deasync = require("deasync-promise");

const SRQGet = {};


SRQGet.info = {
    __VERSION:  "0.0.1",
    __AUTHOR:   "MXPSQL",
    __DESCRIPTION: "A simple HTTP GET request for Node.JS",
};

Object.freeze(SRQGet.info);

SRQGet.SRQGetNetworkClient = class {
    getPromise = function(url, options, fileopts){
        var URI = new URL(url);
        var protocol = URI.protocol;

        var lib = (protocol == "https:") ? https : http;

        var opts = options || {
            method: "GET",
        };

        var postData = null;

        if(opts.method == "POST"){
            if(opts.postData){
                postData = opts.postData;
            }
            else{
                postData = {};
            }
        }

        var params = {
            hostname: URI.hostname,
            port: URI.port || (protocol == "https:" ? 443 : 80),
            path: URI.pathname + URI.search,
            method: opts.method,
        };

        var promise = new Promise(function(resolve, reject){
            var request;
            var data = [];
            var result = {
                req: request,
                res: null,
                data: null,
                content: null,
                err: null,
                statusCode: null,
                url: {
                    path: URI.href,
                    obj: URI
                }
            };
            request = lib.request(params, function(response){
                response.on("data", function(chunk){
                    data.push(chunk);
                });
                response.on("end", function(){
                    result.req = request;
                    result.res = response;
                    result.data = Buffer.concat(data);
                    result.content = result.data.toString();
                    result.statusCode = response.statusCode;

                    if(fileopts){
                        var fopts = {
                            encoding: fileopts.encoding || "utf8",
                            mode: fileopts.mode || 0o666,
                            flag: fileopts.flag || "w"
                        };


                        var fpath = fileopts.path || fileopts.file || null;

                        if(fpath){
                            fs.writeFileSync(fpath, result.data, fopts.encoding, fopts.mode, fopts.flag);
                        }
                    }

                    resolve(result);
                });
            });

            request.on("error", function(err){
                result.err = err;
                reject(result);
            });

            if(postData){
                request.write(postData);
            }

            request.end();
        });

        return promise;
    };


    getCallback = function(url, options, fileopts, callback, dis){
        var thisThis = dis || this;

        thisThis.getPromise(url, options, fileopts).then(function(result){
            callback(null, result);
        }).catch(function(err){
            callback(err, null);
        });
    };

    get = function(url, options, fileopts){
        var dis = this;
        const promisfyCallback = function(url, opts, fileopts){
            return new Promise(function(resolve, reject){
                dis.getCallback(url, opts, fileopts, function(err, result){
                    if(err){
                        reject(err);
                    }
                    else{
                        resolve(result);
                    }
                }, dis);
            });
        };

        var res = null;
        try{
            res = deasync(promisfyCallback(url, options, fileopts));
        }
        catch(e){
            res = e;
        }

        return res;
    };
};





module.exports = SRQGet;




if(require.main == module){
    const client = new SRQGet.SRQGetNetworkClient();
    var uel = "https://cdn.shopify.com/s/files/1/1782/1123/products/the-sil-emilia-wickstead-alice-midi-dress-clothing-cobalt-blue-586_2048x2048.jpg?v=1624825578";

    var args = process.argv.slice(2);

    if(args.length == 0){
        console.log("Usage: node index.js <url> [options]");
        process.exit(1);
    }

    uel = args[0];

    var req = client.get(uel, {}, {
        file: "./test.jpg"
    });
    console.log(req);
}