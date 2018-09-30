const D3Node = require('d3-node');
const path = require('path');
const d3Module = require('d3'); // v3.5.17
const process = require('./src/js/process.js');
const output = require('d3node-output');
const express = require('express');
const yaml = require('js-yaml')
const app = express();
const bodyParser = require('body-parser')

//https://github.com/LintangWisesa/OpeNode_Deploy_Example

const defaultStyle = `
.border{
  stroke-width:.3px;
  fill:none;
  stroke:#333;
}
svg {font: 10px sans-serif;}
.caption{font-weight: bold;}
.key path {display: none;}
.key line{
  stroke:#000;
  shape-rendering:crispEdges;
}
`;
var drawingDefaults = {
  fill: "orange",
  aspectRatio: "1:1",
  rows: 10,
  columns: 10,
  groupPadding: .33,
  gridLines: true,
  gridPaddingInner: .4, // the space between icons (%)
  iconTextRatio: .33,
  margins: {
    top: 20,
    right: 20,
    bottom: 100,
    left: 20
  }
}
// set the title defaults
var titleDefaults = {
  text: "Decent looking diagrams for engineers",
  subText: "More information can be found at http://github.com/cidrblock/dld4e",
  author: "Bradley A. Thornton",
  company: "Self",
  date: new Date().toLocaleDateString(),
  version: 1.01,
  color: "orange",
  stroke: "orange",
  fill: "orange",
  heightPercentage: 6, // percent of total height
  logoUrl: "resources/img/radial.png",
  logoFill: "orange"
}

app.use(bodyParser.text({ type: 'application/text' }))

app.use(express.static('./'))

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname + '/index.html'));
});


app.post('/draw',(req, res) => {
  var d3n = new D3Node({
    d3Module,
    defaultStyle
  });

  console.log(req.body)
  
  var d3 = d3n.d3;
  d3.selection.prototype.moveToFront = function () {
    return this.each(function () {
      this.parentNode.appendChild(this);
    });
  };
  d3.selection.prototype.moveToBack = function () {
    return this.each(function () {
      var firstChild = this.parentNode.firstChild;
      if (firstChild) {
        this.parentNode.insertBefore(this, firstChild);
      }
    });
  };
  
  var doc = yaml.safeLoad(req.body);
  // incase there are none
  var connections = doc.connections || [];
  var groups = doc.groups || [];
  var notes = doc.notes || [];
  var icons = doc.icons || [];

  // merge the doc properties into the defaults
  var diagram = Object.assign(drawingDefaults, doc.diagram || {})
  var title = Object.assign(titleDefaults, doc.title || {})


  // find a good fit for the diagram
  var parentBox = {
    height: 1024,
    width: 1024
  }
  var ratios = diagram.aspectRatio.split(':')

  // set the desired h/w
  var availbleHeight = parentBox.height - diagram.margins.top - diagram.margins.bottom
  var availbleWidth = parentBox.width - diagram.margins.left - diagram.margins.right

  if (availbleHeight < availbleWidth) {
    svgHeight = availbleHeight
    svgWidth = svgHeight / ratios[1] * ratios[0]
  } else if (availbleWidth < availbleHeight) {
    svgWidth = availbleWidth
    svgHeight = svgWidth / ratios[0] * ratios[1]
  } else {
    svgWidth = availbleWidth
    svgHeight = availbleHeight
  }
  // downsize if outside the bounds
  if (svgHeight > availbleHeight) {
    svgHeight = availbleHeight
    svgWidth = svgHeight / ratios[1] * ratios[0]
  }
  if (svgWidth > availbleWidth) {
    svgWidth = availbleWidth
    svgHeight = svgWidth / ratios[0] * ratios[1]
  }


  const svg = d3n.createSVG(svgWidth, svgHeight);

  // using the svg dimentions, set the title and digrams
  title.height = svgHeight * title.heightPercentage / 100
  diagram.height = svgHeight - title.height
  diagram.width = diagram.height / ratios[1] * ratios[0]
  diagram.x = (svgWidth - diagram.width) / 2
  diagram.y = (svgHeight - title.height - diagram.height)

  // create our bands
  diagram.xBand = d3.scaleBand()
    .domain(Array.from(Array(diagram.columns).keys()))
    .rangeRound([diagram.x, diagram.width + diagram.x])
    .paddingInner(diagram.gridPaddingInner);

  diagram.yBand = d3.scaleBand()
    .domain(Array.from(Array(diagram.rows).keys()).reverse())
    .rangeRound([diagram.y, diagram.height + diagram.y])
    .paddingInner(diagram.gridPaddingInner);

  notes = process.entities(svg, diagram, notes)
  icons = process.entities(svg, diagram, icons)
  connections = process.connections(connections, groups, icons)
  groups = process.groups(groups, diagram, icons, d3)

  // draw all the things
  require('./src/js/title.js')(svg, diagram, title)
  require('./src/js/gridlines.js')(svg, diagram, d3)
  require('./src/js/groups.js')(svg, diagram, groups, icons, process.textPositions)
  require('./src/js/connections.js')(svg, diagram, connections, icons, notes, d3)
  require('./src/js/icons.js')(svg, diagram, icons, diagram.iconTextRatio, d3, d3n, process.textPositions)
  require('./src/js/notes.js')(svg, diagram, notes, d3)

  res.set('Content-Type', 'application/svg+xml');
  console.log(d3n.svgString())
  res.send( d3n.svgString())//.html() );

});

app.listen(3000);



//output('./output', d3n);