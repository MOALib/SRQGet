# SRQGet

Very simple fetcher class.

```js
// Documentation
const SRQGet = require("srqget");
const client = SRQGet.SRQGetNetworkClient();

// promise based
// Api: client.getPromise(url, options, fileopts);
// fileopts properties:
// * path/file
// * encoding
// * flags
// * mode
(async function(){
	var result = await client.getPromise("https://google.com", {}, {});
    console.log(result);
})();

// callback based
// Api: client.getCallback(url, options, fileopts, callback, dis);
// Note: dis is not needed usually, it is for internal use only
client.getCallback("https://google.com", {}, {}, function(err, res){
	console.log(res);
});

// synchronous operation
// Api: client.get(url, options, fileopts);
var r = client.get("https://google.com", {}, {});
console.log(r);

```