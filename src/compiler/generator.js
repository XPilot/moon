var generate = function(ast) {
  var TEMPLATE_RE = /{{([A-Za-z0-9_.()\[\]]+)}}/gi;
  var code = JSON.stringify(ast);
  code.replace(TEMPLATE_RE, function(match, key) {
    code = code.replace(match, "' + data['" + key + "'] + '");
  });
  var render = new Function("data", "var out = '" + code + "'; return out");
  return render;
}
