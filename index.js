'use strict';

if (typeof(exports) !== "undefined") {
  exports.handler = (event, context, callback) => {
    return handler(event);
  }
}

function handler(event) {
    var request = null;
    if (typeof(event.Records) !== "undefined") {
      request = event.Records[0].cf.request;
    } else {
      request = event.request;
    }
    var headerKeys = Object.keys(request.headers);
    var uri = request.uri;

    var failureResponse = {
      statusCode: 403,
      statusDescription: "Forbidden"
    };

    var jndiRegex = /(\$|\%24)\s*(\{|\%7b)\s*jndi\s*(\:|\%3a)/im;
    var jndiPossibleBase64 = /(?:am5kaQ|puZGkg|qbmRp|Sk5ESQ|pOREk|KTkRJ)/;

    // CloudFront Functions and Lambda@Edge:
    if (uri.match(jndiRegex)) {
      return failureResponse;
    }

    for (var i = 0; i < headerKeys.length; i++) {
      var key = headerKeys[i];
      var value = request.headers[key].value;

      if (key.match(jndiRegex) || value.match(jndiRegex)) {
        return failureResponse;
      }

      try {
        if (key.match(jndiPossibleBase64)) {
          var possB64Key = String.bytesFrom(key, 'base64').toString();
          if (possB64Key.match(jndiRegex)) {
            return failureResponse;
          }
        }
        if (value.match(jndiPossibleBase64)) {
          var possB64Value = String.bytesFrom(value, 'base64').toString();
          if (possB64Value.match(jndiRegex)) {
            return failureResponse;
          }
        }
      } catch (e) {
        console.log(`Failed to get base64 from values: ${e}`)
      }
    }

    // CloudFront Functions cannot access the body, only Lambda@Edge
    // for Lambda@Edge you must choose IncludeBody=true (false by default)
    if (typeof(request.body) != "undefined") {
      try {
        var encoding = request.body.encoding;
        var body = "";
        if (encoding == "text") {
          body = request.body.data;
        }
        if (encoding == "base64") {
          try {
            body = String.bytesFrom(request.body.data, 'base64').toString();
          } catch (e) {
            console.log(`body extract - failed to run String.bytesFrom: ${e}`)
          }
          try {
            body = Buffer.from(request.body.data, 'base64').toString();
          } catch (e) {
            console.log(`body extract - failed to run Buffer.from: ${e}`)
          }
        }
        if (body.match(jndiRegex)) {
          return failureResponse;
        }
      } catch (e) {
        console.log(`Failed to match the body for the request: ${e}`)
      }
    }

    return request;
}
