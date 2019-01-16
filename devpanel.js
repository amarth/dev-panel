const log = (message) => {
    chrome.devtools.inspectedWindow.eval(
        `console.log('${message}')`,
        function(result, isException) {}
      );
}

let reactObj = null;
const onButtonClick = () => {
    initTree();
};

const coolButton = document.getElementById('coolButton');
coolButton.addEventListener('click', onButtonClick);

let loaded = {};

function getNodeText(node) {
    const nodeId = node.id;
    if(node.id === '#') {
        return reactObj 
            ? [{text: 'r', id: '$r', children: true}]
            : [{text: 'react object is not available', id: 'root', children: false}]
    } else {
        if(loaded[node.id] === true) return;
        if(loaded[node.id]) return loaded[node.id];
        loaded[node.id] = true;
        log(`Requesting ${node.id}`);
        chrome.devtools.inspectedWindow.eval(
            `Object.keys(${node.id})`,
            function(result, isException) {
                if (isException) log(isException.description);
                loaded[node.id] = [];
                if(result) {
                    for(let key of result) {
                        log('add node ' + key);
                        loaded[node.id].push({text: key, id: `${node.id}.${key}`, children: true});
                    }
                }
                $('#buttonDiv').jstree(true).refresh();
            }
        )
    }
}

function initTree() {
    $('#buttonDiv').jstree({ 'core' : {
        data: function (node, cb) {
            cb(getNodeText(node));
        }
    } });

    loaded = {};

    chrome.devtools.inspectedWindow.eval(
        'Object.keys($r)',
        function(result, isException) {
            if (isException) log(isException.description);
            reactObj = result;
            $('#buttonDiv').jstree(true).refresh();
        }
    )
}

$( document ).ready(initTree);