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
    d[tempSymbol] = d3.event.x - (d.Tasks_start ? x(d.Tasks_start) : 0);
  }
  function dragged(d) {
    d3.select(this)
      .attr('transform', `translate(${d3.event.x - d[tempSymbol]}, 0)`);
  }
  function dragended(d) {
    var p = x.invert(d3.event.x - d[tempSymbol]);
    var dstart = p - d.Tasks_start.valueOf();
    d3.select(`svg g#tasks g.row[id="${d.APU_id}"]`)
      .each(function() {
        [...this.classList].splice(1).forEach(b => {
          d3.select(`svg g#tasks g.row[id="${b}"]`)
            .each(function(c) {
              if (c.Tasks_start && c.Tasks_end) {
                c.Tasks_start = new Date(c.Tasks_start.valueOf() + dstart);
                c.Tasks_end = new Date(c.Tasks_end.valueOf() + dstart);
                gantt.update(c);
              }
            })
            .select('g')
              .attr('transform', d => `translate(${x(d.Tasks_start)}, 0)`);
        });
      });
    delete d[tempSymbol];

    d3.selectAll(`svg g#tasks g.row[class~="${d.APU_id}"]`)
      .each(function(c) {
        if (c.APU_expand) {
          c[updateSymbol] = {
            Tasks_start: c.Tasks_start ? new Date(c.Tasks_start) : c.Tasks_start,
            Tasks_end: c.Tasks_end ? new Date(c.Tasks_end) : c.Tasks_end
          };
          [c.Tasks_start, c.Tasks_end] = [null, null];
        }
      })
      .each(function(c) {
        if (c.APU_expand) {
          [...this.classList].splice(1).forEach(b => {
            d3.select(`svg g#tasks g.row[id="${b}"]`)
              .each(a => {
                if (a.APU_id === c.APU_id) {
                  return;
                }
                if (c.Tasks_start && a.Tasks_start) {
                  c.Tasks_start = c.Tasks_start > a.Tasks_start ? new Date(a.Tasks_start) : c.Tasks_start;
                } else {
                  if (a.Tasks_start) {
                    c.Tasks_start = new Date(a.Tasks_start);
                  }
                }
                if (c.Tasks_end && a.Tasks_start) {
                  c.Tasks_end = c.Tasks_end < a.Tasks_end ? new Date(a.Tasks_end) : c.Tasks_end;
                } else {
                  if (a.Tasks_end) {
                    c.Tasks_end = new Date(a.Tasks_end);
                  }
                }
              });
          });
        }
      })
      .each(function(c) {
        if (c.APU_expand) {
          if (c[updateSymbol].Tasks_start.valueOf() != c.Tasks_start.valueOf() ||
              c[updateSymbol].Tasks_end.valueOf() != c.Tasks_end.valueOf()) {
            gantt.update(c);
          }
          d3.select(this)
            .select('g')
              .attr('transform', `translate(${c.Tasks_start ? x(c.Tasks_start) : 0}, 0)`)
              .select('rect.bar')
                .attr('width', x(c.Tasks_end) - x(c.Tasks_start));
        }
      });
  }
function init(edges) {
  svgWidth = document.querySelector('svg').getAttribute('width');
  svgHeight = document.querySelector('svg').getAttribute('height');
  // set the ranges
  x = d3.scaleTime().range([0, svgWidth]);
  x.domain([edges.Tasks_start, edges.Tasks_end]);

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
  d3.select(`svg g#tasks g.row[id="${row.APU_id}"]`).remove();
  d3.select('svg g#tasks')
    .selectAll('g.row').data(gantt.tasks)
      .attr('transform', (d, i) => `translate(0, ${i * (h + 0)})`)
    .select('g rect.background')
      .attr('fill', (d, i) => i % 2 ? 'green' : 'red');

}
function doupdate(row) {
  var p = gantt.tasks.find(r => r.id == row.id);
  p.Tasks_start = row.Tasks_start;
  p.Tasks_end = row.Tasks_end;

  d3.select(`svg g#tasks g.row[id="${row.APU_id}"] g`)
    .each(d => {
      Object.keys(d).forEach(k => {
        d[k] = row[k];
      });
    })
    .attr('transform', (d, i) =>
      d.APU_expand ?
        'translate(0,0)' :
        `translate(${d.Tasks_start ? x(d.Tasks_start) : 0}, 0)`
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
    .attr('id', d => d.APU_id)
    .attr('class', calculateClass);

  g1.append('rect')
    .attr('class', 'background')
    .attr('fill', (d, i) => i % 2 ? 'green' : 'red')
    .attr('opacity', 0.3)
    .attr('width', svgWidth)
    .attr('height', h);

  var g = g1.append('g')
    .attr('transform', (d, i) =>
      d.APU_expand ?
        'translate(0,0)' :
        `translate(${d.Tasks_start ? x(d.Tasks_start) : 0}, 0)`
    )
    .on("mouseover", function(d) {
      tooltip.transition()
        .duration(200)
        .style("opacity", .9);
      tooltip.html(`${d.Tasks_start}, ${d.Tasks_end}<br>${d.APU_id}<br>${d.APU_description}`)
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
      var p = d.APU_id.match(/[.]/g);
      if (d.APU_expand) {
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
    .text(d => d.APU_id);
}

function calculateClass(d) {
  d.APU_id.match(/\d+[.]{0,1}/g).reduce((acc, c, i, arr) => {
    if (arr.length == i + 1) {
      return acc;
    }
    acc += c;
    d3.select(`svg g#tasks g[id="${acc.slice(0, -1)}"]`)
      .classed(d.APU_id, true);
    return acc;
  }, '');
  return `row ${d.APU_id}`;
}
function calculateWidth(d) {
  if (d.APU_expand) {
    return 0;
  }
  if (!d.Tasks_start || !d.Tasks_end) {
    return 0;
  }
  d.APU_id.match(/\d+[.]{0,1}/g).reduce((acc, c, i, arr) => {
    if (arr.length == i + 1) {
      return acc;
    }
    acc += c;
    d3.select(`svg g#tasks g[id="${acc.slice(0, -1)}"] rect.bar`)
      .attr('width', c => {
        if (c.Tasks_start) {
          c.Tasks_start = c.Tasks_start > d.Tasks_start ? new Date(d.Tasks_start) : c.Tasks_start;
        } else {
          if (d.Tasks_start) {
            c.Tasks_start = new Date(d.Tasks_start);
          }
        }
        if (c.Tasks_end) {
          c.Tasks_end = c.Tasks_end < d.Tasks_end ? new Date(d.Tasks_end) : c.Tasks_end;
        } else {
          if (d.Tasks_end) {
            c.Tasks_end = new Date(d.Tasks_end);
          }
        }
        if (c.Tasks_end && c.Tasks_start) {
          return x(c.Tasks_end) - x(c.Tasks_start);
        }
        return 0;
      });
    d3.select(`svg g#tasks g[id="${acc.slice(0, -1)}"] g`)
      .attr('transform', c =>
        `translate(${c.Tasks_start ? x(c.Tasks_start) : 0}, 0)`
      );
    return acc;
  }, '');
  if (d.Tasks_end && d.Tasks_start) {
    return x(d.Tasks_end) - x(d.Tasks_start);
  }
  return 0;
}
})();
