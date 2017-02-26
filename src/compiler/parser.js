var parse = function(tokens) {
  var root = {
    type: "ROOT",
    children: []
  }

  var state = {
    current: 0,
    tokens: tokens
  }

  while(state.current < tokens.length) {
    var child = walk(state);
    if(child) {
      root.children.push(child);
    }
  }

  return root;
}

var HTML_ELEMENTS = {"html":true,"body":true,"head":true,"style":true,"title":true,"address":true,"article":true,"aside":true,"footer":true,"header":true,"h1":true,"h2":true,"h3":true,"h4":true,"h5":true,"h6":true,"hgroup":true,"nav":true,"section":true,"div":true,"dd":true,"dl":true,"dt":true,"figcaption":true,"figure":true,"li":true,"main":true,"ol":true,"p":true,"pre":true,"ul":true,"a":true,"b":true,"abbr":true,"bdi":true,"bdo":true,"cite":true,"code":true,"data":true,"dfn":true,"em":true,"i":true,"kbd":true,"mark":true,"q":true,"rp":true,"rt":true,"rtc":true,"ruby":true,"s":true,"samp":true,"small":true,"span":true,"strong":true,"sub":true,"sup":true,"time":true,"u":true,"var":true,"audio":true,"map":true,"video":true,"object":true,"canvas":true,"script":true,"noscript":true,"del":true,"ins":true,"caption":true,"colgroup":true,"table":true,"thead":true,"tbody":true,"td":true,"th":true,"tr":true,"button":true,"datalist":true,"fieldset":true,"form":true,"label":true,"legend":true,"meter":true,"optgroup":true,"option":true,"output":true,"progress":true,"select":true,"textarea":true,"details":true,"dialog":true,"menu":true,"menuitem":true,"summary":true,"content":true,"element":true,"shadow":true,"template":true};

var createParseNode = function(type, props, children) {
  return {
    type: type,
    props: props,
    children: children
  }
}

var walk = function(state) {
  var token = state.tokens[state.current];
  var previousToken = state.tokens[state.current - 1];
  var secondToken = state.tokens[state.current + 1];
  var thirdToken = state.tokens[state.current + 2];
  var fourthToken = state.tokens[state.current + 3];

  var increment = function(num) {
    state.current += num === undefined ? 1 : num;
    token = state.tokens[state.current];
    previousToken = state.tokens[state.current - 1];
    secondToken = state.tokens[state.current + 1];
    thirdToken = state.tokens[state.current + 2];
  }

  if(token.type === "text") {
    increment();
    return previousToken.value;
  }

  if(token.type === "comment") {
    increment();
    return;
  }

  // Start of new Tag
  if(token.type === "tagStart" && !token.close && !fourthToken.close) {
    var node = createParseNode(secondToken.value, thirdToken.value, []);
    var tagType = secondToken.value;
    // Exit Start Tag
    increment(4);
    var startContentIndex = state.current;
    // Make sure it has content and is closed
    if(token) {
      // Find Closing Tag, and push children recursively
      while((token.type !== "tagStart") || (token.type === "tagStart" && !(token.close))) {
        // Push a parsed child to the current node
        var parsedChildState = walk(state);
        var lastKnown;
        if(parsedChildState) {
          lastKnown = {
            node: parsedChildState,
            index: node.children.length
          }
          node.children.push(parsedChildState);
        }
        increment(0);
        if(!token) {
          // No token means that there is nothing left to parse in this element
          // This usually means that the tag was unclosed
          if (lastKnown && !HTML_ELEMENTS[lastKnown.node.type]) {
            // The last known node is not a known closing element
            // This means that it is a self closing element, so
            // close it, and add collected children after
            var left = lastKnown.node.children;
            node.children[lastKnown.index].children = [];
            node.children = node.children.concat(left);
          }
          // It is supposed to be closed,
          // but was left unclosed, so attempt to fix by
          // pushing all known children into the element
          break;
        }
      }
      increment();
    }

    return node;
  }

  increment();
  return;
}