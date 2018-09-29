const fs = require('fs'),
  xml2js = require('xml2js');
const parser = new xml2js.Parser();
const builder = new xml2js.Builder({
  headless: true
});

module.exports = function (svg, diagram, icons, iconTextRatio, d3, d3n, textPositions) {
  var handleMouseOver=(d, i) => {
    if ((d.value.metadata) && (d.value.metadata.url)) {
      var url = d.value.metadata.url
      var replacements = url.match(/{{\s*[\w\.]+\s*}}/g)
      if (replacements) {
        replacements.forEach(function(replacement){
          var inner = replacement.match(/[\w\.]+/)[0]
          if (inner == 'key') {
            url = url.replace(replacement, d.key)
          } else {
            url = url.replace(replacement, d.value[inner])
          }
        })
      }
      d3.json(url, function (error, json) {
        if (error) {
          var metadata = Object.assign({}, d.value.metadata);
          delete metadata.url
          if (d.value.metadata.errorText) {
            metadata.note = d.value.metadata.errorText
            delete metadata.errorText
          } else {
            metadata.status = "HTTP:" + error.target.status
            metadata.statusText = error.target.statusText
          }
          mouseOver(d,i,metadata)
          return
        } else {
          var metadata = Object.assign({},json, d.value.metadata);
          delete metadata.url
          delete metadata.errorText
          mouseOver(d,i,metadata)
          return
        }
      });
    } else if (d.value.metadata) {
      mouseOver(d,i,d.value.metadata)
    }
  }
  
  var mouseOver=(d,i,json) => {
    var metadata = json
    if (metadata) {
      var length = Object.keys(metadata).length
      var jc = "flex-start"
      var meta = svg
        .append("foreignObject")
        .attr("id", "t" + d.value.x + "-" + d.value.y + "-" + i)
        .attr("class", "mouseOver")
        .attr("x", function() {
          if ((d.value.x2 + d.value.width * 2) < diagram.width) {
            return d.value.x2
          } else {
            jc = "flex-end"
            return d.value.x1 - (d.value.width * 3)
          }
          return d.value.x2; })
        .attr("y", function() { return d.value.centerY - (length * d.value.fontSize) })
        .append("xhtml:div")
        .attr("class", "metadata")
        .style("width", function() { return d.value.width * 3 + "px" })
        .style("height", function() { return length * d.value.fontSize })
        .style("justify-content", jc)
        .style("font-size", function() { return d.value.fontSize + "px"; })
        .html(function() {
          var text = "<table>"
          for (key in metadata) {
            text += ("<tr><td>" + key + ":&nbsp</td><td>" + metadata[key] + "</td></tr>")
          }
          text += "</table>"
          return text;
        })
    }
  }
  var handleMouseOut =(d, i)=> {
    svg.selectAll(".mouseOver")
      .remove()
  }


  let document = d3n.document
  var deviceCellsAll = svg.selectAll("cells")
    .data(d3.entries(icons))
    .enter()

  var cells = deviceCellsAll.append("g")
    .attr("id", function (d) {
      return d.key
    })
    .attr("transform", function (d) {
      return "translate(" + diagram.xBand(d.value.x) + "," + diagram.yBand(d.value.y) + ")"
    })
    .on("mouseenter", handleMouseOver)
    .on("mouseleave", handleMouseOut)
    .each( function (d) {
      if (d.value.metadata) {
        var text = d3.select(this)
        text.style("cursor", "pointer")
      }
    })

  // cellFill
  cells
    .append("rect")
    .attr("rx", function (d) {
      return d.value.rx
    })
    .attr("ry", function (d) {
      return d.value.ry
    })
    .attr("width", function (d) {
      return d.value.width
    })
    .attr("height", function (d) {
      return d.value.height
    })
    .attr("fill", function (d) {
      return d.value.fill || "orange"
    })
    .style("stroke", function (d) {
      return d.value.stroke || "orange"
    })
    .style("stroke-dasharray", function (d) {
      return d.value.strokeDashArray || [0, 0]
    })


  //cellText 
  cells
    .append("text")
    .attr('class', 'iconLabel')
    .text(function (d) {
      return d.value.text || d.key
    })
    .each(function (d) {
      //TODO this.getComputedTextLength()
      d.value.fontSize = Math.floor(Math.min(d.value.width * .9 / 1 * 12, d.value.height / 2 * iconTextRatio))
      d.value.textPosition = textPositions(0, 0, d.value.width, d.value.height, d.value.fontSize + 2)[d.value.textLocation]
      if (d.value.url) {
        var text = d3.select(this)
        text.on("click", function () {
          window.open(d.value.url);
        })
        text.style("cursor", "pointer")
        text.style("text-decoration", "underline")
      }
    })
    .style("font-size", function (d) {
      return d.value.fontSize + "px";
    })
    .attr("id", function (d) {
      return d.key + '-text'
    })
    .attr("transform", function (d) {
      return "translate(" + d.value.textPosition.x + "," + d.value.textPosition.y + ")rotate(" + d.value.textPosition.rotate + ")"
    })
    .attr('fill', function (d) {
      return d.value.color || "orange"
    })
    .attr("text-anchor", function (d) {
      return d.value.textPosition.textAnchor
    })
    .attr("dominant-baseline", "central")

  //icon 
  cells
    .each(function (d) {
      var cell = document.getElementById(d.key)
      var cellText = document.getElementById(d.key + "-text")
      var fontSize = Math.ceil(parseFloat(12))
      // center
      var x = (d.value.width * d.value.iconPaddingX)
      var y = (d.value.height * d.value.iconPaddingY)
      var width = d.value.width * (1 - 2 * d.value.iconPaddingX)
      var height = (d.value.height) * (1 - 2 * d.value.iconPaddingY)
      switch (true) {
        case d.value.textLocation.startsWith('top'):
          y += fontSize
          height = (d.value.height - fontSize) * (1 - 2 * d.value.iconPaddingY)
          break;
        case d.value.textLocation.startsWith('left'):
          x += fontSize
          width = (d.value.width - fontSize) * (1 - 2 * d.value.iconPaddingX)
          break;
        case d.value.textLocation.startsWith('right'):
          width = (d.value.width - fontSize) * (1 - 2 * d.value.iconPaddingX)
          break;
        case d.value.textLocation.startsWith('bottom'):
          height = (d.value.height - fontSize) * (1 - 2 * d.value.iconPaddingY)
          break;
      }
      parser.parseString(fs.readFileSync("./resources/img/" + d.value.iconFamily + "/" + d.value.icon + ".svg"), function (err, xml) {
        if (err) {
          throw new Error('SVG file not found or invalid');
        }

        let svg = xml.svg['$']
        svg.height = height;
        svg.width = width
        svg.x = x
        svg.y = y
        let paths
        if (xml.svg.path) {
          paths = xml.svg.path
        } else {
          paths = xml.svg.g[0].path
        }

        if (paths) {
          for (i = 0; i < paths.length; i++) {
            let p = paths[i]['$']
            if (d.value.preserveWhite && d.value.replaceWhite  && p.fill == '#fff') {
              p.fill = d.value.replaceWhite
            } else if (d.value.iconFill && (p.fill != 'none')) {
              p.fill = d.value.iconFill
            }else{
              p.fill='#fff'
            }
            if ((d.value.iconStroke) && (p.stroke != 'none')) {
              p.stroke = d.value.iconStroke
            }
            if ((d.value.iconStrokeWidth) && (p["stroke-width"])) {
              p['stroke-width'] = d.value.iconStrokeWidth
            }
          }

          let domp = builder.buildObject(xml);
          let tmp = document.createElement('div');
          tmp.innerHTML = domp;
          cell.insertBefore(tmp.firstChild, cellText);
        }
      });
    })
}