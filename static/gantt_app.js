'use strict';
(() => {
  var gantt = {
    tasks: [],
    init: init,
    doselect: doselect,
    doupdate: doupdate,
    dodelete: dodelete,
    update: fakesendupdate,
    COLORS: ['brown', 'red', 'blue', 'maroon', 'darkgreen']
  };
  window.gantt = gantt;
  var x;
  var svgWidth;
  var svgHeight;
  var h = 24;

  var tempSymbol = Symbol();
  var updateSymbol = Symbol();
  function fakesendupdate() {
    console.error('defina la funcion update');
  }
  function dragstarted(d) {
    d[tempSymbol] = d3.event.x - x(d.start);
  }
  function dragged(d) {
    d3.select(this)
      .attr('transform', `translate(${d3.event.x - d[tempSymbol]}, 0)`);
  }
  function dragended(d) {
    var p = x.invert(d3.event.x - d[tempSymbol]);
    var dstart = p - d.start.valueOf();
    d3.select(`svg g#tasks g.row[id="${d.APUId}"]`)
      .each(function() {
        [...this.classList].splice(1).forEach(b => {
          d3.select(`svg g#tasks g.row[id="${b}"]`)
            .each(function(c) {
              c.start = new Date(c.start.valueOf() + dstart);
              c.end = new Date(c.end.valueOf() + dstart);
              gantt.update(c);
            })
            .select('g')
              .attr('transform', d => `translate(${x(d.start)}, 0)`);
        });
      });
    delete d[tempSymbol];

    d3.selectAll(`svg g#tasks g.row[class~="${d.APUId}"]`)
      .each(function(c) {
        if (c.expand) {
          c[updateSymbol] = {
            start: c.start ? new Date(c.start) : c.start,
            end: c.end ? new Date(c.end) : c.end
          };
          [c.start, c.end] = [null, null];
        }
      })
      .each(function(c) {
        if (c.expand) {
          [...this.classList].splice(1).forEach(b => {
            d3.select(`svg g#tasks g.row[id="${b}"]`)
              .each(a => {
                if (a.APUId === c.APUId) {
                  return;
                }
                if (c.start && a.start) {
                  c.start = c.start > a.start ? new Date(a.start) : c.start;
                } else {
                  if (a.start) {
                    c.start = new Date(a.start);
                  }
                }
                if (c.end && a.start) {
                  c.end = c.end < a.end ? new Date(a.end) : c.end;
                } else {
                  if (a.end) {
                    c.end = new Date(a.end);
                  }
                }
              });
          });
        }
      })
      .each(function(c) {
        if (c.expand) {
          if (c[updateSymbol].start.valueOf() != c.start.valueOf() ||
              c[updateSymbol].end.valueOf() != c.end.valueOf()) {
            gantt.update(c);
          }
          d3.select(this)
            .select('g')
              .attr('transform', `translate(${x(c.start)}, 0)`)
              .select('rect.bar')
                .attr('width', x(c.end) - x(c.start));
        }
      });
  }
function init(edges) {
  svgWidth = document.querySelector('svg').getAttribute('width');
  svgHeight = document.querySelector('svg').getAttribute('height');
  // set the ranges
  x = d3.scaleTime().range([0, svgWidth]);
  x.domain([edges.start, edges.end]);

  d3.select('svg g#xaxis')
    .call(d3.axisBottom(x))
    .selectAll('svg g#xaxis .tick line')
      .attr('y2', svgHeight)
      .attr('opacity', 0.2);

  gantt.x = x;
}
function dodelete(row) {
  var i = gantt.tasks.findIndex(r => r.id == row.id);
  gantt.tasks.splice(i, 1);
  d3.select(`svg g#tasks g.row[id="${row.APUId}"]`).remove();
  d3.select('svg g#tasks')
    .selectAll('g.row').data(gantt.tasks)
      .attr('transform', (d, i) => `translate(0, ${i * (h + 0)})`)
    .select('g rect.background')
      .attr('fill', (d, i) => i % 2 ? 'green' : 'red');

}
function doupdate(row) {
  var p = gantt.tasks.find(r => r.id == row.id);
  p.start = row.start;
  p.end = row.end;

  d3.select(`svg g#tasks g.row[id="${row.APUId}"] g`)
    .each(d => {
      Object.keys(d).forEach(k => {
        d[k] = row[k];
      });
    })
    .attr('transform', (d, i) =>
      d.expand ?
        'translate(0,0)' :
        `translate(${x(d.start)}, 0)`
    )
    .select('rect')
      .attr('width', calculateWidth)
}
function doselect(row) {
  gantt.tasks.push(row);
  var tasks = gantt.tasks;
  var COLORS = gantt.COLORS;
  var tooltip = d3.select("body div.tooltip");
  var xaxisHeight = 22;

  var tasksHeight = svgHeight - xaxisHeight;

  var padh = 4;
  var a = d3.select('svg g#tasks')
    .attr('transform', `translate(0, ${xaxisHeight})`)
    .selectAll('g.row').data(tasks);

  var g1 = a.enter().append('g')
    .attr('transform', (d, i) => `translate(0, ${i * (h + 0)})`)
    .attr('id', d => d.APUId)
    .attr('class', calculateClass);

  g1.append('rect')
    .attr('class', 'background')
    .attr('fill', (d, i) => i % 2 ? 'green' : 'red')
    .attr('opacity', 0.3)
    .attr('width', svgWidth)
    .attr('height', h);

  var g = g1.append('g')
    .attr('transform', (d, i) =>
      d.expand ?
        'translate(0,0)' :
        `translate(${x(d.start)}, 0)`
    )
    .on("mouseover", function(d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${d.APUId}<br>${d.description}`)
        .style("left", (d3.event.pageX) + "px")
        .style("top", (d3.event.pageY - 30) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    })
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended));

  g.append('rect')
    .attr('class', 'bar')
    .attr('y', padh / 2)
    .attr('height', h - padh)
    .attr('width', calculateWidth)
    .attr('fill', d => {
      var p = d.APUId.match(/[.]/g);
      if (d.expand) {
        if (p) {
          return COLORS[p.length];
        }
        return COLORS[0];
      } else {
        return COLORS[COLORS.length - 1];
      }
    });
  g.append('text')
    .attr('fill', 'white')
    .attr('y', h - padh)
    .text(d => d.APUId);
}

function calculateClass(d) {
  d.APUId.match(/\d+[.]{0,1}/g).reduce((acc, c, i, arr) => {
    if (arr.length == i + 1) {
      return acc;
    }
    acc += c;
    d3.select(`svg g#tasks g[id="${acc.slice(0, -1)}"]`)
      .classed(d.APUId, true);
    return acc;
  }, '');
  return `row ${d.APUId}`;
}
function calculateWidth(d) {
  if (d.expand) {
    return 0
  }
  d.APUId.match(/\d+[.]{0,1}/g).reduce((acc, c, i, arr) => {
    if (arr.length == i + 1) {
      return acc;
    }
    acc += c;
    d3.select(`svg g#tasks g[id="${acc.slice(0, -1)}"] rect.bar`)
      .attr('width', c => {
        if (c.start) {
          c.start = c.start > d.start ? new Date(d.start) : c.start;
        } else {
          if (d.start) {
            c.start = new Date(d.start);
          }
        }
        if (c.end) {
          c.end = c.end < d.end ? new Date(d.end) : c.end;
        } else {
          if (d.end) {
            c.end = new Date(d.end);
          }
        }
        return x(c.end) - x(c.start);
      });
    d3.select(`svg g#tasks g[id="${acc.slice(0, -1)}"] g`)
      .attr('transform', c =>
        `translate(${x(c.start)}, 0)`
      );
    return acc;
  }, '');
  return x(d.end) - x(d.start);
}
})();
